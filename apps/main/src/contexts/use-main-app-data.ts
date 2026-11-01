import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import type { AppDataState } from './app-context-types';

const headers: HeadersInit = { 'X-System': 'main' };

export function useMainAppData(state: AppDataState) {
  const { authenticated, isAdmin } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const loadData = useCallback(() => {
    const pending: Promise<unknown>[] = [];
    const eventRequests = [apiFetch('/api/events?scope=main', { headers }).then((response) => response.json())];
    if (isAdmin)
      eventRequests.push(apiFetch('/api/events?scope=franchise', { headers }).then((response) => response.json()));
    pending.push(
      Promise.all(eventRequests)
        .then((groups) => state.setEvents(groups.filter((data) => Array.isArray(data)).flat()))
        .catch((error) => console.error('Falha ao carregar dados:', error)),
    );
    pending.push(
      apiFetch('/api/tasks', { headers })
        .then((response) => response.json())
        .then((data) => Array.isArray(data) && state.setTasks(data))
        .catch((error) => console.error('Falha ao carregar dados:', error)),
    );
    apiFetch('/api/task-history', { headers })
      .then((response) => response.json())
      .then((data) => Array.isArray(data) && state.setTaskHistory(data))
      .catch((error) => console.error('Falha ao carregar histórico:', error));
    pending.push(
      apiFetch('/api/finances', { headers })
        .then((response) => response.json())
        .then((data) => Array.isArray(data) && state.setFinances(data))
        .catch((error) => console.error('Falha ao carregar dados:', error)),
    );
    apiFetch('/api/finance-categories', { headers })
      .then((response) => response.json())
      .then((data) => Array.isArray(data) && state.setFinanceCategories(data))
      .catch((error) => console.error('Falha ao carregar categorias financeiras:', error));
    apiFetch('/api/invoices', { headers })
      .then((response) => response.json())
      .then((data) => Array.isArray(data) && state.setInvoices(data))
      .catch((error) => console.error('Falha ao carregar dados:', error));
    void Promise.allSettled(pending).then(() => setDataLoading(false));
  }, [
    state.setEvents,
    state.setFinances,
    state.setFinanceCategories,
    state.setInvoices,
    state.setTasks,
    state.setTaskHistory,
    isAdmin,
  ]);

  useEffect(() => {
    if (!authenticated) return;
    loadData();
    window.addEventListener('soul540:refresh', loadData);
    return () => window.removeEventListener('soul540:refresh', loadData);
  }, [authenticated, loadData]);

  return dataLoading;
}
