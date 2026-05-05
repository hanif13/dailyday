'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import { SystemTip } from '@/lib/db';
import styles from './SystemTips.module.css';

interface TipsHistoryModalProps {
  onClose: () => void;
  isAdmin: boolean;
  onRefresh: () => void;
}

export default function TipsHistoryModal({ onClose, isAdmin, onRefresh }: TipsHistoryModalProps) {
  const { accessToken } = useAuth();
  const [tips, setTips] = useState<SystemTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTip, setEditingTip] = useState<SystemTip | null>(null);

  // Create form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const res = await fetch('/api/tips?all=true');
      const data = await res.json();
      setTips(data || []);
    } catch (error) {
      console.error('Failed to fetch tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ title, content })
      });

      if (res.ok) {
        setTitle('');
        setContent('');
        setShowForm(false);
        fetchTips();
        onRefresh();
      } else {
        alert('ส่งไม่สำเร็จ');
      }
    } catch {
      alert('เกิดข้อผิดพลาด');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ต้องการลบ Tips นี้ใช่ไหม?')) return;
    try {
      const res = await fetch(`/api/tips/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (res.ok) {
        fetchTips();
        onRefresh();
      } else {
        alert('ลบไม่สำเร็จ');
      }
    } catch {
      alert('เกิดข้อผิดพลาด');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTip) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tips/${editingTip.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ title: editingTip.title, content: editingTip.content })
      });
      if (res.ok) {
        setEditingTip(null);
        fetchTips();
        onRefresh();
      } else {
        alert('แก้ไขไม่สำเร็จ');
      }
    } catch {
      alert('เกิดข้อผิดพลาด');
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <h2 className={styles.modalTitle}>
          {showForm ? '✨ เขียน Tips ใหม่' : editingTip ? '✏️ แก้ไข Tips' : '📜 บันทึกเทคนิคการเขียน'}
        </h2>

        {isAdmin && !showForm && !editingTip && (
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '32px', borderRadius: '12px' }}
            onClick={() => setShowForm(true)}
          >
            ➕ เขียน Tips ใหม่
          </button>
        )}

        {showForm ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              placeholder="หัวข้อ (เช่น วันนี้เขียนอะไรดี?)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={styles.input}
              required
            />
            <textarea
              placeholder="เนื้อหา Tips..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className={styles.textarea}
              rows={6}
              required
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
                ยกเลิก
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submitting}>
                {submitting ? 'กำลังบันทึก...' : 'บันทึกและส่ง'}
              </button>
            </div>
          </form>
        ) : editingTip ? (
          <form onSubmit={handleEdit} className={styles.form}>
            <input
              type="text"
              value={editingTip.title}
              onChange={e => setEditingTip({ ...editingTip, title: e.target.value })}
              className={styles.input}
              required
            />
            <textarea
              value={editingTip.content}
              onChange={e => setEditingTip({ ...editingTip, content: e.target.value })}
              className={styles.textarea}
              rows={6}
              required
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingTip(null)}>
                ยกเลิก
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submitting}>
                {submitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.tipList}>
            {loading ? (
              <p style={{ textAlign: 'center', opacity: 0.5 }}>กำลังโหลด...</p>
            ) : tips.length === 0 ? (
              <p style={{ textAlign: 'center', opacity: 0.5 }}>ยังไม่มีบันทึก</p>
            ) : (
              tips.map(tip => (
                <div key={tip.id} className={styles.tipItem}>
                  <div className={styles.tipHeader}>
                    <h3 className={styles.tipTitle}>{tip.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={styles.tipDate}>
                        {new Date(tip.created_at).toLocaleDateString('th-TH')}
                      </span>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => setEditingTip(tip)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', opacity: 0.6, padding: '2px 6px' }}
                            title="แก้ไข"
                          >✏️</button>
                          <button
                            onClick={() => handleDelete(tip.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', opacity: 0.6, padding: '2px 6px' }}
                            title="ลบ"
                          >🗑️</button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className={styles.tipContent}>{tip.content}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
