import type { EventModality } from './events';

export type FinanceType = 'revenue' | 'cost';
export type FinanceStatus = 'pending' | 'paid';
export type FinanceOrigin = 'event' | 'manual' | 'factory_order' | 'bank_import';
export type FinanceKind = 'balance' | 'deposit' | 'travel' | 'commission' | 'expense' | 'manual';
export type SettlementStatus = 'open' | 'partial' | 'settled' | 'cancelled';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type DreSection =
  | 'faturamentos'
  | 'deducoes'
  | 'custos-operacionais'
  | 'despesas-logistica'
  | 'despesas-administrativas'
  | 'despesas-comerciais'
  | 'despesas-financeiras'
  | 'receitas-nao-operacionais'
  | 'outras-saidas';

export interface FinanceSettlement {
  id: string;
  amountCents: number;
  externalId?: string;
  settledOn: string;
  settledAt: string;
  paymentMethod?: string;
  settledBy?: string;
  reason?: string;
  idempotencyKey: string;
}

export interface FinanceEntry {
  id: string;
  eventId: string;
  type: FinanceType;
  category: string;
  classificationStatus?: 'classified' | 'unclassified';
  description: string;
  amount: number;
  amountCents?: number;
  date: string;
  status: FinanceStatus;
  autoEventBudget?: boolean;
  origin?: FinanceOrigin;
  kind?: FinanceKind;
  paymentMethod?: string;
  dueDate?: string;
  settledAt?: string;
  settledCents?: number;
  settlements?: FinanceSettlement[];
  settlementStatus?: SettlementStatus;
  automatic?: boolean;
  reversedAt?: string;
  reversedBy?: string;
  reversalReason?: string;
  employeeId?: string;
  source?: string;
  installmentGroupId?: string;
  installmentNumber?: number;
  installmentTotal?: number;
  recurrenceId?: string;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceEndDate?: string;
  recurrenceInterval?: number;
  recurrenceTotal?: number;
  externalId?: string;
  importBatchId?: string;
  bankAccount?: string;
  bankStatementBalance?: number;
  modality?: EventModality;
}

export interface FinanceCategoryEntry {
  id: string;
  key: string;
  label: string;
  type: FinanceType;
  section: DreSection;
  color?: string;
  source?: string;
}
