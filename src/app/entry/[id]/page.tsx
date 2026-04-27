'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Entry } from '@/lib/db';
import TagBadge from '@/components/TagBadge/TagBadge';
import styles from './entry.module.css';

const DiaryEditor = dynamic(() => import('@/components/DiaryEditor/DiaryEditor'), { ssr: false });

const MOODS = ['😊', '😔', '😤', '🥰', '😴', '🤔', '😌', '🥺', '🎉', '😤', '☁️', '🌸', '✨', '📝'];
const PAPER_STYLES = [
  { value: 'plain', label: 'เรียบ', icon: '📄' },
  { value: 'lined', label: 'เส้น', icon: '📓' },
  { value: 'grid', label: 'ตาราง', icon: '📐' },
  { value: 'vintage', label: 'วินเทจ', icon: '🌿' },
] as const;
type PaperStyle = 'plain' | 'lined' | 'grid' | 'vintage';

const MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

export default function EntryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('📝');
  const [paperStyle, setPaperStyle] = useState<PaperStyle>('plain');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/entries/${params.id}`)
      .then(r => r.json())
      .then((e: Entry) => {
        setEntry(e);
        setTitle(e.title);
        setContent(e.content);
        setMood(e.mood);
        setPaperStyle(e.paper_style as PaperStyle);
        setTags(e.tags?.map(t => t.name) || []);
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/entries/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, mood, paper_style: paperStyle, tags }),
      });
      const updated: Entry = await res.json();
      setEntry(updated);
      setEditing(false);
    } catch { alert('บันทึกล้มเหลว'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm('ต้องการลบบันทึกนี้ใช่ไหม?')) return;
    setDeleting(true);
    await fetch(`/api/entries/${params.id}`, { method: 'DELETE' });
    router.push('/');
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const t = tagInput.trim().replace(/^#/, '');
      if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
      setTagInput('');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '120px' }}>
      <div style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-200)', fontSize: '1.2rem', fontStyle: 'italic' }}>กำลังโหลด...</div>
    </div>
  );

  if (!entry) return null;

  const d = new Date(entry.created_at);
  const dateStr = `${d.getDate()} ${MONTHS_TH[d.getMonth()]} ${d.getFullYear() + 543}`;
  const timeStr = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={styles.page}>
      {/* Header bar */}
      <div className={styles.topBar}>
        <Link href="/" className="btn btn-ghost" id="back-btn">
          ← กลับ
        </Link>
        <div className={styles.topActions}>
          {editing ? (
            <>
              <button
                id="cancel-edit"
                type="button"
                className="btn btn-ghost"
                onClick={() => { setEditing(false); setTitle(entry.title); setContent(entry.content); setMood(entry.mood); setPaperStyle(entry.paper_style as PaperStyle); setTags(entry.tags?.map(t => t.name) || []); }}
              >
                ยกเลิก
              </button>
              <button id="save-edit" type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '⏳...' : '✓ บันทึก'}
              </button>
            </>
          ) : (
            <>
              <button id="edit-btn" type="button" className="btn btn-secondary" onClick={() => setEditing(true)}>
                ✎ แก้ไข
              </button>
              <button id="delete-btn" type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? '...' : '✕ ลบ'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.layout}>
        {/* Main content */}
        <article className={styles.article}>
          {/* Entry header */}
          <div className={styles.entryHeader}>
            <div className={styles.entryMeta}>
              <span className={styles.mood}>{editing ? mood : entry.mood}</span>
              <div>
                <div className={styles.dateStr}>{dateStr} · {timeStr}</div>
                {entry.tags && entry.tags.length > 0 && !editing && (
                  <div className={styles.entryTags}>
                    {entry.tags.map(t => (
                      <TagBadge key={t.id} name={t.name} color={t.color} size="sm" />
                    ))}
                  </div>
                )}
              </div>
            </div>
            {editing ? (
              <input
                id="edit-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={styles.titleInput}
                placeholder="ชื่อบันทึก..."
              />
            ) : (
              <h1 className={styles.entryTitle}>{entry.title || 'ไม่มีชื่อ'}</h1>
            )}
          </div>

          {/* Editor / Read view */}
          {editing ? (
            <DiaryEditor content={content} onChange={setContent} paperStyle={paperStyle} />
          ) : (
            <div className={`${styles.readView} paper-${entry.paper_style}`}>
              <div
                className={styles.readContent}
                dangerouslySetInnerHTML={{ __html: entry.content || '<p style="color:var(--ink-200);font-style:italic">ยังไม่มีเนื้อหา</p>' }}
              />
            </div>
          )}

        </article>

        {/* Sidebar (edit mode) */}
        {editing && (
          <aside className={styles.sidebar}>
            <div className={styles.sideSection}>
              <label>อารมณ์</label>
              <div className={styles.moodGrid}>
                {MOODS.map(m => (
                  <button key={m} type="button" className={`${styles.moodBtn} ${mood === m ? styles.moodActive : ''}`} onClick={() => setMood(m)}>{m}</button>
                ))}
              </div>
            </div>

            <div className={styles.sideSection}>
              <label>สไตล์กระดาษ</label>
              <div className={styles.paperGrid}>
                {PAPER_STYLES.map(ps => (
                  <button key={ps.value} type="button" className={`${styles.paperBtn} ${paperStyle === ps.value ? styles.paperActive : ''}`} onClick={() => setPaperStyle(ps.value)}>
                    <span>{ps.icon}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--ink-300)' }}>{ps.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.sideSection}>
              <label htmlFor="edit-tag-input">แท็ก</label>
              <input id="edit-tag-input" type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="พิมพ์แล้วกด Enter..." />
              <div className={styles.tagList}>
                {tags.map(t => (
                  <span key={t} className={styles.tagChip}>
                    #{t}
                    <button type="button" onClick={() => setTags(p => p.filter(x => x !== t))} className={styles.tagRemove}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
