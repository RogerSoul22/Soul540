import type { ReactNode } from 'react';
import styles from './styles/ContractorModalFrame.module.scss';

interface ContractorModalFrameProps {
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
  title: string;
  width?: 'default' | 'narrow' | 'wide';
}

export default function ContractorModalFrame({
  children,
  footer,
  onClose,
  title,
  width = 'default',
}: ContractorModalFrameProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <section className={`${styles.modal} ${styles[width]}`} onClick={(event) => event.stopPropagation()}>
        <header className={styles.header}>
          <h2>{title}</h2>
          <button aria-label="Fechar" className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </header>
        <div className={styles.body}>{children}</div>
        <footer className={styles.footer}>{footer}</footer>
      </section>
    </div>
  );
}
