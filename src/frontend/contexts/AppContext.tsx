import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { PizzaEvent } from '@backend/domain/entities/Event';
import type { FinanceEntry } from '@backend/domain/entities/Finance';
import type { Invoice } from '@backend/domain/entities/Invoice';
import type { Task } from '@backend/domain/entities/Task';

interface AppContextData {
  events: PizzaEvent[];
  finances: FinanceEntry[];
  invoices: Invoice[];
  tasks: Task[];
  addFinance: (entry: Omit<FinanceEntry, 'id'>) => Promise<FinanceEntry>;
  updateFinance: (id: string, data: Partial<FinanceEntry>) => Promise<void>;
  deleteFinance: (id: string) => Promise<void>;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  addEvent: (event: Omit<PizzaEvent, 'id' | 'createdAt'>) => Promise<PizzaEvent>;
  updateEvent: (id: string, data: Partial<PizzaEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  refreshFinances: () => void;
  refreshTasks: () => void;
}

const AppContext = createContext<AppContextData>({} as AppContextData);

export function AppProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<PizzaEvent[]>([]);
  const [finances, setFinances] = useState<FinanceEntry[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadData = () => {
    const token = localStorage.getItem('soul540_token');
    const headers: HeadersInit = { 'X-System': 'main', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    fetch('/api/events', { headers }).then(r => r.json()).then(setEvents).catch((err) => console.error('Falha ao carregar dados:', err));
    fetch('/api/tasks', { headers }).then(r => r.json()).then(setTasks).catch((err) => console.error('Falha ao carregar dados:', err));
    fetch('/api/finances', { headers }).then(r => r.json()).then(setFinances).catch((err) => console.error('Falha ao carregar dados:', err));
    fetch('/api/invoices', { headers }).then(r => r.json()).then(setInvoices).catch((err) => console.error('Falha ao carregar dados:', err));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('soul540:refresh', loadData);
    return () => window.removeEventListener('soul540:refresh', loadData);
  }, []);

  const buildHeaders = (withBody = false): HeadersInit => {
    const token = localStorage.getItem('soul540_token');
    return {
      ...(withBody ? { 'Content-Type': 'application/json' } : {}),
      'X-System': 'main',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Finance (API)
  const addFinance = useCallback(async (data: Omit<FinanceEntry, 'id'>) => {
    const res = await fetch('/api/finances', {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao criar lançamento financeiro');
    const created: FinanceEntry = await res.json();
    setFinances((prev) => [created, ...prev]);
    return created;
  }, []);
  const updateFinance = useCallback(async (id: string, data: Partial<FinanceEntry>) => {
    const res = await fetch(`/api/finances/${id}`, {
      method: 'PUT',
      headers: buildHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao atualizar lançamento financeiro');
    const updated: FinanceEntry = await res.json();
    setFinances((prev) => prev.map((f) => (f.id === id ? updated : f)));
  }, []);
  const deleteFinance = useCallback(async (id: string) => {
    const res = await fetch(`/api/finances/${id}`, { method: 'DELETE', headers: buildHeaders() });
    if (!res.ok) throw new Error('Falha ao excluir lançamento financeiro');
    setFinances((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // Invoice (API)
  const addInvoice = useCallback(async (invoice: Invoice) => {
    const { id: _id, ...data } = invoice;
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao criar nota fiscal');
    const created: Invoice = await res.json();
    setInvoices((prev) => [created, ...prev]);
  }, []);
  const updateInvoice = useCallback(async (id: string, data: Partial<Invoice>) => {
    const res = await fetch(`/api/invoices/${id}`, {
      method: 'PUT',
      headers: buildHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao atualizar nota fiscal');
    const updated: Invoice = await res.json();
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
  }, []);
  const deleteInvoice = useCallback(async (id: string) => {
    const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE', headers: buildHeaders() });
    if (!res.ok) throw new Error('Falha ao excluir nota fiscal');
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  }, []);

  const refreshFinances = useCallback(() => {
    const token = localStorage.getItem('soul540_token');
    const headers: HeadersInit = { 'X-System': 'main', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    fetch('/api/finances', { headers }).then(r => r.json()).then(setFinances).catch((err) => console.error('Falha ao carregar dados:', err));
  }, []);

  const refreshTasks = useCallback(() => {
    const token = localStorage.getItem('soul540_token');
    const headers: HeadersInit = { 'X-System': 'main', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    fetch('/api/tasks', { headers }).then(r => r.json()).then(setTasks).catch((err) => console.error('Falha ao carregar dados:', err));
  }, []);

  // Events (API)
  const addEvent = useCallback(async (data: Omit<PizzaEvent, 'id' | 'createdAt'>) => {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao criar evento');
    const created: PizzaEvent = await res.json();
    setEvents((prev) => [...prev, created]);
    refreshFinances();
    return created;
  }, [refreshFinances]);

  const updateEvent = useCallback(async (id: string, data: Partial<PizzaEvent>) => {
    const res = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: buildHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao atualizar evento');
    const updated: PizzaEvent = await res.json();
    setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
    refreshFinances();
  }, [refreshFinances]);

  const deleteEvent = useCallback(async (id: string) => {
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE', headers: buildHeaders() });
    if (!res.ok) throw new Error('Falha ao excluir evento');
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setFinances((prev) => prev.filter((f) => f.eventId !== id));
  }, []);

  // Tasks (API)
  const addTask = useCallback(async (data: Omit<Task, 'id' | 'createdAt'>) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao criar tarefa');
    const created: Task = await res.json();
    setTasks((prev) => [...prev, created]);
    return created;
  }, []);

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: buildHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao atualizar tarefa');
    const updated: Task = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE', headers: buildHeaders() });
    if (!res.ok) throw new Error('Falha ao excluir tarefa');
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        events, finances, invoices, tasks,
        addFinance, updateFinance, deleteFinance,
        addInvoice, updateInvoice, deleteInvoice,
        addEvent, updateEvent, deleteEvent,
        addTask, updateTask, deleteTask,
        refreshFinances, refreshTasks,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}
