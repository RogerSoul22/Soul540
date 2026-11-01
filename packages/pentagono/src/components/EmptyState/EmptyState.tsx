import styles from './EmptyState.module.css';
import type { EmptyStateProps } from './type';

export function EmptyState({
  icon,
  title,
  description,
  action,
  children,
  variant = 'default',
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`${styles.empty} ${styles[variant]} ${className}`.trim()}>
      {icon}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {children}
      {action}
    </div>
  );
}
