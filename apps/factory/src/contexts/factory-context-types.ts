import type { Dispatch, SetStateAction } from 'react';
import type {
  FinanceCategoryEntry,
  FinanceEntry,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  PizzaEvent,
  Task,
} from '../../../../shared/contracts/types';

export interface FactoryContextData {
  events: PizzaEvent[];
  finances: FinanceEntry[];
  financeCategories: FinanceCategoryEntry[];
  tasks: Task[];
  invoices: Invoice[];
  addFinance: (entry: Omit<FinanceEntry, 'id'>) => Promise<FinanceEntry>;
  updateFinance: (id: string, data: Partial<FinanceEntry>) => Promise<void>;
  settleFinance: (
    id: string,
    settlement: { amount: number; settledOn: string; paymentMethod?: string; reason?: string },
  ) => Promise<void>;
  deleteFinance: (id: string) => Promise<void>;
  reverseFinance: (id: string, reason?: string) => Promise<void>;
  addFinanceCategory: (entry: Omit<FinanceCategoryEntry, 'id'>) => Promise<FinanceCategoryEntry>;
  addEvent: (event: Omit<PizzaEvent, 'id' | 'createdAt'>) => Promise<PizzaEvent>;
  updateEvent: (id: string, data: Partial<PizzaEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addInvoice: (invoice: Invoice) => Promise<void>;
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;
  emitInvoice: (id: string) => Promise<Invoice>;
  pollInvoiceStatus: (id: string) => Promise<Invoice>;
}

export interface FactoryState {
  events: PizzaEvent[];
  setEvents: Dispatch<SetStateAction<PizzaEvent[]>>;
  finances: FinanceEntry[];
  setFinances: Dispatch<SetStateAction<FinanceEntry[]>>;
  financeCategories: FinanceCategoryEntry[];
  setFinanceCategories: Dispatch<SetStateAction<FinanceCategoryEntry[]>>;
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  invoices: Invoice[];
  setInvoices: Dispatch<SetStateAction<Invoice[]>>;
  refreshFinances: () => void;
}

export type { InvoiceItem, InvoiceStatus, Invoice };
