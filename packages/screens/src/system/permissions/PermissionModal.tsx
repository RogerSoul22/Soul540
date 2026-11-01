import type { ReactNode } from 'react';
import { Modal } from '../../../../pentagono/src/index';
import type { StyleMap } from './permission-types';

export default function PermissionModal({
  children,
  onClose,
  styles,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  styles: StyleMap;
  title: string;
}) {
  return (
    <Modal title={title} onClose={onClose} closeOnOverlay flush>
      <div className={styles.modalBody}>{children}</div>
    </Modal>
  );
}
