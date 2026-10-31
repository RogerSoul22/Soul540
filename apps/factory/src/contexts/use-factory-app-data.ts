import { useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from './AuthContext';
import type { FactoryState } from './factory-context-types';
import { getFactoryEventsScope } from './factory-data-scope';

export function useFactoryAppData(state: FactoryState) {
  const { authenticated, loading, user } = useAuth();

  useEffect(() => {
    if (loading || !authenticated) return;
    const eventsScope = getFactoryEventsScope(Boolean(user?.isAdmin));
    apiFetch(`/api/events?scope=${eventsScope}`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && state.setEvents(d))
      .catch((error) => console.error('Falha ao carregar dados:', error));
    apiFetch('/api/tasks')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && state.setTasks(d))
      .catch((error) => console.error('Falha ao carregar dados:', error));
    const financeScope = user?.isAdmin ? '?scope=combined' : '';
    apiFetch(`/api/finances${financeScope}`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && state.setFinances(d))
      .catch((error) => console.error('Falha ao carregar dados:', error));
    apiFetch('/api/invoices')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && state.setInvoices(d))
      .catch((error) => console.error('Falha ao carregar dados:', error));
    apiFetch('/api/finance-categories')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && state.setFinanceCategories(d))
      .catch(() => {});
  }, [
    authenticated,
    loading,
    user?.isAdmin,
    state.setEvents,
    state.setTasks,
    state.setFinances,
    state.setInvoices,
    state.setFinanceCategories,
  ]);
}
