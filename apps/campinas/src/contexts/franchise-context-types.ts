import type { Dispatch, SetStateAction } from 'react';
import type {
  FinanceCategoryEntry,
  FinanceEntry,
  PizzaEvent,
  Task,
  TaskHistoryEntry,
} from '../../../../shared/contracts/types';

export interface FranchiseContextData {
  events: PizzaEvent[];
  setEvents: Dispatch<SetStateAction<PizzaEvent[]>>;
  finances: FinanceEntry[];
  financeCategories: FinanceCategoryEntry[];
  tasks: Task[];
  taskHistory: TaskHistoryEntry[];
  dataLoading: boolean;
  addTaskHistory: (entry: Omit<TaskHistoryEntry, 'id'>) => Promise<void>;
  deleteTaskHistory: (id: string) => Promise<void>;
  addFinance: (entry: Omit<FinanceEntry, 'id'>) => Promise<FinanceEntry>;
  updateFinance: (id: string, data: Partial<FinanceEntry>) => Promise<void>;
  settleFinance: (
    id: string,
    settlement: {
      amount: number;
      settledOn: string;
      paymentMethod?: string;
      reason?: string;
    },
  ) => Promise<void>;
  deleteFinance: (id: string) => Promise<void>;
  reverseFinance: (id: string, reason?: string) => Promise<void>;
  addFinanceCategory: (entry: Omit<FinanceCategoryEntry, 'id'>) => Promise<FinanceCategoryEntry>;
  addEvent: (event: Omit<PizzaEvent, 'id' | 'createdAt'>) => Promise<PizzaEvent>;
  updateEvent: (id: string, data: Partial<PizzaEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  closeEventFinance: (id: string) => Promise<void>;
  reopenEventFinance: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export interface FranchiseState {
  events: PizzaEvent[];
  setEvents: Dispatch<SetStateAction<PizzaEvent[]>>;
  finances: FinanceEntry[];
  setFinances: Dispatch<SetStateAction<FinanceEntry[]>>;
  financeCategories: FinanceCategoryEntry[];
  setFinanceCategories: Dispatch<SetStateAction<FinanceCategoryEntry[]>>;
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  taskHistory: TaskHistoryEntry[];
  setTaskHistory: Dispatch<SetStateAction<TaskHistoryEntry[]>>;
  refreshFinances: () => void;
  refreshTaskHistory: () => void;
}
