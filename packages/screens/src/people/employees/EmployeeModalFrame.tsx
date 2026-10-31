import type { ReactNode } from 'react';
import styles from './styles/EmployeeModalFrame.module.scss';

interface EmployeeModalFrameProps {
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: number;
  onClose: () => void;
  title: ReactNode;
}

export default function EmployeeModalFrame({ children, footer, maxWidth, onClose, title }: EmployeeModalFrameProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} style={{ maxWidth }} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          <button className={styles.closeButton} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
