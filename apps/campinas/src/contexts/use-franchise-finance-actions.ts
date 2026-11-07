import { useCallback } from 'react';
import { apiFetch } from '../lib/api';
import type { FinanceCategoryEntry, FinanceEntry } from '../../../../shared/contracts/types';
import type { FranchiseState } from './franchise-context-types';

export function useFranchiseFinanceActions(state: FranchiseState) {
  const addFinance = useCallback(
    async (data: Omit<FinanceEntry, 'id'>) => {
      const res = await apiFetch('/api/finances', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Falha ao criar lançamento financeiro');
      const created: FinanceEntry = await res.json();
      state.setFinances((prev) => [created, ...prev]);
      return created;
    },
    [state.setFinances],
  );

  const updateFinance = useCallback(
    async (id: string, data: Partial<FinanceEntry>) => {
      const res = await apiFetch('/api/finances/' + id, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Falha ao atualizar lançamento financeiro');
      const updated: FinanceEntry = await res.json();
      state.setFinances((prev) => prev.map((finance) => (finance.id === id ? updated : finance)));
    },
    [state.setFinances],
  );

  const settleFinance = useCallback(
    async (
      id: string,
      settlement: {
        amount: number;
        settledOn: string;
        paymentMethod?: string;
        reason?: string;
      },
    ) => {
      const res = await apiFetch('/api/finances/' + id + '/settlements', {
        method: 'POST',
        body: JSON.stringify({
          ...settlement,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Falha ao registrar baixa financeira');
      state.setFinances((prev) => prev.map((finance) => (finance.id === id ? payload : finance)));
    },
    [state.setFinances],
  );

  const deleteFinance = useCallback(
    async (id: string) => {
      const res = await apiFetch('/api/finances/' + id, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir lançamento financeiro');
      state.setFinances((prev) => prev.filter((finance) => finance.id !== id));
    },
    [state.setFinances],
  );

  const reverseFinance = useCallback(
    async (id: string, reason = 'Estorno manual') => {
      const res = await apiFetch('/api/finances/' + id + '/reverse', {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('Falha ao estornar lançamento financeiro');
      state.setFinances((prev) => prev.filter((finance) => finance.id !== id));
    },
    [state.setFinances],
  );

  const addFinanceCategory = useCallback(
    async (data: Omit<FinanceCategoryEntry, 'id'>) => {
      const res = await apiFetch('/api/finance-categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Falha ao criar categoria financeira');
      const created: FinanceCategoryEntry = await res.json();
      state.setFinanceCategories((prev) => [...prev.filter((item) => item.id !== created.id), created]);
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
