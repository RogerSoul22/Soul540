import { Modal } from '../../../../pentagono/src/index';
import type { ReactNode } from 'react';
import styles from './styles/InventoryModalFrame.module.scss';

interface InventoryModalFrameProps {
  children: ReactNode;
  footer: ReactNode;
  maxWidth?: number;
  onClose: () => void;
  title: string;
}

export default function InventoryModalFrame({ children, footer, maxWidth, onClose, title }: InventoryModalFrameProps) {
  return (
    <Modal title={title} onClose={onClose} closeOnOverlay maxWidth={maxWidth ?? 480} flush>
      <div className={styles.body}>{children}</div>
      <div className={styles.footer}>{footer}</div>
    </Modal>
  );
}
