import type { FinanceSettlement, FinancePolicyEntry } from '../../../../../shared/finance/financePolicy';

export type ReconciliationAction =
  | 'cancel_open_forecast'
  | 'review_cancelled_event_settled'
  | 'add_amount_cents'
  | 'normalize_legacy_status'
  | 'migrate_legacy_settlement'
  | 'settle_automatic_deposit'
  | 'review_legacy_partial'
  | 'review_amount_precision'
  | 'review_invalid_competence_date';

export interface ReconciliationFinding {
  financeId: string;
  eventId?: string;
  source?: string;
  action: ReconciliationAction;
  reason: string;
  proposedChange: string;
  affectedAmountCents: number | null;
  estimatedCashImpactCents: number;
  requiresApproval: boolean;
}

export type ReconciliationFindingDraft = Omit<
  ReconciliationFinding,
  'proposedChange' | 'affectedAmountCents' | 'estimatedCashImpactCents' | 'requiresApproval'
>;

export interface ReconciliationFinance extends FinancePolicyEntry {
  id: string;
  eventId?: string;
  source?: string;
  kind?: string;
  automatic?: boolean;
  settlements?: FinanceSettlement[];
}

export interface ReconciliationEvent {
  id: string;
  status?: string;
}
