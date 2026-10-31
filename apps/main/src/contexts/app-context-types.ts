import type {
  FinanceCategoryEntry,
  FinanceEntry,
  Invoice,
  PizzaEvent,
  Task,
  TaskHistoryEntry,
} from '@soul540/contracts';

export interface AppContextData {
  events: PizzaEvent[];
  finances: FinanceEntry[];
  financeCategories: FinanceCategoryEntry[];
  invoices: Invoice[];
  tasks: Task[];
  taskHistory: TaskHistoryEntry[];
  addTaskHistory: (entry: Omit<TaskHistoryEntry, 'id'>) => Promise<void>;
  deleteTaskHistory: (id: string) => Promise<void>;
  refreshTaskHistory: () => void;
  addFinance: (entry: Omit<FinanceEntry, 'id'>) => Promise<FinanceEntry>;
  updateFinance: (id: string, data: Partial<FinanceEntry>) => Promise<void>;
  settleFinance: (
    id: string,
    settlement: { amount: number; settledOn: string; paymentMethod?: string; reason?: string },
  ) => Promise<void>;
  deleteFinance: (id: string) => Promise<void>;
  reverseFinance: (id: string, reason?: string) => Promise<void>;
  addFinanceCategory: (entry: Omit<FinanceCategoryEntry, 'id'>) => Promise<FinanceCategoryEntry>;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  emitInvoice: (id: string) => Promise<Invoice>;
  pollInvoiceStatus: (id: string) => Promise<Invoice>;
  addEvent: (event: Omit<PizzaEvent, 'id' | 'createdAt'>) => Promise<PizzaEvent>;
  updateEvent: (id: string, data: Partial<PizzaEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  closeEventFinance: (id: string) => Promise<void>;
  reopenEventFinance: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  refreshFinances: () => void;
  refreshTasks: () => void;
}

export interface AppDataState {
  events: PizzaEvent[];
  setEvents: React.Dispatch<React.SetStateAction<PizzaEvent[]>>;
  finances: FinanceEntry[];
  setFinances: React.Dispatch<React.SetStateAction<FinanceEntry[]>>;
  financeCategories: FinanceCategoryEntry[];
  setFinanceCategories: React.Dispatch<React.SetStateAction<FinanceCategoryEntry[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  taskHistory: TaskHistoryEntry[];
  setTaskHistory: React.Dispatch<React.SetStateAction<TaskHistoryEntry[]>>;
  refreshFinances: () => void;
  refreshTaskHistory: () => void;
}
