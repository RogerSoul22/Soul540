import type {
  ReconciliationFinding,
  ReconciliationFinance,
  ReconciliationEvent,
  ReconciliationFindingDraft,
} from './finance-reconciliation-types';
import { isCancelledFinance, getSettledCents } from '../../../../../shared/finance/financePolicy';
import { isDateOnly } from '../../../../../shared/finance/financeDates';
import {
  isWithinPeriod,
  requiresAutomaticDepositCanonicalization,
  withReadOnlyImpact,
  escapeCsv,
} from './finance-reconciliation-utils';

export type { ReconciliationAction, ReconciliationFinding } from './finance-reconciliation-types';

export function reconciliationFindingsToCsv(findings: ReconciliationFinding[]): string {
  const columns = [
    'financeId',
    'eventId',
    'source',
    'action',
    'reason',
    'proposedChange',
    'affectedAmountCents',
    'estimatedCashImpactCents',
    'requiresApproval',
  ] as const;
  const rows = findings.map((finding) => columns.map((column) => escapeCsv(finding[column])).join(','));
  return [columns.join(','), ...rows].join('\n');
}

export function reconcileFinances(
  finances: ReconciliationFinance[],
  events: ReconciliationEvent[],
  start: string,
  end: string,
): ReconciliationFinding[] {
  const eventById = new Map(events.map((event) => [event.id, event]));
  const findings: ReconciliationFindingDraft[] = [];

  for (const finance of finances) {
    if (!isWithinPeriod(finance, start, end)) continue;
    const event = finance.eventId ? eventById.get(finance.eventId) : undefined;
    const automaticDepositRequiresCanonicalization = requiresAutomaticDepositCanonicalization(finance, event);

    if (automaticDepositRequiresCanonicalization) {
      findings.push({
        financeId: finance.id,
        eventId: finance.eventId,
        source: finance.source,
        action: 'settle_automatic_deposit',
        reason: 'Sinal autom\u00e1tico de evento sem registro can\u00f4nico de baixa',
      });
    }

    if (event?.status === 'cancelled' && !isCancelledFinance(finance)) {
      const settledCents = getSettledCents(finance);
      findings.push({
        financeId: finance.id,
        eventId: finance.eventId,
        source: finance.source,
        action: settledCents > 0 ? 'review_cancelled_event_settled' : 'cancel_open_forecast',
        reason:
          settledCents > 0
            ? 'Evento cancelado possui baixa; decidir reembolso, multa retida ou ajuste aprovado'
            : 'Previsão aberta vinculada a evento cancelado',
      });
    }

    if (!Number.isSafeInteger(finance.amountCents)) {
      findings.push({
        financeId: finance.id,
        eventId: finance.eventId,
        source: finance.source,
        action: 'add_amount_cents',
        reason: 'Lançamento legado sem valor canônico em centavos',
      });
    }

    if (
      Number.isFinite(finance.amount) &&
      Math.abs(finance.amount * 100 - Math.round(finance.amount * 100)) > 0.000001
    ) {
      findings.push({
        financeId: finance.id,
        eventId: finance.eventId,
        source: finance.source,
        action: 'review_amount_precision',
        reason: 'Valor legado possui fração de centavo e exige aprovação antes da conversão',
      });
    }

    if (!isDateOnly(finance.date)) {
      findings.push({
        financeId: finance.id,
        eventId: finance.eventId,
        source: finance.source,
        action: 'review_invalid_competence_date',
        reason: 'Data de competência ausente ou inválida',
      });
    }

    if (finance.status === 'received') {
      findings.push({
        financeId: finance.id,
        eventId: finance.eventId,
        source: finance.source,
        action: 'normalize_legacy_status',
        reason: 'Lançamento legado usa o status recebido, substituído pelo status pago',
      });
    }

    if (
      finance.settlementStatus === 'partial' &&
      (!Array.isArray(finance.settlements) || finance.settlements.length === 0)
    ) {
      findings.push({
        financeId: finance.id,
        eventId: finance.eventId,
        source: finance.source,
        action: 'review_legacy_partial',
        reason: 'Lançamento parcial legado sem detalhes das baixas',
      });
    } else if (
      !automaticDepositRequiresCanonicalization &&
      !Array.isArray(finance.settlements) &&
      !isCancelledFinance(finance) &&
      (finance.status === 'paid' || finance.status === 'received' || finance.settlementStatus === 'settled')
    ) {
      findings.push({
        financeId: finance.id,
        eventId: finance.eventId,
        source: finance.source,
        action: 'migrate_legacy_settlement',
        reason: 'Lançamento liquidado legado sem registro de baixa',
      });
    }
  }

  const financeById = new Map(finances.map((finance) => [finance.id, finance]));
  return findings.map((finding) => withReadOnlyImpact(finding, financeById.get(finding.financeId)!));
}
