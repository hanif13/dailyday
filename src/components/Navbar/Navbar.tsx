'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <span className={styles.logoText}>Daily Day</span>
        </Link>

        <div className={styles.links}>
          <Link
            href="/"
            className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}
          >
            <span className={styles.linkIcon}>◎</span>
            <span>ไทม์ไลน์</span>
          </Link>
        </div>

        {/* Write button */}
        <Link href="/write" className={`btn btn-primary ${styles.writeBtn}`}>
          <span>✎</span>
          <span>เขียนใหม่</span>
        </Link>
      </div>
    </nav>
  );
}
