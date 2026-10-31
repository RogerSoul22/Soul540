import { useCallback } from 'react';
import { apiFetch } from '../lib/api';
import type { PizzaEvent } from '../../../../shared/contracts/types';
import type { FactoryState } from './factory-context-types';

export function useFactoryEventActions(state: FactoryState) {
  const addEvent = useCallback(
    async (data: Omit<PizzaEvent, 'id' | 'createdAt'>) => {
      const res = await apiFetch('/api/events', { method: 'POST', body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Falha ao criar evento');
      const created: PizzaEvent = await res.json();
      state.setEvents((prev) => [...prev, created]);
      state.refreshFinances();
      return created;
    },
    [state.setEvents, state.refreshFinances],
  );

  const updateEvent = useCallback(
    async (id: string, data: Partial<PizzaEvent>) => {
      const source = state.events.find((event) => event.id === id)?.source;
      const res = await apiFetch('/api/events/' + id, {
        method: 'PUT',
        body: JSON.stringify({ ...data, ...(source ? { source } : {}) }),
      });
      if (!res.ok) throw new Error('Falha ao atualizar evento');
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

  return { addEvent, updateEvent, deleteEvent };
}
