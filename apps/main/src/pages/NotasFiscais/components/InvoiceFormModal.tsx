import type { FormEvent } from 'react';
import { Button, Modal } from '../../../../../../packages/pentagono/src/index';
import type { InvoiceFormState } from '../types/invoice-types';
import type { InvoiceItem } from '../../../../../../packages/contracts/src/index';
import InvoiceFormFields from './InvoiceFormFields';
import styles from '../styles/NotasFiscais.module.scss';

type Props = {
  editing: boolean;
  form: InvoiceFormState;
  events: Array<{ id: string; name: string }>;
  subtotal: number;
  taxAmount: number;
  onChange: <Key extends keyof InvoiceFormState>(key: Key, value: InvoiceFormState[Key]) => void;
  onItemChange: (index: number, field: keyof InvoiceItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onSubmit: (event: FormEvent) => void;
  onClose: () => void;
};

export default function InvoiceFormModal({
  editing,
  form,
  events,
  subtotal,
  taxAmount,
  onChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onSubmit,
  onClose,
}: Props) {
  return (
    <Modal title={editing ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'} size="lg" onClose={onClose}>
      <form className={styles.form} onSubmit={onSubmit}>
        <InvoiceFormFields
          form={form}
          events={events}
          subtotal={subtotal}
          taxAmount={taxAmount}
          editing={editing}
          onChange={onChange}
          onItemChange={onItemChange}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
        />
        <div className={styles.formActions}>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            {editing ? 'Salvar Alterações' : 'Salvar Nota Fiscal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
