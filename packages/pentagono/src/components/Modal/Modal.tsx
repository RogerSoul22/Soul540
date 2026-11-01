import { useEffect, useId } from 'react';
import styles from './Modal.module.css';
import type { ModalProps } from './type';

export function Modal({
  children,
  title,
  size = 'md',
  maxWidth,
  subtitle,
  headerActions,
  flush = false,
  closeOnOverlay = false,
  className = '',
  onClose,
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={closeOnOverlay ? onClose : undefined}>
      <div
        className={`${styles.modal} ${maxWidth ? '' : styles[size]} ${className}`}
        style={maxWidth ? { maxWidth } : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
          </div>
          <div className={styles.actions}>
            {headerActions}
            <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Fechar">
              X
            </button>
          </div>
        </div>
        <div className={flush ? undefined : styles.body}>{children}</div>
      </div>
    </div>
  );
}
