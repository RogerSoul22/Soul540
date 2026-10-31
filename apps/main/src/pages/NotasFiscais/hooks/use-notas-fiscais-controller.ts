import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useApp } from '../../../contexts/AppContext';
import type { Invoice, InvoiceStatus } from '../../../../../../packages/contracts/src/index';
import { useInvoiceForm } from './use-invoice-form';
import { type FilterStatus, statusLabels } from '../types/invoice-types';
import { maskCpfCnpj } from '../support/invoice-formatters';

export function useNotasFiscaisController() {
  const { events, invoices, addInvoice, deleteInvoice, updateInvoice, emitInvoice, pollInvoiceStatus } = useApp();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [confirmEmitId, setConfirmEmitId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [emitError, setEmitError] = useState<string | null>(null);
  const invoiceForm = useInvoiceForm();
  const processingInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.emissaoStatus === 'processing' || invoice.nfeioStatus === 'processing'),
    [invoices],
  );
  const pollRef = useRef(pollInvoiceStatus);
  useEffect(() => {
    pollRef.current = pollInvoiceStatus;
  }, [pollInvoiceStatus]);
  useEffect(() => {
    if (processingInvoices.length === 0) return;
    const ids = processingInvoices.map((invoice) => invoice.id);
    const timer = setInterval(() => {
      ids.forEach((id) => pollRef.current(id).catch(() => {}));
    }, 3000);
    return () => clearInterval(timer);
  }, [processingInvoices]);

  const filtered = useMemo(
    () =>
      invoices.filter((invoice) => {
        if (filterStatus !== 'all' && invoice.status !== filterStatus) return false;
        if (!search) return true;
        const query = search.toLowerCase();
        const event = events.find((item) => item.id === invoice.eventId);
        return (
          invoice.clientName.toLowerCase().includes(query) ||
          invoice.id.toLowerCase().includes(query) ||
          Boolean(event?.name.toLowerCase().includes(query))
        );
      }),
    [events, filterStatus, invoices, search],
  );

  function openCreateForm() {
    setEditingInvoice(null);
    invoiceForm.resetForm();
    setShowForm(true);
  }

  function openEditForm(invoice: Invoice) {
    setEditingInvoice(invoice);
    invoiceForm.loadInvoice(invoice);
    setShowForm(true);
  }

  function closeForm() {
    invoiceForm.resetForm();
    setEditingInvoice(null);
    setShowForm(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const { form, subtotal, taxAmount } = invoiceForm;
    if (!form.eventId || !form.clientName || form.items.length === 0) return;
    const data: Partial<Invoice> = {
      eventId: form.eventId,
      clientName: form.clientName,
      clientDocument: form.clientDocument,
      clientEmail: form.clientEmail,
      items: form.items.filter((item) => item.description),
      subtotal,
      taxRate: parseFloat(form.taxRate || '0'),
      taxAmount,
      totalValue: subtotal + taxAmount,
      issueDate: form.issueDate,
      notes: form.notes,
      status: form.status,
      type: form.type,
      serviceCode: form.serviceCode,
      clientAddress: form.address,
      clientNumber: form.addressNumber,
      clientDistrict: form.district,
      clientCity: form.city,
      clientState: form.state,
      clientPostalCode: form.postalCode,
    };
    if (editingInvoice) {
      await updateInvoice(editingInvoice.id, data);
    } else {
      await addInvoice({
        ...data,
        id: 'nf-' + Date.now(),
        createdAt: new Date().toISOString(),
      } as Invoice);
    }
    closeForm();
  }

  async function confirmEmission() {
    if (!confirmEmitId) return;
    setEmitError(null);
    try {
      await emitInvoice(confirmEmitId);
    } catch (error) {
      setEmitError(error instanceof Error ? error.message : 'Erro ao emitir nota fiscal');
    }
    setConfirmEmitId(null);
  }

  return {
    events,
    invoices,
    filtered,
    filterStatus,
    search,
    showForm,
    editingInvoice,
    previewInvoice,
    confirmEmitId,
    confirmDeleteId,
    emitError,
    invoiceForm,
    setFilterStatus,
    setSearch,
    setPreviewInvoice,
    setConfirmEmitId,
    setConfirmDeleteId,
    setEmitError,
    openCreateForm,
    openEditForm,
    closeForm,
    handleSubmit,
    confirmEmission,
    deleteInvoice,
    updateInvoice,
    maskCpfCnpj,
    statusLabels,
  };
}
