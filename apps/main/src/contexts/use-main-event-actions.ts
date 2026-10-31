import { useCallback } from 'react';
import { apiFetch } from '../lib/api';
import type { PizzaEvent } from '../../../../packages/contracts/src/index';
import type { AppDataState } from './app-context-types';

const buildHeaders = (withBody = false): HeadersInit => ({
  ...(withBody ? { 'Content-Type': 'application/json' } : {}),
  'X-System': 'main',
});

export function useMainEventActions(state: AppDataState) {
  const refreshFinances = state.refreshFinances;
  const addEvent = useCallback(
    async (data: Omit<PizzaEvent, 'id' | 'createdAt'>) => {
      const response = await apiFetch('/api/events', {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Falha ao criar evento');
      const created: PizzaEvent = await response.json();
      state.setEvents((previous) => [...previous, created]);
      refreshFinances();
      return created;
    },
    [state.setEvents, refreshFinances],
  );

  const updateEvent = useCallback(
    async (id: string, data: Partial<PizzaEvent>) => {
      const response = await apiFetch('/api/events/' + id, {
        method: 'PUT',
        headers: buildHeaders(true),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Falha ao atualizar evento');
      }
      const updated: PizzaEvent = await response.json();
      state.setEvents((previous) => previous.map((event) => (event.id === id ? updated : event)));
      refreshFinances();
    },
    [state.setEvents, refreshFinances],
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      const response = await apiFetch('/api/events/' + id, {
        method: 'DELETE',
        headers: buildHeaders(),
      });
      if (!response.ok) throw new Error('Falha ao excluir evento');
      state.setEvents((previous) => previous.filter((event) => event.id !== id));
      state.setFinances((previous) => previous.filter((finance) => finance.eventId !== id));
    },
    [state.setEvents, state.setFinances],
  );

  const closeEventFinance = useCallback(
    async (id: string) => {
      const response = await apiFetch('/api/events/' + id + '/financial-close', {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error('Falha ao fechar financeiro do evento');
      const updated: PizzaEvent = await response.json();
      state.setEvents((previous) => previous.map((event) => (event.id === id ? updated : event)));
      refreshFinances();
    },
    [state.setEvents, refreshFinances],
  );

  const reopenEventFinance = useCallback(
    async (id: string) => {
      const response = await apiFetch('/api/events/' + id + '/financial-reopen', {
        method: 'POST',
        headers: buildHeaders(true),
        body: '{}',
      });
      if (!response.ok) throw new Error('Falha ao reabrir financeiro do evento');
      const updated: PizzaEvent = await response.json();
      state.setEvents((previous) => previous.map((event) => (event.id === id ? updated : event)));
      refreshFinances();
    },
    [state.setEvents, refreshFinances],
  );

  return { addEvent, updateEvent, deleteEvent, closeEventFinance, reopenEventFinance };
}
