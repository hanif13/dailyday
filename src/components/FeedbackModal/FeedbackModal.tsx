'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './FeedbackModal.module.css';

interface FeedbackModalProps {
  onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const { accessToken } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        setError('ส่งไม่สำเร็จ กรุณาลองใหม่');
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} title="ปิด">×</button>

        <h2 className={styles.title}>💬 สิ่งที่อยากบอกทีมงาน</h2>
        <p className={styles.subtitle}>
          แนะนำ ติชม หรือแจ้งปัญหาการใช้งาน ทีมงานจะอ่านทุกข้อความครับ
        </p>

        {sent ? (
          <div className={styles.successBox}>
            <span className={styles.successIcon}>✓</span>
            <p>ส่งข้อความเรียบร้อยแล้ว ขอบคุณสำหรับ Feedback!</p>
            <button className="btn btn-secondary" onClick={onClose} style={{ marginTop: '12px' }}>ปิด</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="เขียนสิ่งที่อยากบอกทีมงาน..."
              className={styles.textarea}
              rows={5}
              maxLength={2000}
              autoFocus
            />
            <div className={styles.charCount}>{message.length}/2000</div>
            {error && <div className={styles.errorMsg}>⚠ {error}</div>}
            <button
              type="submit"
              className={`btn btn-primary ${styles.sendBtn}`}
              disabled={sending || !message.trim()}
            >
              {sending ? '⏳ กำลังส่ง...' : '📨 ส่ง Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
