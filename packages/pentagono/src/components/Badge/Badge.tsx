import styles from './Badge.module.css';
import type { BadgeProps } from './type';

export function Badge({ children, variant = 'gray' }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>;
}
