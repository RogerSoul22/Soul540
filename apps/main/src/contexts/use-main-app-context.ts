import { useCallback, useState } from 'react';
import type {
  FinanceCategoryEntry,
  FinanceEntry,
  Invoice,
  PizzaEvent,
  Task,
  TaskHistoryEntry,
} from '@soul540/contracts';
import { apiFetch } from '../lib/api';
import type { AppContextData, AppDataState } from './app-context-types';
import { useMainAppData } from './use-main-app-data';
import { useMainEventActions } from './use-main-event-actions';
import { useMainFinanceActions } from './use-main-finance-actions';
import { useMainInvoiceActions } from './use-main-invoice-actions';
import { useMainTaskActions } from './use-main-task-actions';

export function useMainAppContext(): AppContextData {
  const [events, setEvents] = useState<PizzaEvent[]>([]);
  const [finances, setFinances] = useState<FinanceEntry[]>([]);
  const [financeCategories, setFinanceCategories] = useState<FinanceCategoryEntry[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskHistory, setTaskHistory] = useState<TaskHistoryEntry[]>([]);

  const refreshFinances = useCallback(() => {
    apiFetch('/api/finances', { headers: { 'X-System': 'main' } })
      .then((response) => response.json())
      .then(setFinances)
      .catch((error) => console.error('Falha ao carregar dados:', error));
  }, []);

  const refreshTasks = useCallback(() => {
    apiFetch('/api/tasks', { headers: { 'X-System': 'main' } })
      .then((response) => response.json())
      .then(setTasks)
      .catch((error) => console.error('Falha ao carregar dados:', error));
  }, []);

  const refreshTaskHistory = useCallback(() => {
    apiFetch('/api/task-history', { headers: { 'X-System': 'main' } })
      .then((response) => response.json())
      .then((data) => Array.isArray(data) && setTaskHistory(data))
      .catch(() => {});
  }, []);

  const state: AppDataState = {
    events,
    setEvents,
    finances,
    setFinances,
    financeCategories,
    setFinanceCategories,
    invoices,
    setInvoices,
    tasks,
    setTasks,
    taskHistory,
    setTaskHistory,
    refreshFinances,
    refreshTaskHistory,
  };

  useMainAppData(state);

  return {
    events,
    finances,
    financeCategories,
    invoices,
    tasks,
    taskHistory,
    ...useMainFinanceActions(state),
    ...useMainInvoiceActions(state),
    ...useMainEventActions(state),
    ...useMainTaskActions(state),
    refreshFinances,
    refreshTasks,
    refreshTaskHistory,
  };
}
