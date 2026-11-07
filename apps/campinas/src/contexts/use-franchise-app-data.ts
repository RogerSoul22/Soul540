import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from './AuthContext';
import type { FranchiseState } from './franchise-context-types';

export function useFranchiseAppData(state: FranchiseState) {
  const { authenticated, loading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (loading || !authenticated) return;
    const pending: Promise<unknown>[] = [];
    pending.push(
      apiFetch('/api/events')
        .then((r) => r.json())
        .then((d) => Array.isArray(d) && state.setEvents(d))
        .catch((error) => console.error('Falha ao carregar dados:', error)),
    );
    pending.push(
      apiFetch('/api/tasks')
        .then((r) => r.json())
        .then((d) => Array.isArray(d) && state.setTasks(d))
        .catch((error) => console.error('Falha ao carregar dados:', error)),
    );
    apiFetch('/api/task-history')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && state.setTaskHistory(d))
      .catch(() => {});
    pending.push(
      apiFetch('/api/finances')
        .then((r) => r.json())
        .then((d) => Array.isArray(d) && state.setFinances(d))
        .catch((error) => console.error('Falha ao carregar dados:', error)),
    );
    apiFetch('/api/finance-categories')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && state.setFinanceCategories(d))
      .catch(() => {});
    void Promise.allSettled(pending).then(() => setDataLoading(false));
  }, [
    authenticated,
    loading,
    state.setEvents,
    state.setTasks,
    state.setTaskHistory,
    state.setFinances,
    state.setFinanceCategories,
  ]);

  return dataLoading;
}
