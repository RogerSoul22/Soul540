import type { ChangeEvent } from 'react';
import type { InvoiceItem } from '../../../../../../packages/contracts/src/index';
import type { InvoiceFormState } from '../types/invoice-types';
import { maskCpfCnpj } from '../support/invoice-formatters';
import InvoiceFormField from './InvoiceFormField';
import InvoiceItemRow from './InvoiceItemRow';
import InvoiceFormFooterFields from './InvoiceFormFooterFields';
import styles from '../styles/NotasFiscais.module.scss';
import InvoiceAddressFields from './InvoiceAddressFields';
type Props = {
  form: InvoiceFormState;
  events: Array<{ id: string; name: string }>;
  subtotal: number;
  taxAmount: number;
  editing: boolean;
  onChange: <Key extends keyof InvoiceFormState>(key: Key, value: InvoiceFormState[Key]) => void;
  onItemChange: (index: number, field: keyof InvoiceItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
};
export default function InvoiceFormFields({
  form,
  events,
  subtotal,
  taxAmount,
  editing,
  onChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
}: Props) {
  return (
    <>
      <div className={styles.formRow}>
        <InvoiceFormField label="Tipo de Nota">
          <select
            className={styles.formSelect}
            value={form.type}
            onChange={(event) => onChange('type', event.target.value as InvoiceFormState['type'])}
          >
            <option value="nfse">NFS-e (Serviço)</option>
            <option value="nfe">NF-e (Produto)</option>
          </select>
        </InvoiceFormField>
        <InvoiceFormField label="Data de Emissão">
          <input
            className={styles.formInput}
            type="date"
            value={form.issueDate}
            onChange={(event) => onChange('issueDate', event.target.value)}
            required
          />
        </InvoiceFormField>
      </div>
      {form.type === 'nfse' && (
        <InvoiceFormField label="Código de Serviço Municipal">
          <input
            className={styles.formInput}
            value={form.serviceCode}
            onChange={(event) => onChange('serviceCode', event.target.value)}
          />
        </InvoiceFormField>
      )}
      <div className={styles.formRow}>
        <InvoiceFormField label="Evento">
          <select
            className={styles.formSelect}
            value={form.eventId}
            onChange={(event) => onChange('eventId', event.target.value)}
            required
          >
            <option value="">Selecione...</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </InvoiceFormField>
        <InvoiceFormField label="Taxa ISS (%)">
          <input
            className={styles.formInput}
            type="number"
            value={form.taxRate}
            onChange={(event) => onChange('taxRate', event.target.value)}
            min="0"
            step="0.1"
          />
        </InvoiceFormField>
      </div>
      <div className={styles.formRow}>
        <InvoiceFormField label="Nome do Cliente">
          <input
            className={styles.formInput}
            value={form.clientName}
            onChange={(event) => onChange('clientName', event.target.value)}
            required
          />
        </InvoiceFormField>
        <InvoiceFormField label="Documento (CPF/CNPJ)">
          <input
            className={styles.formInput}
            value={form.clientDocument}
            onChange={(event) => onChange('clientDocument', maskCpfCnpj(event.target.value))}
            maxLength={18}
          />
        </InvoiceFormField>
      </div>
      <InvoiceFormField label="Email do Cliente">
        <input
          className={styles.formInput}
          type="email"
          value={form.clientEmail}
          onChange={(event) => onChange('clientEmail', event.target.value)}
        />
      </InvoiceFormField>
      <InvoiceAddressFields form={form} onChange={onChange} />
      <div className={styles.itemsSection}>
        <p className={styles.itemsSectionTitle}>Itens da Nota</p>
        {form.items.map((item, index) => (
          <InvoiceItemRow
            key={index}
            item={item}
            index={index}
            type={form.type}
            canRemove={form.items.length > 1}
            onChange={onItemChange}
            onRemove={onRemoveItem}
          />
        ))}
        <button type="button" className={styles.addItemBtn} onClick={onAddItem}>
          + Adicionar Item
        </button>
      </div>
      <InvoiceFormFooterFields
        form={form}
        subtotal={subtotal}
        taxAmount={taxAmount}
        editing={editing}
        onChange={onChange}
      />
    </>
  );
}
