import { Select, Textarea } from '../../../../../../packages/pentagono/src/index';
import type { InvoiceFormState } from '../types/invoice-types';
import InvoiceFormField from './InvoiceFormField';
import styles from '../styles/NotasFiscais.module.scss';

type Props = {
  form: InvoiceFormState;
  subtotal: number;
  taxAmount: number;
  editing: boolean;
  onChange: <Key extends keyof InvoiceFormState>(key: Key, value: InvoiceFormState[Key]) => void;
};

export default function InvoiceFormFooterFields({ form, subtotal, taxAmount, editing, onChange }: Props) {
  return (
    <>
      <div className={styles.formTotal}>
        Subtotal: R$ {subtotal.toLocaleString('pt-BR')} | ISS: R$ {taxAmount.toLocaleString('pt-BR')} | Total: R
        {(subtotal + taxAmount).toLocaleString('pt-BR')}
      </div>
      <InvoiceFormField label="Observações">
        <Textarea
          className={styles.formTextarea}
          value={form.notes}
          onChange={(event) => onChange('notes', event.target.value)}
        />
      </InvoiceFormField>
      <InvoiceFormField label="Status">
        <Select
          className={styles.formSelect}
          value={form.status}
          onChange={(event) => onChange('status', event.target.value as InvoiceFormState['status'])}
        >
          <option value="rascunho">Rascunho</option>
          {editing && <option value="emitida">Emitida</option>}
        </Select>
      </InvoiceFormField>
    </>
  );
}
