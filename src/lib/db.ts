import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'diary.db');

let db: Database.Database;

function getDB(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      mood TEXT DEFAULT '📝',
      paper_style TEXT DEFAULT 'plain',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#8b6f47'
    );

    CREATE TABLE IF NOT EXISTS entry_tags (
      entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (entry_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `);
}

export type PaperStyle = 'plain' | 'lined' | 'grid' | 'vintage';

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Image {
  id: number;
  entry_id: number;
  filename: string;
  original_name: string;
  created_at: string;
}

export interface Entry {
  id: number;
  title: string;
  content: string;
  mood: string;
  paper_style: PaperStyle;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
  images?: Image[];
}

// ─── Entries ─────────────────────────────────────────────────────

export function getAllEntries(): Entry[] {
  const db = getDB();
  const entries = db.prepare(`
    SELECT * FROM entries ORDER BY created_at DESC
  `).all() as Entry[];

  return entries.map(entry => ({
    ...entry,
    tags: getEntryTags(entry.id),
    images: getEntryImages(entry.id),
  }));
}

export function getEntryById(id: number): Entry | null {
  const db = getDB();
  const entry = db.prepare('SELECT * FROM entries WHERE id = ?').get(id) as Entry | undefined;
  if (!entry) return null;
  return {
    ...entry,
    tags: getEntryTags(id),
    images: getEntryImages(id),
  };
}

export function createEntry(data: {
  title: string;
  content: string;
  mood: string;
  paper_style: PaperStyle;
  tags?: string[];
}): Entry {
  const db = getDB();
  const result = db.prepare(`
    INSERT INTO entries (title, content, mood, paper_style)
    VALUES (?, ?, ?, ?)
  `).run(data.title, data.content, data.mood, data.paper_style);

  const id = result.lastInsertRowid as number;

  if (data.tags && data.tags.length > 0) {
    setEntryTags(id, data.tags);
  }

  return getEntryById(id)!;
}

export function updateEntry(id: number, data: {
  title?: string;
  content?: string;
  mood?: string;
  paper_style?: PaperStyle;
  tags?: string[];
}): Entry | null {
  const db = getDB();
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
  if (data.content !== undefined) { fields.push('content = ?'); values.push(data.content); }
  if (data.mood !== undefined) { fields.push('mood = ?'); values.push(data.mood); }
  if (data.paper_style !== undefined) { fields.push('paper_style = ?'); values.push(data.paper_style); }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now', 'localtime')");
    values.push(id);
    db.prepare(`UPDATE entries SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  if (data.tags !== undefined) {
    setEntryTags(id, data.tags);
  }

  return getEntryById(id);
}

export function deleteEntry(id: number): boolean {
  const db = getDB();
  // Delete associated images from disk
  const images = getEntryImages(id);
  images.forEach(img => {
    const filePath = path.join(process.cwd(), 'public', 'uploads', img.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });
  const result = db.prepare('DELETE FROM entries WHERE id = ?').run(id);
  return result.changes > 0;
}

// ─── Tags ──────────────────────────────────────────────────────────

export function getAllTags(): Tag[] {
  const db = getDB();
  return db.prepare('SELECT * FROM tags ORDER BY name ASC').all() as Tag[];
}

export function getEntryTags(entryId: number): Tag[] {
  const db = getDB();
  return db.prepare(`
    SELECT t.* FROM tags t
    JOIN entry_tags et ON et.tag_id = t.id
    WHERE et.entry_id = ?
  `).all(entryId) as Tag[];
}

const TAG_COLORS = [
  '#8b6f47', '#c9a96e', '#7a9e7e', '#6b8cba', '#b06b6b',
  '#9b7bb8', '#c4a35a', '#5a9e8e', '#b87a6e', '#7e8fa8',
];

function getOrCreateTag(name: string): Tag {
  const db = getDB();
  const existing = db.prepare('SELECT * FROM tags WHERE name = ?').get(name) as Tag | undefined;
  if (existing) return existing;

  const color = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
  const result = db.prepare('INSERT INTO tags (name, color) VALUES (?, ?)').run(name, color);
  return { id: result.lastInsertRowid as number, name, color };
}

function setEntryTags(entryId: number, tagNames: string[]) {
  const db = getDB();
  db.prepare('DELETE FROM entry_tags WHERE entry_id = ?').run(entryId);
  for (const name of tagNames) {
    if (!name.trim()) continue;
    const tag = getOrCreateTag(name.trim());
    db.prepare('INSERT OR IGNORE INTO entry_tags (entry_id, tag_id) VALUES (?, ?)').run(entryId, tag.id);
  }
}

// ─── Images ────────────────────────────────────────────────────────

export function getEntryImages(entryId: number): Image[] {
  const db = getDB();
  return db.prepare('SELECT * FROM images WHERE entry_id = ? ORDER BY created_at ASC').all(entryId) as Image[];
}

export function getAllImages(): (Image & { entry_title: string })[] {
  const db = getDB();
  return db.prepare(`
    SELECT i.*, e.title as entry_title FROM images i
    LEFT JOIN entries e ON e.id = i.entry_id
    ORDER BY i.created_at DESC
  `).all() as (Image & { entry_title: string })[];
}

export function addImage(entryId: number | null, filename: string, originalName: string): Image {
  const db = getDB();
  const result = db.prepare(
    'INSERT INTO images (entry_id, filename, original_name) VALUES (?, ?, ?)'
  ).run(entryId, filename, originalName);
  return db.prepare('SELECT * FROM images WHERE id = ?').get(result.lastInsertRowid) as Image;
}
