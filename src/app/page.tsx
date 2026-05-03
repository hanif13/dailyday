'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import FeedbackModal from '@/components/FeedbackModal/FeedbackModal';
import styles from './write.module.css';

const DiaryEditor = dynamic(() => import('@/components/DiaryEditor/DiaryEditor'), { ssr: false });

const MOODS = ['😊', '😔', '😤', '🥰', '😴', '🤔', '😌', '🥺', '🎉', '😤', '☁️', '🌸', '✨', '📝'];

const PAPER_STYLES = [
  { value: 'plain', label: 'เรียบ', icon: '📄' },
  { value: 'lined', label: 'เส้น', icon: '📓' },
  { value: 'grid', label: 'ตาราง', icon: '📐' },
  { value: 'vintage', label: 'วินเทจ', icon: '🌿' },
] as const;

const FONT_OPTIONS = [
  { value: "'Sarabun', sans-serif", label: 'Sarabun', preview: 'ก ข ค', type: 'ไม่มีหัว' },
  { value: "'Noto Sans Thai', sans-serif", label: 'Noto Sans', preview: 'ก ข ค', type: 'ไม่มีหัว' },
  { value: "'Noto Serif Thai', serif", label: 'Noto Serif', preview: 'ก ข ค', type: 'มีหัว' },
  { value: "'Prompt', sans-serif", label: 'Prompt', preview: 'ก ข ค', type: 'โมเดิร์น' },
  { value: "'Kanit', sans-serif", label: 'Kanit', preview: 'ก ข ค', type: 'โดดเด่น' },
] as const;

type PaperStyle = 'plain' | 'lined' | 'grid' | 'vintage';

interface Draft {
  id: string;
  title: string;
  content: string;
  mood: string;
  paperStyle: PaperStyle;
  tags: string[];
  fontFamily: string;
  updatedAt: string;
}

