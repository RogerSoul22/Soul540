import type { ReactNode } from 'react';
import { Button } from '@soul540/ui';
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
    <div className={styles.overlay} onClick={onClose}>
      <section className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <Button type="button" variant="ghost" className={styles.modalClose} onClick={onClose}>
            X
          </Button>
        </header>
        <div className={styles.modalBody}>{children}</div>
      </section>
    </div>
  );
}
