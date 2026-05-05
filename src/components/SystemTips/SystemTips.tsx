'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SystemTip } from '@/lib/db';
import styles from './SystemTips.module.css';
import TipsHistoryModal from './TipsHistoryModal';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function SystemTips() {
  const { user } = useAuth();
  const [latestTip, setLatestTip] = useState<SystemTip | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const fetchLatest = async () => {
    try {
      const res = await fetch('/api/tips');
      const data = await res.json();
      setLatestTip(data);
    } catch (error) {
      console.error('Failed to fetch latest tip:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  if (loading) return null;
  if (!latestTip && !isAdmin) return null;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <span>✨</span>
            {latestTip?.title || 'ข้อความจากทีมงาน'}
          </h3>
          {isAdmin && (
            <button 
              className={styles.adminAddBtn} 
              onClick={() => setShowHistory(true)}
              title="เพิ่ม Tips ใหม่"
            >
              +
            </button>
          )}
        </div>
        
        {latestTip ? (
          <p className={styles.content}>{latestTip.content}</p>
        ) : (
          <p className={styles.content} style={{ opacity: 0.5, fontStyle: 'italic' }}>
            ยังไม่มีเทคนิคการเขียนในขณะนี้
          </p>
        )}

        <div className={styles.footer}>
          <button className={styles.historyBtn} onClick={() => setShowHistory(true)}>
            คลังเทคนิค ↗
          </button>
        </div>
      </div>

      {showHistory && (
        <TipsHistoryModal 
          onClose={() => setShowHistory(false)} 
          isAdmin={isAdmin}
          onRefresh={fetchLatest}
        />
      )}
    </>
  );
}
