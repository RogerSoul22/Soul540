import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import { apiFetch } from '../lib/api';
import type { Invoice } from '../../../../shared/contracts/types';
import type { FactoryContextData, FactoryState } from './factory-context-types';
import { useFactoryAppData } from './use-factory-app-data';
import { useFactoryEventActions } from './use-factory-event-actions';
import { useFactoryFinanceActions } from './use-factory-finance-actions';
import { useFactoryInvoiceActions } from './use-factory-invoice-actions';
import { useFactoryTaskActions } from './use-factory-task-actions';

const AppContext = createContext<FactoryContextData>({} as FactoryContextData);

export function AppProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<FactoryState['events']>([]);
  const [finances, setFinances] = useState<FactoryState['finances']>([]);
  const [financeCategories, setFinanceCategories] = useState<FactoryState['financeCategories']>([]);
  const [tasks, setTasks] = useState<FactoryState['tasks']>([]);
  const [invoices, setInvoices] = useState<FactoryState['invoices']>([]);

  const refreshFinances = useCallback(() => {
    apiFetch('/api/finances')
      .then((r) => r.json())
      .then(setFinances)
      .catch((error) => console.error('Falha ao carregar dados:', error));
  }, []);
  const state: FactoryState = {
    events,
    setEvents,
    finances,
    setFinances,
    financeCategories,
    setFinanceCategories,
    tasks,
    setTasks,
    invoices,
    setInvoices,
    refreshFinances,
  };

  useFactoryAppData(state);
  const financeActions = useFactoryFinanceActions(state);
  return (
    <AppContext.Provider
      value={{
        events,
        finances,
        financeCategories,
        tasks,
        invoices,
        ...financeActions,
        ...useFactoryEventActions(state),
        ...useFactoryTaskActions(state),
        ...useFactoryInvoiceActions(state),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

export type { Invoice };
