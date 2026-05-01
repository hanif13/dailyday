'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Entry, Tag } from '@/lib/db';
import Timeline from '@/components/Timeline/Timeline';
import TagBadge from '@/components/TagBadge/TagBadge';
import styles from './timeline.module.css';

export default function TimelinePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [activeTag, setActiveTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/entries');
      const data: Entry[] = await res.json();
      setEntries(data);
      const tagMap = new Map<string, Tag>();
      data.forEach(e => e.tags?.forEach(t => tagMap.set(t.name, t)));
      setAllTags(Array.from(tagMap.values()));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    // Check for search query in URL
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) setSearchQuery(q);
    
    fetchEntries(); 
  }, [fetchEntries]);

  // Filter by tag AND search query
  const filteredEntries = entries.filter(e => {
    const matchTag = !activeTag || e.tags?.some(t => t.name === activeTag);
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q ||
      e.title.toLowerCase().includes(q) ||
      e.content.replace(/<[^>]*>/g, ' ').toLowerCase().includes(q) ||
      e.mood.includes(q) ||
      e.tags?.some(t => t.name.toLowerCase().includes(q));
    return matchTag && matchSearch;
  });

  const handleTagClick = (tag: string) => {
    setActiveTag(prev => prev === tag ? '' : tag);
  };

  const totalWords = entries.reduce((sum, e) => {
    const txt = e.content.replace(/<[^>]*>/g, ' ').trim();
    return sum + txt.split(/\s+/).filter(Boolean).length;
  }, 0);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerLeft}>
            <p className={styles.headerDate}>
              {new Date().toLocaleDateString('th-TH', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
            <h1 className={styles.headerTitle}>เส้นทางประสบการณ์ของเรา</h1>
          </div>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statNum}>{entries.length}</span>
              <span className={styles.statLabel}>รายการ</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNum}>{allTags.length}</span>
              <span className={styles.statLabel}>แท็ก</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNum}>{totalWords.toLocaleString()}</span>
              <span className={styles.statLabel}>คำ</span>
            </div>
          </div>
        </div>

        {/* ── Tag filter chips ── */}
        <div className={styles.tagBar}>
          <button
            id="filter-all"
            className={`${styles.allBtn} ${!activeTag ? styles.allBtnActive : ''}`}
            onClick={() => setActiveTag('')}
          >
            ทั้งหมด
          </button>
          {allTags.map(tag => (
            <TagBadge
              key={tag.id}
              name={tag.name}
              color={tag.color}
              active={activeTag === tag.name}
              onClick={() => handleTagClick(tag.name)}
            />
          ))}
        </div>

        {/* Result info when filtering */}
        {(searchQuery || activeTag) && (
          <div className={styles.resultInfo}>
            พบ <strong>{filteredEntries.length}</strong> รายการ
            {activeTag && <> · แท็ก <span style={{ color: allTags.find(t => t.name === activeTag)?.color }}># {activeTag}</span></>}
            {searchQuery && !searchQuery.startsWith('#') && <> &middot; &quot;{searchQuery}&quot;</>}
            <button className={styles.clearSearch} onClick={() => {setSearchQuery(''); setActiveTag(''); window.history.replaceState({}, '', '/timeline');}}>ล้างการค้นหา</button>
          </div>
        )}
      </header>

      <section className={styles.timelineSection}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingDots}><span /><span /><span /></div>
          </div>
        ) : (
          <Timeline
            entries={filteredEntries}
            activeTag={activeTag}
            onTagClick={handleTagClick}
          />
        )}
      </section>
    </div>
  );
}
