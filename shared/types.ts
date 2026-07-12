// Shared types used across main, franchise, and factory apps

// ── Events ──────────────────────────────────────────────────────────────────

export type EventStatus = 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface PizzaEvent {
  id: string;
  name: string;
  date: string;
  endDate?: string;
  time?: string;
  duration?: string;
  location: string;
  outOfCity?: boolean;
  phone?: string;
  guestCount: number;
  status: EventStatus;
  budget: number;
  menu: string[];
  notes: string;
  responsibleEmployeeId?: string;
  staffCount?: number;
  selectedEmployeeIds?: string[];
  paymentProofName?: string;
  contractPdfName?: string;
  createdBy?: string;
  createdAt: string;
  unit?: string;
  source?: string;
  celebration?: string;
  teamArrivalTime?: string;
  city?: string;
  guestsAdult?: number;
  guestsTeen?: number;
  guestsChild?: number;
  travelCost?: number;
  teamPizzaiolo?: string;
  teamHelper?: string;
  teamGarcon?: string;
  extrasLoucas?: number;
  extrasBebidas?: number;
  finalValue?: number;
  paymentMethod?: string;
  locationImageName?: string;
  locationImageData?: string;
  paymentProofData?: string;
  contractPdfData?: string;
  depositValue?: number;
  pixKey?: string;
  estimatedPizzas?: number;
  actualPizzas?: number;
  factoryProductionStatus?: 'pending' | 'preparing' | 'ready' | 'delivered';
  factoryProductionNotes?: string;
  factoryDoughBalls?: number;
  factorySauceKg?: number;
  factoryCheeseKg?: number;
  factoryPackagingUnits?: number;
  financialStatus?: 'open' | 'partial' | 'settled' | 'closed';
  financiallyClosedAt?: string;
  financiallyClosedBy?: string;
  financeSyncVersion?: number;
}

// ── Finances ─────────────────────────────────────────────────────────────────

export type FinanceType = 'revenue' | 'cost';
export type FinanceStatus = 'pending' | 'paid' | 'received';
export type FinanceOrigin = 'event' | 'manual' | 'factory_order' | 'bank_import';
export type FinanceKind = 'balance' | 'deposit' | 'travel' | 'commission' | 'expense' | 'manual';
export type SettlementStatus = 'open' | 'partial' | 'settled' | 'cancelled';

// Seções do DRE (Demonstrativo de Resultado), na ordem em que aparecem no relatório.
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

export type RecurrenceFrequency = 'monthly' | 'weekly' | 'yearly';

export interface FinanceEntry {
  id: string;
  eventId: string;
  type: FinanceType;
  category: string;
  description: string;
  amount: number;
  date: string;
  status: FinanceStatus;
  autoEventBudget?: boolean;
  origin?: FinanceOrigin;
  kind?: FinanceKind;
  paymentMethod?: string;
  dueDate?: string;
  settledAt?: string;
  settlementStatus?: SettlementStatus;
  automatic?: boolean;
  reversedAt?: string;
  reversedBy?: string;
  reversalReason?: string;
  employeeId?: string;
  source?: string;
  // Parcelamento: agrupa lançamentos gerados a partir de uma compra parcelada.
  installmentGroupId?: string;
  installmentNumber?: number;
  installmentTotal?: number;
  // Recorrência: agrupa ocorrências geradas a partir de um lançamento recorrente.
  recurrenceId?: string;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceEndDate?: string;
  // Identificacao de movimentos importados de extratos bancarios (OFX).
  externalId?: string;
  importBatchId?: string;
  bankAccount?: string;
  bankStatementBalance?: number;
}

// Categoria financeira personalizada, criada pelo usuário e associada a uma seção do DRE.
export interface FinanceCategoryEntry {
  id: string;
  key: string;
  label: string;
  type: FinanceType;
  section: DreSection;
  color?: string;
  source?: string;
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate?: string;
  eventId?: string;
  createdAt: string;
}

export interface TaskHistoryEntry {
  id: string;
  taskId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  assignee: string;
  dueDate?: string;
  eventId?: string;
  completedAt: string;
  source?: string;
}

// ── Invoices ──────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'rascunho' | 'emitida' | 'cancelada';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  // NF-e only
  ncm?: string;
  cfop?: string;
  unit?: string;
}

export interface Invoice {
  id: string;
  eventId: string;
  clientName: string;
  clientDocument: string;
  clientEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalValue: number;
  issueDate: string;
  notes: string;
  status: InvoiceStatus;
  // Tipo de documento
  type?: 'nfse' | 'nfe';
  serviceCode?: string;          // código de serviço municipal (NFS-e)

  // Endereço do tomador/destinatário
  clientAddress?: string;
  clientNumber?: string;
  clientDistrict?: string;
  clientCity?: string;
  clientState?: string;
  clientPostalCode?: string;

  // Emissão fiscal — campos genéricos (NF-e direto SEFAZ)
  emissaoStatus?: 'processing' | 'emitida' | 'erro';
  numeroNF?: string;
  chaveAcesso?: string;
  protocolo?: string;
  xmlEmitido?: string;
  emissaoMotivo?: string;

  // Legado nfe.io — mantido para compatibilidade com NFS-e
  nfeioId?: string;
  nfeioStatus?: 'processing' | 'issued' | 'error';
  nfeioNumber?: string;
  nfeioPdfUrl?: string;
  nfeioXmlUrl?: string;
  nfeioAccessKey?: string;
  nfeioProtocol?: string;
  nfeioRawResponse?: Record<string, unknown>;
  createdAt: string;
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'manager' | 'staff';
  isAdmin: boolean;
  permissions: string[];
  unit: 'main' | 'franchise' | 'factory';
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
