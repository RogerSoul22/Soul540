import { Label } from '../../../../../../packages/pentagono/src/index';
import type { ReactNode } from 'react';
import styles from '../styles/NotasFiscais.module.scss';

export default function InvoiceFormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Label className={styles.formField}>
      <span className={styles.formLabel}>{label}</span>
      {children}
    </Label>
  );
}