const DRAFT_KEY = 'life_reflection_drafts';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, accessToken } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('📝');
  const [paperStyle, setPaperStyle] = useState<PaperStyle>('plain');
  const [fontFamily, setFontFamily] = useState<string>(FONT_OPTIONS[0].value);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [showDraftSelection, setShowDraftSelection] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // ── Load Drafts ──
  useEffect(() => {
    let loadedDrafts: Draft[] = [];

    const draftsData = localStorage.getItem(DRAFT_KEY);
    if (draftsData) {
      try {
        loadedDrafts = JSON.parse(draftsData);
      } catch {}
    }

    // Migrate old single draft
    const oldDraft = localStorage.getItem('life_reflection_draft');
    if (oldDraft) {
      try {
        const parsedOld = JSON.parse(oldDraft);
        if (parsedOld.content || parsedOld.title) {
          loadedDrafts.push({
            id: Date.now().toString(),
            title: parsedOld.title,
            content: parsedOld.content,
            mood: parsedOld.mood,
            paperStyle: parsedOld.paperStyle,
            tags: parsedOld.tags,
            fontFamily: FONT_OPTIONS[0].value,
            updatedAt: new Date().toISOString(),
          });
          localStorage.removeItem('life_reflection_draft');
          localStorage.setItem(DRAFT_KEY, JSON.stringify(loadedDrafts));
        }
      } catch {}
    }

    setDrafts(loadedDrafts);
  }, []);

  const loadDraft = (draftId: string) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (draft) {
      setCurrentDraftId(draft.id);
      setTitle(draft.title || '');
      setContent(draft.content || '');
      setMood(draft.mood || '📝');
      setPaperStyle(draft.paperStyle || 'plain');
      setFontFamily(draft.fontFamily || FONT_OPTIONS[0].value);
      setTags(draft.tags || []);
      setShowDraftSelection(false);
    }
  };

  const deleteDraft = (e: React.MouseEvent, draftId: string) => {
    e.stopPropagation();
    if (confirm('คุณต้องการลบแบบร่างนี้ใช่หรือไม่?')) {
      setDrafts((prev) => {
        const newDrafts = prev.filter((d) => d.id !== draftId);
        localStorage.setItem(DRAFT_KEY, JSON.stringify(newDrafts));
        return newDrafts;
      });
      if (currentDraftId === draftId) {
        setCurrentDraftId(null);
      }
    }
  };

  // ── Auto Save Draft ──
  useEffect(() => {
    if (title || content || tags.length > 0) {
      const timer = setTimeout(() => {
        setDrafts((prevDrafts) => {
          const now = new Date().toISOString();
          const draftId = currentDraftId || Date.now().toString();

          if (!currentDraftId) {
            setCurrentDraftId(draftId);
          }

          const existingIndex = prevDrafts.findIndex((d) => d.id === draftId);
          const newDraft: Draft = { id: draftId, title, content, mood, paperStyle, fontFamily, tags, updatedAt: now };

          const newDrafts = [...prevDrafts];
          if (existingIndex >= 0) {
            newDrafts[existingIndex] = newDraft;
          } else {
            newDrafts.unshift(newDraft);
          }

          localStorage.setItem(DRAFT_KEY, JSON.stringify(newDrafts));
          return newDrafts;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [title, content, mood, paperStyle, fontFamily, tags, currentDraftId]);

  // ── Tags ──
  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const t = tagInput.trim().replace(/^#/, '');
      if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
      setTagInput('');
    }
  };

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t));

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
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ title, content, mood, paper_style: paperStyle, tags }),
      });
      const entry = await res.json();

      if (currentDraftId) {
        setDrafts((prev) => {
          const newDrafts = prev.filter((d) => d.id !== currentDraftId);
          localStorage.setItem(DRAFT_KEY, JSON.stringify(newDrafts));
          return newDrafts;
        });
      }

      router.push(`/entry/${entry.id}`);
    } catch {
      alert('บันทึกล้มเหลว');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px' }}>
        <div style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-200)', fontSize: '1.2rem', fontStyle: 'italic' }}>
          กำลังโหลด...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={styles.page}>
      {/* Sidebar controls */}
      <aside className={styles.sidebar}>
        <div className={styles.sideCard}>
          {drafts.length > 0 && !currentDraftId && (
            <div className={styles.draftNotice}>
              <p>พบแบบร่างที่คุณเขียนค้างไว้ ({drafts.length} รายการ)</p>
              {!showDraftSelection ? (
                <button onClick={() => setShowDraftSelection(true)} className="btn btn-secondary" style={{ width: '100%' }}>
                  เลือกแบบร่างเพื่อเขียนต่อ
                </button>
              ) : (
                <div className={styles.draftList}>
                  {drafts.map((d) => (
                    <div key={d.id} className={styles.draftItemWrapper}>
                      <button onClick={() => loadDraft(d.id)} className={styles.draftItemBtn}>
                        <span className={styles.draftItemMood}>{d.mood || '📝'}</span>
                        <div className={styles.draftItemInfo}>
                          <span className={styles.draftItemTitle}>{d.title || 'ไม่มีชื่อ'}</span>
                          <span className={styles.draftItemDate}>{new Date(d.updatedAt).toLocaleString('th-TH')}</span>
                        </div>
                      </button>
                      <button onClick={(e) => deleteDraft(e, d.id)} className={styles.draftItemDelete} title="ลบแบบร่าง">
                        ✕
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setShowDraftSelection(false)} className="btn" style={{ width: '100%', marginTop: '8px', fontSize: '0.8rem' }}>
                    ปิด
                  </button>
                </div>
              )}
            </div>
          )}

          <div className={styles.sideSection}>
            <label htmlFor="entry-title">ชื่อบันทึก</label>
            <input
              id="entry-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="วันที่ฉันรู้สึก..."
            />
          </div>

          {/* Mood picker */}
          <div className={styles.sideSection}>
            <label>อารมณ์วันนี้</label>
            <div className={styles.moodGrid}>
              {MOODS.map((m) => (
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
              {PAPER_STYLES.map((ps) => (
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

          {/* Font picker */}
          <div className={styles.sideSection}>
            <label>ฟอนต์</label>
            <div className={styles.fontGrid}>
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={`${styles.fontBtn} ${fontFamily === f.value ? styles.fontActive : ''}`}
                  onClick={() => setFontFamily(f.value)}
                  title={f.type}
                >
                  <span className={styles.fontPreview} style={{ fontFamily: f.value }}>
                    {f.preview}
                  </span>
                  <span className={styles.fontLabel}>{f.label}</span>
                  <span className={styles.fontType}>{f.type}</span>
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
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="พิมพ์แล้วกด Enter..."
            />
            {tags.length > 0 && (
              <div className={styles.tagList}>
                {tags.map((t) => (
                  <span key={t} className={styles.tagChip}>
                    #{t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className={styles.tagRemove}
                      aria-label={`Remove ${t}`}
                    >
                      ×
                    </button>
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

          {/* Feedback + Privacy */}
          <div className={styles.bottomSection}>
            <button
              type="button"
              className={styles.feedbackBtn}
              onClick={() => setShowFeedback(true)}
            >
              💬 สิ่งที่อยากบอกทีมงาน
            </button>

            <p className={styles.privacyText}>
              🔒 บันทึกของคุณเป็นส่วนตัว — มีเพียงคุณเท่านั้นที่อ่านได้
              เว้นแต่คุณเลือก &quot;แชร์&quot; เอง
              ข้อมูลทั้งหมดถูกเก็บอย่างปลอดภัยและจะไม่ถูกเปิดเผยแก่บุคคลอื่น
            </p>
          </div>
        </div>
      </aside>

      {/* Editor area */}
      <main className={styles.editorArea}>
        <div className={styles.editorHeader}>
          <span className={styles.editorMood}>{mood}</span>
          <h2 className={styles.editorTitle}>{title || 'เริ่มจดบันทึกใหม่...'}</h2>
          <span className={styles.editorDate}>
            {new Date().toLocaleDateString('th-TH', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        <DiaryEditor content={content} onChange={setContent} paperStyle={paperStyle} fontFamily={fontFamily} />
      </main>

      {/* Feedback Modal */}
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </div>
  );
}
