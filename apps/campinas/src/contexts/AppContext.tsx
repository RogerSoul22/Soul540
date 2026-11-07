import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import { apiFetch } from '../lib/api';
import type { FranchiseContextData, FranchiseState } from './franchise-context-types';
import { useFranchiseAppData } from './use-franchise-app-data';
import { useFranchiseEventActions } from './use-franchise-event-actions';
import { useFranchiseFinanceActions } from './use-franchise-finance-actions';
import { useFranchiseTaskActions } from './use-franchise-task-actions';

const AppContext = createContext<FranchiseContextData>({} as FranchiseContextData);

export function AppProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<FranchiseState['events']>([]);
  const [finances, setFinances] = useState<FranchiseState['finances']>([]);
  const [financeCategories, setFinanceCategories] = useState<FranchiseState['financeCategories']>([]);
  const [tasks, setTasks] = useState<FranchiseState['tasks']>([]);
  const [taskHistory, setTaskHistory] = useState<FranchiseState['taskHistory']>([]);

  const refreshFinances = useCallback(() => {
    apiFetch('/api/finances')
      .then((r) => r.json())
      .then(setFinances)
      .catch((error) => console.error('Falha ao carregar dados:', error));
  }, []);
  const refreshTaskHistory = useCallback(() => {
    apiFetch('/api/task-history')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setTaskHistory(data))
      .catch(() => {});
  }, []);
  const state: FranchiseState = {
    events,
    setEvents,
    finances,
    setFinances,
    financeCategories,
    setFinanceCategories,
    tasks,
    setTasks,
    taskHistory,
    setTaskHistory,
    refreshFinances,
    refreshTaskHistory,
  };

  const dataLoading = useFranchiseAppData(state);
  return (
    <AppContext.Provider
      value={{
        events,
        setEvents,
        finances,
        financeCategories,
        tasks,
        taskHistory,
        dataLoading,
        ...useFranchiseFinanceActions(state),
        ...useFranchiseEventActions(state),
        ...useFranchiseTaskActions(state),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
