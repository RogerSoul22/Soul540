import { useEffect } from 'react';
import styles from './DocumentViewer.module.css';
import type { DocumentViewerProps } from './type';

export function DocumentViewer({
  children,
  label,
  variant = 'fullscreen',
  toolbar,
  actions,
  closeOnOverlay = false,
  className = '',
  onClose,
}: DocumentViewerProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  if (variant === 'panel') {
    return (
      <div className={styles.backdrop} onClick={closeOnOverlay ? onClose : undefined}>
        <div
          className={`${styles.panel} ${className}`}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={(event) => event.stopPropagation()}
        >
          {actions && <div className={styles.actions}>{actions}</div>}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.fullscreen} ${className}`} role="dialog" aria-modal="true" aria-label={label}>
      {toolbar}
      <div className={styles.scroll}>{children}</div>
    </div>
  );
}
