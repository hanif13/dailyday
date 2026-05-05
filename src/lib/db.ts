/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type PaperStyle = 'plain' | 'lined' | 'grid' | 'vintage';

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Entry {
  id: number;
  title: string;
  content: string;
  mood: string;
  paper_style: PaperStyle;
  created_at: string;
  updated_at: string;
  user_id?: string;
  share_token?: string | null;
  is_public?: boolean;
  tags?: Tag[];
}

// ─── Formatting helpers ────────────────────────────────────────────────
// The join query returns tags inside entry_tags
function formatEntry(entry: any): Entry {
  return {
    ...entry,
    tags: entry.entry_tags ? entry.entry_tags.map((et: any) => et.tags) : [],
  };
}

// ─── Auth helper ─────────────────────────────────────────────────────
// Verify user from access token (for API routes)
export async function getUserFromToken(token: string | null): Promise<string | null> {
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user.id;
}

// ─── Entries ─────────────────────────────────────────────────────────

export async function getAllEntries(userId?: string): Promise<Entry[]> {
  let query = supabase
    .from('entries')
    .select(`
      *,
      entry_tags (
        tags (*)
      )
    `)
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('getAllEntries error:', error);
    return [];
  }

  return (data || []).map(formatEntry);
}

export async function getEntryById(id: number): Promise<Entry | null> {
  const { data, error } = await supabase
    .from('entries')
    .select(`
      *,
      entry_tags (
        tags (*)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return formatEntry(data);
}

// Get entry by share token (for public shared pages)
export async function getEntryByShareToken(token: string): Promise<Entry | null> {
  const { data, error } = await supabase
    .from('entries')
    .select(`
      *,
      entry_tags (
        tags (*)
      )
    `)
    .eq('share_token', token)
    .eq('is_public', true)
    .single();

  if (error || !data) return null;
  return formatEntry(data);
}

const TAG_COLORS = [
  '#8b6f47', '#c9a96e', '#7a9e7e', '#6b8cba', '#b06b6b',
  '#9b7bb8', '#c4a35a', '#5a9e8e', '#b87a6e', '#7e8fa8',
];

async function getOrCreateTag(name: string): Promise<Tag> {
  const { data: existing } = await supabase
    .from('tags')
    .select('*')
    .eq('name', name)
    .single();

  if (existing) return existing;

  const color = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
  const { data: newTag, error } = await supabase
    .from('tags')
    .insert([{ name, color }])
    .select()
    .single();

  if (error) throw error;
  return newTag;
}

async function setEntryTags(entryId: number, tagNames: string[]) {
  // Delete existing entry_tags for this entry
  await supabase.from('entry_tags').delete().eq('entry_id', entryId);

  const cleanTags = tagNames.map(t => t.trim()).filter(Boolean);
  if (cleanTags.length === 0) return;

  const entryTagsToInsert = [];
  for (const name of cleanTags) {
    const tag = await getOrCreateTag(name);
    entryTagsToInsert.push({ entry_id: entryId, tag_id: tag.id });
  }

  // Use ignoreDuplicates in case a user inputs same tag twice
  await supabase.from('entry_tags').upsert(entryTagsToInsert, { ignoreDuplicates: true });
}

export async function createEntry(data: {
  title: string;
  content: string;
  mood: string;
  paper_style: PaperStyle;
  tags?: string[];
  user_id?: string;
}): Promise<Entry | null> {
  const insertData: any = {
    title: data.title,
    content: data.content,
    mood: data.mood,
    paper_style: data.paper_style,
  };

  if (data.user_id) {
    insertData.user_id = data.user_id;
  }

  const { data: result, error } = await supabase
    .from('entries')
    .insert([insertData])
    .select()
    .single();

  if (error || !result) {
    console.error('createEntry error:', error);
    return null;
  }

  const id = result.id;

  if (data.tags && data.tags.length > 0) {
    await setEntryTags(id, data.tags);
  }

  return getEntryById(id);
}

export async function updateEntry(id: number, data: {
  title?: string;
  content?: string;
  mood?: string;
  paper_style?: PaperStyle;
  tags?: string[];
}): Promise<Entry | null> {
  const updates: any = { updated_at: new Date().toISOString() };
  if (data.title !== undefined) updates.title = data.title;
  if (data.content !== undefined) updates.content = data.content;
  if (data.mood !== undefined) updates.mood = data.mood;
  if (data.paper_style !== undefined) updates.paper_style = data.paper_style;

  if (Object.keys(updates).length > 1) { // more than just updated_at
    const { error } = await supabase
      .from('entries')
      .update(updates)
      .eq('id', id);
    if (error) console.error('updateEntry error:', error);
  }

  if (data.tags !== undefined) {
    await setEntryTags(id, data.tags);
  }

  return getEntryById(id);
}

export async function deleteEntry(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id);

  return !error;
}

// ─── Share ──────────────────────────────────────────────────────────

export async function createShareToken(entryId: number): Promise<string | null> {
  const token = crypto.randomUUID();
  const { error } = await supabase
    .from('entries')
    .update({ share_token: token, is_public: true })
    .eq('id', entryId);

  if (error) {
    console.error('createShareToken error:', error);
    return null;
  }
  return token;
}

export async function revokeShareToken(entryId: number): Promise<boolean> {
  const { error } = await supabase
    .from('entries')
    .update({ share_token: null, is_public: false })
    .eq('id', entryId);

  return !error;
}

// ─── Tags ──────────────────────────────────────────────────────────

export async function getAllTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true });

  if (error) return [];
  return data;
}

// ─── Feedback ──────────────────────────────────────────────────────

export async function createFeedback(data: {
  user_id?: string;
  message: string;
}): Promise<boolean> {
  const { error } = await supabase
    .from('feedback')
    .insert([data]);

  if (error) {
    console.error('createFeedback error:', error);
    return false;
  }
  return true;
}

// ─── System Tips ───────────────────────────────────────────────────

export interface SystemTip {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export async function getLatestTip(): Promise<SystemTip | null> {
  const { data, error } = await supabase
    .from('system_tips')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getAllTips(): Promise<SystemTip[]> {
  const { data, error } = await supabase
    .from('system_tips')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function createTip(data: { title: string; content: string }): Promise<SystemTip | null> {
  const { data: result, error } = await supabase
    .from('system_tips')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('createTip error:', error);
    return null;
  }
  return result;
}
