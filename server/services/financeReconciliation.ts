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

type ReconciliationFindingDraft = Omit<
  ReconciliationFinding,
  'proposedChange' | 'affectedAmountCents' | 'estimatedCashImpactCents' | 'requiresApproval'
>;

interface ReconciliationFinance extends FinancePolicyEntry {
  id: string;
  eventId?: string;
  source?: string;
  kind?: string;
  automatic?: boolean;
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

function getExactAmountCents(finance: ReconciliationFinance): number | null {
  if (!Number.isFinite(finance.amount)) return null;
  const amountCents = Math.round(finance.amount * 100);
  return Math.abs(finance.amount * 100 - amountCents) < 0.000001 ? amountCents : null;
}

function needsCanonicalAmountCents(finance: ReconciliationFinance): boolean {
  const amountCents = getExactAmountCents(finance);
  return amountCents !== null && finance.amountCents !== amountCents;
}

function requiresAutomaticDepositCanonicalization(finance: ReconciliationFinance, event: ReconciliationEvent | undefined): boolean {
  return event?.status !== 'cancelled'
    && finance.kind === 'deposit'
    && finance.automatic === true
    && (finance.status === 'pending' || finance.status === 'paid')
    && !isCancelledFinance(finance)
    && isDateOnly(finance.date)
    && getExactAmountCents(finance) !== null
    && (
      !Array.isArray(finance.settlements)
      || finance.settlements.length === 0
      || needsCanonicalAmountCents(finance)
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

function withReadOnlyImpact(finding: ReconciliationFindingDraft, finance: ReconciliationFinance): ReconciliationFinding {
  return {
    ...finding,
    proposedChange: getProposedChange(finding.action),
    affectedAmountCents: getAffectedAmountCents(finance, finding.action),
    estimatedCashImpactCents: 0,
    requiresApproval: true,
  };
}

function escapeCsv(value: unknown): string {
  const text = value === undefined || value === null ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

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

    if (finance.status === 'received') {
      findings.push({
        financeId: finance.id,
        eventId: finance.eventId,
        source: finance.source,
        action: 'normalize_legacy_status',
        reason: 'LanÃ§amento legado usa o status recebido, substituÃ­do pelo status pago',
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
      !automaticDepositRequiresCanonicalization
      &&
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

  const financeById = new Map(finances.map((finance) => [finance.id, finance]));
  return findings.map((finding) => withReadOnlyImpact(finding, financeById.get(finding.financeId)!));
}
