import type { ChangeEvent } from 'react';
import { Button, Input } from '../../../../../../packages/pentagono/src/index';
import type { InvoiceItem } from '../../../../../../packages/contracts/src/index';
import type { InvoiceFormState } from '../types/invoice-types';
import styles from '../styles/NotasFiscais.module.scss';

type Props = {
  item: InvoiceItem;
  index: number;
  type: InvoiceFormState['type'];
  canRemove: boolean;
  onChange: (index: number, field: keyof InvoiceItem, value: string | number) => void;
  onRemove: (index: number) => void;
};

export default function InvoiceItemRow({ item, index, type, canRemove, onChange, onRemove }: Props) {
  const update = (field: keyof InvoiceItem) => (event: ChangeEvent<HTMLInputElement>) => {
    const value =
      field === 'quantity'
        ? parseInt(event.target.value, 10) || 0
        : field === 'unitPrice'
          ? parseFloat(event.target.value) || 0
          : event.target.value;
    onChange(index, field, value);
  };

  return (
    <div className={type === 'nfe' ? styles.itemRowNfe : styles.itemRow}>
      <Input label="Descricao" className={styles.formInput} value={item.description} onChange={update('description')} />
      <Input
        label="Qtd"
        className={styles.formInput}
        type="number"
        value={item.quantity}
        onChange={update('quantity')}
        min="1"
      />
      <Input
        label="Valor Unit."
        className={styles.formInput}
        type="number"
        value={item.unitPrice}
        onChange={update('unitPrice')}
        min="0"
        step="0.01"
      />
      {type === 'nfe' && (
        <>
          <Input label="NCM" className={styles.formInput} value={item.ncm || ''} onChange={update('ncm')} />
          <Input label="CFOP" className={styles.formInput} value={item.cfop || ''} onChange={update('cfop')} />
          <Input label="Unidade" className={styles.formInput} value={item.unit || 'UN'} onChange={update('unit')} />
        </>
      )}
      {canRemove && (
        <Button type="button" variant="ghost" className={styles.removeItemBtn} onClick={() => onRemove(index)}>
          X
        </Button>
      )}
    </div>
  );
}
