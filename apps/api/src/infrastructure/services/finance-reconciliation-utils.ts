import {
  getEffectiveSettlements,
  getSettledCents,
  isCancelledFinance,
} from '../../../../../shared/finance/financePolicy';
import { isDateOnly } from '../../../../../shared/finance/financeDates';
import type {
  ReconciliationAction,
  ReconciliationFinance,
  ReconciliationEvent,
  ReconciliationFinding,
  ReconciliationFindingDraft,
} from './finance-reconciliation-types';

export function isWithinPeriod(entry: ReconciliationFinance, start: string, end: string): boolean {
  if (entry.date >= start && entry.date <= end) return true;
  return getEffectiveSettlements(entry).some(
    (settlement) => settlement.settledOn >= start && settlement.settledOn <= end,
  );
}

function getExactAmountCents(finance: ReconciliationFinance): number | null {
  if (!Number.isFinite(finance.amount)) return null;
  const amountCents = Math.round(finance.amount * 100);
  return Math.abs(finance.amount * 100 - amountCents) < 0.000001 ? amountCents : null;
}

function needsCanonicalAmountCents(finance: ReconciliationFinance): boolean {
  const amountCents = getExactAmountCents(finance);
  return amountCents !== null && finance.amountCents !== amountCents;
}

export function requiresAutomaticDepositCanonicalization(
  finance: ReconciliationFinance,
  event: ReconciliationEvent | undefined,
): boolean {
  return (
    event?.status !== 'cancelled' &&
    finance.kind === 'deposit' &&
    finance.automatic === true &&
    (finance.status === 'pending' || finance.status === 'paid') &&
    !isCancelledFinance(finance) &&
    isDateOnly(finance.date) &&
    getExactAmountCents(finance) !== null &&
    (!Array.isArray(finance.settlements) || finance.settlements.length === 0 || needsCanonicalAmountCents(finance))
  );
}

function getProposedChange(action: ReconciliationAction): string {
  switch (action) {
    case 'cancel_open_forecast':
      return 'Cancelar a previsão sem baixa e preservar o histórico';
    case 'review_cancelled_event_settled':
      return 'Registrar decisão de reembolso, multa retida ou ajuste aprovado';
    case 'add_amount_cents':
      return 'Adicionar o valor canônico em centavos sem alterar o valor monetário';
    case 'normalize_legacy_status':
      return 'Substituir o status legado received por paid sem alterar as baixas';
    case 'migrate_legacy_settlement':
      return 'Criar o registro de baixa legado com data e origem revisadas';
    case 'settle_automatic_deposit':
      return 'Registrar o sinal autom\u00e1tico como pago na data do lan\u00e7amento';
    case 'review_legacy_partial':
      return 'Revisar as baixas parciais antes de criar os registros de liquidação';
    case 'review_amount_precision':
      return 'Aprovar o arredondamento antes de converter o valor para centavos';
    case 'review_invalid_competence_date':
      return 'Definir uma data de competência válida antes de qualquer ajuste';
  }
}

function getAffectedAmountCents(finance: ReconciliationFinance, action: ReconciliationAction): number | null {
  if (action === 'review_cancelled_event_settled') return getSettledCents(finance);
  const exactAmountCents = getExactAmountCents(finance);
  if (exactAmountCents !== null) return exactAmountCents;
  if (Number.isSafeInteger(finance.amountCents)) return finance.amountCents!;
  return null;
}

export function withReadOnlyImpact(
  finding: ReconciliationFindingDraft,
  finance: ReconciliationFinance,
): ReconciliationFinding {
  return {
    ...finding,
    proposedChange: getProposedChange(finding.action),
    affectedAmountCents: getAffectedAmountCents(finance, finding.action),
    estimatedCashImpactCents: 0,
    requiresApproval: true,
  };
}

export function escapeCsv(value: unknown): string {
  const text = value === undefined || value === null ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
