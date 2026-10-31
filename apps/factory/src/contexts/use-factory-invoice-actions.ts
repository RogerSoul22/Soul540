import { useCallback } from 'react';
import { apiFetch } from '../lib/api';
import type { Invoice } from '../../../../shared/contracts/types';
import type { FactoryState } from './factory-context-types';

export function useFactoryInvoiceActions(state: FactoryState) {
  const addInvoice = useCallback(
    async (invoice: Invoice) => {
      const { id: _id, ...data } = invoice;
      const res = await apiFetch('/api/invoices', { method: 'POST', body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Falha ao criar nota fiscal');
      const created: Invoice = await res.json();
      state.setInvoices((prev) => [created, ...prev]);
    },
    [state.setInvoices],
  );

  const updateInvoice = useCallback(
    async (id: string, data: Partial<Invoice>) => {
      const res = await apiFetch('/api/invoices/' + id, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Falha ao atualizar nota fiscal');
      const updated: Invoice = await res.json();
      state.setInvoices((prev) => prev.map((invoice) => (invoice.id === id ? updated : invoice)));
      return updated;
    },
    [state.setInvoices],
  );

  const deleteInvoice = useCallback(
    async (id: string) => {
      const res = await apiFetch('/api/invoices/' + id, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir nota fiscal');
      state.setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
    },
    [state.setInvoices],
  );

  const emitInvoice = useCallback(
    async (id: string) => {
      const res = await apiFetch('/api/invoices/' + id + '/emit', { method: 'POST' });
      if (!res.ok) throw new Error('Falha ao emitir nota fiscal');
      const updated: Invoice = await res.json();
      state.setInvoices((prev) => prev.map((invoice) => (invoice.id === id ? updated : invoice)));
      return updated;
    },
    [state.setInvoices],
  );

  const pollInvoiceStatus = useCallback(
    async (id: string) => {
      const res = await apiFetch('/api/invoices/' + id + '/nfeio-status');
      if (!res.ok) throw new Error('Falha ao consultar status da nota');
      const updated: Invoice = await res.json();
      state.setInvoices((prev) => prev.map((invoice) => (invoice.id === id ? updated : invoice)));
      return updated;
    },
    [state.setInvoices],
  );

  return { addInvoice, updateInvoice, deleteInvoice, emitInvoice, pollInvoiceStatus };
}
