'use client';
import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import type { Entry } from '@/lib/db';
import TagBadge from '@/components/TagBadge/TagBadge';
import styles from './Timeline.module.css';

interface TimelineProps {
  entries: Entry[];
  activeTag?: string;
  onTagClick?: (tag: string) => void;
}

const MONTHS_TH = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: d.getDate(),
    month: MONTHS_TH[d.getMonth()],
    year: d.getFullYear() + 543,
  };
}

function stripHtml(html: string, maxLen = 100) {
  const txt = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return txt.length > maxLen ? txt.slice(0, maxLen) + '…' : txt;
}

const PAPER_LABELS: Record<string, string> = {
  plain: '📄', lined: '📓', grid: '📐', vintage: '🌿',
};

export default function Timeline({ entries, activeTag, onTagClick }: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollLeft - (x - startX) * 1.2;
  }, [isDragging, startX, scrollLeft]);

  const stopDrag = useCallback(() => setIsDragging(false), []);

  if (entries.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>✦</div>
        <h3>ยังไม่มีบันทึก</h3>
        <p>เริ่มเขียนไดอารี่วันแรกของคุณ</p>
        <Link href="/write" className="btn btn-primary">เขียนเลย</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.hints}>
        <span className={styles.hint}>← เก่ากว่า</span>
        <span className={styles.hint}>ล่าสุด →</span>
      </div>

      <div
        className={`${styles.track} ${isDragging ? styles.dragging : ''}`}
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <div className={styles.spacer} />

        {[...entries].reverse().map((entry, idx) => {
          const date = formatDate(entry.created_at);
          const preview = stripHtml(entry.content);
          const isAbove = idx % 2 === 0;

          const card = (
            <div className={styles.card}>
              <div className={styles.paperBadge} title={entry.paper_style}>
                {PAPER_LABELS[entry.paper_style] || '📄'}
              </div>
              <div className={styles.cardHead}>
                <span className={styles.mood}>{entry.mood}</span>
                <h3 className={styles.title}>{entry.title || 'ไม่มีชื่อ'}</h3>
              </div>
              {preview && <p className={styles.preview}>{preview}</p>}
              {entry.tags && entry.tags.length > 0 && (
                <div className={styles.tags}>
                  {entry.tags.map(tag => (
                    <TagBadge
                      key={tag.id}
                      name={tag.name}
                      color={tag.color}
                      size="sm"
                      active={activeTag === tag.name}
                      onClick={() => onTagClick?.(tag.name)}
                    />
                  ))}
                </div>
              )}
              <Link href={`/entry/${entry.id}`} className={styles.readMore}>
                อ่านต่อ →
              </Link>
            </div>
          );

          return (
            <div
              key={entry.id}
              className={styles.item}
              style={{ animationDelay: `${idx * 0.06}s` }}
            >
              {/* Top slot — card if above, empty if below */}
              <div className={styles.slotTop}>
                {isAbove && card}
              </div>

              {/* Connector line between card and dot */}
              <div className={styles.connector} />

              {/* Timeline node */}
              <div className={styles.node}>
                <div className={styles.dot} />
                <div className={styles.dateLabel}>
                  <span className={styles.day}>{date.day}</span>
                  <span className={styles.month}>{date.month}</span>
                  <span className={styles.year}>{date.year}</span>
                </div>
              </div>

              {/* Bottom connector */}
              <div className={styles.connector} />

              {/* Bottom slot — empty if above, card if below */}
              <div className={styles.slotBottom}>
                {!isAbove && card}
              </div>
            </div>
          );
        })}

        <div className={styles.spacer} />
      </div>
    </div>
  );
}
