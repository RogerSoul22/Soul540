import { Modal } from '../../../../pentagono/src/index';
import type { ReactNode } from 'react';
import styles from './styles/ContractorModalFrame.module.scss';

interface ContractorModalFrameProps {
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
  title: string;
  width?: 'default' | 'narrow' | 'wide';
}

const MAX_WIDTH = { default: 520, narrow: 400, wide: 480 } as const;

export default function ContractorModalFrame({
  children,
  footer,
  onClose,
  title,
  width = 'default',
}: ContractorModalFrameProps) {
  return (
    <Modal title={title} onClose={onClose} closeOnOverlay maxWidth={MAX_WIDTH[width]} flush>
      <div className={styles.body}>{children}</div>
      <footer className={styles.footer}>{footer}</footer>
    </Modal>
  );
}
