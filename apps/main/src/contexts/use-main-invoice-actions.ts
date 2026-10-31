import { useCallback } from 'react';
import { apiFetch } from '../lib/api';
import type { Invoice } from '../../../../packages/contracts/src/index';
import type { AppDataState } from './app-context-types';

const headers = { 'X-System': 'main' };
const bodyHeaders = { ...headers, 'Content-Type': 'application/json' };

export function useMainInvoiceActions(state: AppDataState) {
  const addInvoice = useCallback(
    async (invoice: Invoice) => {
      const { id: _id, ...data } = invoice;
      const response = await apiFetch('/api/invoices', {
        method: 'POST',
        headers: bodyHeaders,
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Falha ao criar nota fiscal');
      const created: Invoice = await response.json();
      state.setInvoices((previous) => [created, ...previous]);
    },
    [state.setInvoices],
  );

  const updateInvoice = useCallback(
    async (id: string, data: Partial<Invoice>) => {
      const response = await apiFetch('/api/invoices/' + id, {
        method: 'PUT',
        headers: bodyHeaders,
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Falha ao atualizar nota fiscal');
      const updated: Invoice = await response.json();
      state.setInvoices((previous) => previous.map((invoice) => (invoice.id === id ? updated : invoice)));
    },
    [state.setInvoices],
  );

  const deleteInvoice = useCallback(
    async (id: string) => {
      const response = await apiFetch('/api/invoices/' + id, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) throw new Error('Falha ao excluir nota fiscal');
      state.setInvoices((previous) => previous.filter((invoice) => invoice.id !== id));
    },
    [state.setInvoices],
  );

  const emitInvoice = useCallback(
    async (id: string) => {
      const response = await apiFetch('/api/invoices/' + id + '/emit', {
        method: 'POST',
        headers,
      });
      if (!response.ok) throw new Error('Falha ao emitir nota fiscal');
      const updated: Invoice = await response.json();
      state.setInvoices((previous) => previous.map((invoice) => (invoice.id === id ? updated : invoice)));
      return updated;
    },
    [state.setInvoices],
  );

  const pollInvoiceStatus = useCallback(
    async (id: string) => {
      const response = await apiFetch('/api/invoices/' + id + '/status', { headers });
      if (!response.ok) throw new Error('Falha ao consultar status da nota');
      const updated: Invoice = await response.json();
      state.setInvoices((previous) => previous.map((invoice) => (invoice.id === id ? updated : invoice)));
      return updated;
    },
    [state.setInvoices],
  );

  return { addInvoice, updateInvoice, deleteInvoice, emitInvoice, pollInvoiceStatus };
}
