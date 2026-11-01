import type { ReactNode } from 'react';
import styles from './Accessibility.module.css';

export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className={styles.visuallyHidden}>{children}</span>;
}
