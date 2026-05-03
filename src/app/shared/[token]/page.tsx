'use client';
import { useEffect, useState } from 'react';
import type { Entry } from '@/lib/db';
import TagBadge from '@/components/TagBadge/TagBadge';
import styles from './shared.module.css';

const MONTHS_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

export default function SharedPage({ params }: { params: { token: string } }) {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/shared/${params.token}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then((data: Entry) => setEntry(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.token]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>กำลังโหลด...</div>
      </div>
    );
  }

  if (notFound || !entry) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h2>ไม่พบบันทึก</h2>
          <p>ลิงก์นี้อาจไม่ถูกต้อง หรือเจ้าของได้ยกเลิกการแชร์แล้ว</p>
        </div>
      </div>
    );
  }

  const d = new Date(entry.created_at);
  const dateStr = `${d.getDate()} ${MONTHS_TH[d.getMonth()]} ${d.getFullYear() + 543}`;

  return (
    <div className={styles.page}>
      <article className={styles.card}>
        <div className={styles.sharedBadge}>
          🔗 บันทึกที่ถูกแชร์
        </div>

        <div className={styles.header}>
          <span className={styles.mood}>{entry.mood}</span>
          <h1 className={styles.title}>{entry.title || 'ไม่มีชื่อ'}</h1>
          <p className={styles.date}>{dateStr}</p>
          {entry.tags && entry.tags.length > 0 && (
            <div className={styles.tags}>
              {entry.tags.map((t) => (
                <TagBadge key={t.id} name={t.name} color={t.color} size="sm" />
              ))}
            </div>
          )}
        </div>

        <div
          className={`${styles.content} paper-${entry.paper_style}`}
          dangerouslySetInnerHTML={{ __html: entry.content || '<p style="color:var(--ink-200);font-style:italic">ยังไม่มีเนื้อหา</p>' }}
        />

        <div className={styles.footer}>
          <p>เขียนด้วย Life Reflection 🌿</p>
        </div>
      </article>
    </div>
  );
}
