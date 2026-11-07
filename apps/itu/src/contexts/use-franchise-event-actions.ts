import { useCallback } from 'react';
import { apiFetch } from '../lib/api';
import type { PizzaEvent } from '../../../../shared/contracts/types';
import type { FranchiseState } from './franchise-context-types';

export function useFranchiseEventActions(state: FranchiseState) {
  const addEvent = useCallback(
    async (data: Omit<PizzaEvent, 'id' | 'createdAt'>) => {
      const res = await apiFetch('/api/events', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erro ao criar evento: ' + res.status);
      const created: PizzaEvent = await res.json();
      state.setEvents((prev) => [...prev, created]);
      state.refreshFinances();
      return created;
    },
    [state.setEvents, state.refreshFinances],
  );

  const updateEvent = useCallback(
    async (id: string, data: Partial<PizzaEvent>) => {
      const res = await apiFetch('/api/events/' + id, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || 'Erro ao atualizar evento: ' + res.status);
      }
      const updated: PizzaEvent = await res.json();
      state.setEvents((prev) => prev.map((event) => (event.id === id ? updated : event)));
      state.refreshFinances();
    },
    [state.setEvents, state.refreshFinances],
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      const res = await apiFetch('/api/events/' + id, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir evento');
      state.setEvents((prev) => prev.filter((event) => event.id !== id));
      state.setFinances((prev) => prev.filter((finance) => finance.eventId !== id));
    },
    [state.setEvents, state.setFinances],
  );

  const closeEventFinance = useCallback(
    async (id: string) => {
      const res = await apiFetch('/api/events/' + id + '/financial-close', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Falha ao fechar financeiro do evento');
      const updated: PizzaEvent = await res.json();
      state.setEvents((prev) => prev.map((event) => (event.id === id ? updated : event)));
      state.refreshFinances();
    },
    [state.setEvents, state.refreshFinances],
  );

  const reopenEventFinance = useCallback(
    async (id: string) => {
      const res = await apiFetch('/api/events/' + id + '/financial-reopen', {
        method: 'POST',
        body: '{}',
      });
      if (!res.ok) throw new Error('Falha ao reabrir financeiro do evento');
      const updated: PizzaEvent = await res.json();
      state.setEvents((prev) => prev.map((event) => (event.id === id ? updated : event)));
      state.refreshFinances();
    },
    [state.setEvents, state.refreshFinances],
  );

  return {
    addEvent,
    updateEvent,
    deleteEvent,
    closeEventFinance,
    reopenEventFinance,
  };
}
