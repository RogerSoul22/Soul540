import { Modal } from '../../../../pentagono/src/index';
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
    <Modal title={title} onClose={onClose} closeOnOverlay maxWidth={maxWidth ?? 560} flush>
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </Modal>
  );
}
