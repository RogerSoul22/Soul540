import {
  getEffectiveSettlements,
  getSettledCents,
  isCancelledFinance,
  type FinanceSettlement,
  type FinancePolicyEntry,
} from '../../shared/financePolicy';
import { isDateOnly } from '../../shared/financeDates';

export type ReconciliationAction =
  | 'cancel_open_forecast'
  | 'review_cancelled_event_settled'
  | 'add_amount_cents'
  | 'migrate_legacy_settlement'
  | 'review_legacy_partial'
  | 'review_amount_precision'
  | 'review_invalid_competence_date';

export interface ReconciliationFinding {
  financeId: string;
  eventId?: string;
  source?: string;
  action: ReconciliationAction;
  reason: string;
}

interface ReconciliationFinance extends FinancePolicyEntry {
  id: string;
  eventId?: string;
  source?: string;
  settlements?: FinanceSettlement[];
}

interface ReconciliationEvent {
  id: string;
  status?: string;
}

function isWithinPeriod(entry: ReconciliationFinance, start: string, end: string): boolean {
  if (entry.date >= start && entry.date <= end) return true;
  return getEffectiveSettlements(entry).some((settlement) => settlement.settledOn >= start && settlement.settledOn <= end);
}

export function reconcileFinances(
  finances: ReconciliationFinance[],
  events: ReconciliationEvent[],
  start: string,
  end: string,
): ReconciliationFinding[] {
  const eventById = new Map(events.map((event) => [event.id, event]));
  const findings: ReconciliationFinding[] = [];

  for (const finance of finances) {
    if (!isWithinPeriod(finance, start, end)) continue;
    const event = finance.eventId ? eventById.get(finance.eventId) : undefined;

    if (event?.status === 'cancelled' && !isCancelledFinance(finance)) {
      const settledCents = getSettledCents(finance);
      findings.push({
        financeId: finance.id,
        eventId: finance.eventId,
        source: finance.source,
        action: settledCents > 0 ? 'review_cancelled_event_settled' : 'cancel_open_forecast',
        reason: settledCents > 0
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

    if (Number.isFinite(finance.amount) && Math.abs(finance.amount * 100 - Math.round(finance.amount * 100)) > 0.000001) {
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

    if (finance.settlementStatus === 'partial' && (!Array.isArray(finance.settlements) || finance.settlements.length === 0)) {
      findings.push({
        financeId: finance.id,
        eventId: finance.eventId,
        source: finance.source,
        action: 'review_legacy_partial',
        reason: 'Lançamento parcial legado sem detalhes das baixas',
      });
    } else if (
      !Array.isArray(finance.settlements)
      && !isCancelledFinance(finance)
      && (finance.status === 'paid' || finance.status === 'received' || finance.settlementStatus === 'settled')
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

  return findings;
}
