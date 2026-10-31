import { useCallback } from 'react';
import { apiFetch } from '../lib/api';
import type { FinanceCategoryEntry, FinanceEntry } from '../../../../packages/contracts/src/index';
import type { AppDataState } from './app-context-types';

const buildHeaders = (withBody = false): HeadersInit => ({
  ...(withBody ? { 'Content-Type': 'application/json' } : {}),
  'X-System': 'main',
});

export function useMainFinanceActions(state: AppDataState) {
  const addFinance = useCallback(
    async (data: Omit<FinanceEntry, 'id'>) => {
      const response = await apiFetch('/api/finances', {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Falha ao criar lançamento financeiro');
      const created: FinanceEntry = await response.json();
      state.setFinances((previous) => [created, ...previous]);
      return created;
    },
    [state.setFinances],
  );

  const updateFinance = useCallback(
    async (id: string, data: Partial<FinanceEntry>) => {
      const response = await apiFetch('/api/finances/' + id, {
        method: 'PUT',
        headers: buildHeaders(true),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Falha ao atualizar lançamento financeiro');
      const updated: FinanceEntry = await response.json();
      state.setFinances((previous) => previous.map((finance) => (finance.id === id ? updated : finance)));
    },
    [state.setFinances],
  );

  const settleFinance = useCallback(
    async (id: string, settlement: { amount: number; settledOn: string; paymentMethod?: string; reason?: string }) => {
      const response = await apiFetch('/api/finances/' + id + '/settlements', {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify({ ...settlement, idempotencyKey: crypto.randomUUID() }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Falha ao registrar baixa financeira');
      state.setFinances((previous) => previous.map((finance) => (finance.id === id ? payload : finance)));
    },
    [state.setFinances],
  );

  const deleteFinance = useCallback(
    async (id: string) => {
      const response = await apiFetch('/api/finances/' + id, {
        method: 'DELETE',
        headers: buildHeaders(),
      });
      if (!response.ok) throw new Error('Falha ao excluir lançamento financeiro');
      state.setFinances((previous) => previous.filter((finance) => finance.id !== id));
    },
    [state.setFinances],
  );

  const reverseFinance = useCallback(
    async (id: string, reason = 'Estorno manual') => {
      const response = await apiFetch('/api/finances/' + id + '/reverse', {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error('Falha ao estornar lançamento financeiro');
      state.setFinances((previous) => previous.filter((finance) => finance.id !== id));
    },
    [state.setFinances],
  );

  const addFinanceCategory = useCallback(
    async (data: Omit<FinanceCategoryEntry, 'id'>) => {
      const response = await apiFetch('/api/finance-categories', {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Falha ao criar categoria financeira');
      const created: FinanceCategoryEntry = await response.json();
      state.setFinanceCategories((previous) =>
        previous.some((category) => category.id === created.id) ? previous : [...previous, created],
      );
      return created;
    },
    [state.setFinanceCategories],
  );

  return {
    addFinance,
    updateFinance,
    settleFinance,
    deleteFinance,
    reverseFinance,
    addFinanceCategory,
  };
}
