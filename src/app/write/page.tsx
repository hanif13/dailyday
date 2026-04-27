'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import styles from './write.module.css';

const DiaryEditor = dynamic(() => import('@/components/DiaryEditor/DiaryEditor'), { ssr: false });

const MOODS = ['😊', '😔', '😤', '🥰', '😴', '🤔', '😌', '🥺', '🎉', '😤', '☁️', '🌸', '✨', '📝'];

const PAPER_STYLES = [
  { value: 'plain', label: 'เรียบ', icon: '📄' },
  { value: 'lined', label: 'เส้น', icon: '📓' },
  { value: 'grid', label: 'ตาราง', icon: '📐' },
  { value: 'vintage', label: 'วินเทจ', icon: '🌿' },
] as const;

type PaperStyle = 'plain' | 'lined' | 'grid' | 'vintage';

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('📝');
  const [paperStyle, setPaperStyle] = useState<PaperStyle>('plain');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // ── Tags ──
  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const t = tagInput.trim().replace(/^#/, '');
      if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
      setTagInput('');
    }
  };

  const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

  // ── Save ──
  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      alert('กรุณาใส่ชื่อหรือเนื้อหา');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, mood, paper_style: paperStyle, tags }),
      });
      const entry = await res.json();
      router.push(`/entry/${entry.id}`);
    } catch (e) {
      alert('บันทึกล้มเหลว');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Sidebar controls */}
      <aside className={styles.sidebar}>
        <div className={styles.sideCard}>
          <div className={styles.sideSection}>
            <label htmlFor="entry-title">ชื่อบันทึก</label>
            <input
              id="entry-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="วันที่ฉันรู้สึก..."
            />
          </div>

          {/* Mood picker */}
          <div className={styles.sideSection}>
            <label>อารมณ์วันนี้</label>
            <div className={styles.moodGrid}>
              {MOODS.map(m => (
                <button
                  key={m}
                  id={`mood-${m}`}
                  type="button"
                  className={`${styles.moodBtn} ${mood === m ? styles.moodActive : ''}`}
                  onClick={() => setMood(m)}
                  title={m}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Paper style */}
          <div className={styles.sideSection}>
            <label>สไตล์กระดาษ</label>
            <div className={styles.paperGrid}>
              {PAPER_STYLES.map(ps => (
                <button
                  key={ps.value}
                  id={`paper-${ps.value}`}
                  type="button"
                  className={`${styles.paperBtn} ${paperStyle === ps.value ? styles.paperActive : ''}`}
                  onClick={() => setPaperStyle(ps.value)}
                >
                  <span className={styles.paperIcon}>{ps.icon}</span>
                  <span className={styles.paperLabel}>{ps.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className={styles.sideSection}>
            <label htmlFor="tag-input">แท็ก</label>
            <input
              id="tag-input"
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="พิมพ์แล้วกด Enter..."
            />
            {tags.length > 0 && (
              <div className={styles.tagList}>
                {tags.map(t => (
                  <span key={t} className={styles.tagChip}>
                    #{t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className={styles.tagRemove}
                      aria-label={`Remove ${t}`}
                    >×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Save */}
          <button
            id="save-entry"
            type="button"
            className={`btn btn-primary ${styles.saveBtn}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '⏳ กำลังบันทึก...' : '✓ บันทึก'}
          </button>
        </div>
      </aside>

      {/* Editor area */}
      <main className={styles.editorArea}>
        <div className={styles.editorHeader}>
          <span className={styles.editorMood}>{mood}</span>
          <h2 className={styles.editorTitle}>{title || 'บันทึกใหม่'}</h2>
          <span className={styles.editorDate}>
            {new Date().toLocaleDateString('th-TH', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </span>
        </div>

        <DiaryEditor
          content={content}
          onChange={setContent}
          paperStyle={paperStyle}
        />
      </main>
    </div>
  );
}
