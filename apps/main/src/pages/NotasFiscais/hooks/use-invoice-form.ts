import { useMemo, useState } from 'react';
import type { Invoice, InvoiceItem } from '@soul540/contracts';
import { createEmptyInvoiceForm, createEmptyInvoiceItem, type InvoiceFormState } from '../types/invoice-types';

export function useInvoiceForm() {
  const [form, setForm] = useState<InvoiceFormState>(createEmptyInvoiceForm);
  const subtotal = useMemo(
    () => form.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0),
    [form.items],
  );
  const taxAmount = subtotal * (parseFloat(form.taxRate || '0') / 100);

  function updateField<Key extends keyof InvoiceFormState>(key: Key, value: InvoiceFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(createEmptyInvoiceForm());
  }

  function loadInvoice(invoice: Invoice) {
    setForm({
      eventId: invoice.eventId,
      clientName: invoice.clientName,
      clientDocument: invoice.clientDocument,
      clientEmail: invoice.clientEmail,
      issueDate: invoice.issueDate,
      taxRate: String(invoice.taxRate),
      notes: invoice.notes,
      status: invoice.status,
      items: invoice.items.length > 0 ? invoice.items : [createEmptyInvoiceItem()],
      type: invoice.type || 'nfse',
      serviceCode: invoice.serviceCode || '',
      address: invoice.clientAddress || '',
      addressNumber: invoice.clientNumber || '',
      district: invoice.clientDistrict || '',
      city: invoice.clientCity || '',
      state: invoice.clientState || '',
      postalCode: invoice.clientPostalCode || '',
    });
  }

  function updateItem(index: number, field: keyof InvoiceItem, value: string | number) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    }));
  }

  function addItem() {
    setForm((current) => ({ ...current, items: [...current.items, createEmptyInvoiceItem()] }));
  }

  function removeItem(index: number) {
    setForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  return {
    form,
    subtotal,
    taxAmount,
    updateField,
    resetForm,
    loadInvoice,
    updateItem,
    addItem,
    removeItem,
  };
}
