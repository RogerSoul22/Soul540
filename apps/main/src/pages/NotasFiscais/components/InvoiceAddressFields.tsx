import { Input } from '../../../../../../packages/pentagono/src/index';
import type { InvoiceFormState } from '../types/invoice-types';
import InvoiceFormField from './InvoiceFormField';
import styles from '../styles/NotasFiscais.module.scss';

type Props = {
  form: InvoiceFormState;
  onChange: <Key extends keyof InvoiceFormState>(key: Key, value: InvoiceFormState[Key]) => void;
};
export default function InvoiceAddressFields({ form, onChange }: Props) {
  return (
    <div className={styles.addressSection}>
      <p className={styles.itemsSectionTitle}>Endereço do Cliente</p>
      <div className={styles.formRow}>
        <InvoiceFormField label="Logradouro">
          <Input
            className={styles.formInput}
            value={form.address}
            onChange={(event) => onChange('address', event.target.value)}
          />
        </InvoiceFormField>
        <InvoiceFormField label="Número">
          <Input
            className={styles.formInput}
            value={form.addressNumber}
            onChange={(event) => onChange('addressNumber', event.target.value)}
          />
        </InvoiceFormField>
      </div>
      <div className={styles.formRow}>
        <InvoiceFormField label="Bairro">
          <Input
            className={styles.formInput}
            value={form.district}
            onChange={(event) => onChange('district', event.target.value)}
          />
        </InvoiceFormField>
        <InvoiceFormField label="CEP">
          <Input
            className={styles.formInput}
            value={form.postalCode}
            onChange={(event) => onChange('postalCode', event.target.value)}
          />
        </InvoiceFormField>
      </div>
      <div className={styles.formRow}>
        <InvoiceFormField label="Cidade">
          <Input
            className={styles.formInput}
            value={form.city}
            onChange={(event) => onChange('city', event.target.value)}
          />
        </InvoiceFormField>
        <InvoiceFormField label="Estado (UF)">
          <Input
            className={styles.formInput}
            value={form.state}
            onChange={(event) => onChange('state', event.target.value)}
            maxLength={2}
          />
        </InvoiceFormField>
      </div>
    </div>
  );
}
