import styles from './TagBadge.module.css';

interface TagBadgeProps {
  name: string;
  color?: string;
  active?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export default function TagBadge({
  name,
  color = '#8b6f47',
  active = false,
  onClick,
  size = 'md',
}: TagBadgeProps) {
  return (
    <span
      className={`${styles.tag} ${active ? styles.active : ''} ${styles[size]}`}
      style={
        active
          ? { background: color, color: '#fffef9', borderColor: color }
          : { color, borderColor: color + '60' }
      }
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      # {name}
    </span>
  );
}
