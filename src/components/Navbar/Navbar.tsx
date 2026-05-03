'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Don't show navbar on login page
  if (pathname === '/login') return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/timeline?q=${encodeURIComponent(searchQuery.trim())}`;
    } else {
      window.location.href = '/timeline';
    }
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  // Get display name
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || '';

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <svg className={styles.logoLeaf} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M21 2c-4 0-11 1-15 7s-4 12-4 12 7 1 12-4 7-10 7-15z" fill="#61b136"/>
              <path d="M3 21c3-3 7-7 11-11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className={styles.logoText}>Life Reflection</span>
          </Link>

          <div className={styles.links}>
            <Link
              href="/"
              className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}
            >
              <span className={styles.linkIcon}>✎</span>
              <span>เขียนบันทึก</span>
            </Link>
            <Link
              href="/timeline"
              className={`${styles.link} ${pathname === '/timeline' ? styles.active : ''}`}
            >
              <span className={styles.linkIcon}>◎</span>
              <span>ไทม์ไลน์</span>
            </Link>
          </div>

          {/* Search button */}
          <button
            id="nav-search-btn"
            className={styles.searchBtn}
            onClick={() => setSearchOpen(true)}
            type="button"
            aria-label="ค้นหา"
            title="ค้นหาบันทึก"
          >
            <span>⌕</span>
          </button>

          {/* User area */}
          {!loading && user && (
            <div className={styles.userArea}>
              <span className={styles.userName}>{displayName}</span>
              <button onClick={handleLogout} className={styles.logoutBtn} title="ออกจากระบบ">
                ออก
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Search Modal */}
      {searchOpen && (
        <div className={styles.searchOverlay} onClick={() => setSearchOpen(false)}>
          <div className={styles.searchModal} onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <span className={styles.searchModalIcon}>⌕</span>
              <input
                id="nav-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ค้นหาบันทึก, แท็ก (#แท็ก)..."
                className={styles.searchModalInput}
                autoFocus
                autoComplete="off"
              />
              {searchQuery && (
                <button type="button" className={styles.searchModalClear} onClick={() => setSearchQuery('')}>×</button>
              )}
              <button type="submit" className={`btn btn-primary ${styles.searchModalSubmit}`}>ค้นหา</button>
            </form>
            <p className={styles.searchHint}>กด Enter หรือ Esc เพื่อปิด</p>
          </div>
        </div>
      )}
    </>
  );
}
