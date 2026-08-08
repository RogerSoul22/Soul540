import {
  getEffectiveSettlements,
  getOutstandingCents,
  isCancelledFinance,
  type FinancePolicyEntry,
} from './financePolicy';
import { getReportingUnit, type FinanceReportingView, type ReportingUnit } from './reportingUnitPolicy';

type SummaryEntry = FinancePolicyEntry & {
  id: string;
  eventId?: string;
  dueDate?: string;
  paymentMethod?: string;
  source?: ReportingUnit;
};

export type FinanceSummaryOptions = {
  view: FinanceReportingView;
  start?: string;
  end?: string;
  reportingUnit?: ReportingUnit;
};

export type FinanceSummary = {
  totalIncomeCents: number;
  totalExpenseCents: number;
  realizedIncomeCents: number;
  projectedIncomeCents: number;
  realizedExpenseCents: number;
  projectedExpenseCents: number;
  openReceivablesCents: number;
  netRealizedCents: number;
  byPaymentMethod: Array<{ method: string; amountCents: number; count: number }>;
  byEvent: Array<{ eventId: string; receivedCents: number; receivableCents: number; costsCents: number }>;
  excludedCancelled: number;
};

function isWithinPeriod(date: string, start?: string, end?: string): boolean {
  return (!start || date >= start) && (!end || date <= end);
}

function belongsToReportingUnit(source: ReportingUnit | undefined, date: string, reportingUnit?: ReportingUnit): boolean {
  return !reportingUnit || getReportingUnit(source, date) === reportingUnit;
}

export function buildFinanceSummary(entries: SummaryEntry[], options: FinanceSummaryOptions): FinanceSummary {
  let realizedIncomeCents = 0;
  let projectedIncomeCents = 0;
  let realizedExpenseCents = 0;
  let projectedExpenseCents = 0;
  let excludedCancelled = 0;
  const byPaymentMethod = new Map<string, { method: string; amountCents: number; count: number }>();
  const byEvent = new Map<string, { eventId: string; receivedCents: number; receivableCents: number; costsCents: number }>();

  for (const entry of entries) {
    if (isCancelledFinance(entry)) {
      excludedCancelled += 1;
      continue;
    }
    const source = entry.source || 'main';
    const eventTotals = entry.eventId
      ? byEvent.get(entry.eventId) || { eventId: entry.eventId, receivedCents: 0, receivableCents: 0, costsCents: 0 }
      : undefined;
    const realizedSettlements = getEffectiveSettlements(entry).filter((settlement) => {
      const relevantDate = options.view === 'cash' ? settlement.settledOn : entry.date;
      return isWithinPeriod(relevantDate, options.start, options.end)
        && belongsToReportingUnit(source, relevantDate, options.reportingUnit);
    });
    const realizedCents = realizedSettlements.reduce((total, settlement) => total + settlement.amountCents, 0);
    if (entry.type === 'revenue') {
      realizedIncomeCents += realizedCents;
      for (const settlement of realizedSettlements) {
        const method = settlement.paymentMethod || entry.paymentMethod || 'nao-informado';
        const current = byPaymentMethod.get(method) || { method, amountCents: 0, count: 0 };
        current.amountCents += settlement.amountCents;
        current.count += 1;
        byPaymentMethod.set(method, current);
      }
      if (eventTotals) eventTotals.receivedCents += realizedCents;
    } else {
      realizedExpenseCents += realizedCents;
      if (eventTotals) eventTotals.costsCents += realizedCents;
    }

    const forecastDate = options.view === 'cash' ? entry.dueDate || entry.date : entry.date;
    const outstandingCents = getOutstandingCents(entry);
    if (outstandingCents > 0 && isWithinPeriod(forecastDate, options.start, options.end) && belongsToReportingUnit(source, forecastDate, options.reportingUnit)) {
      if (entry.type === 'revenue') {
        projectedIncomeCents += outstandingCents;
        if (eventTotals) eventTotals.receivableCents += outstandingCents;
      } else {
        projectedExpenseCents += outstandingCents;
      }
    }
    if (eventTotals) byEvent.set(eventTotals.eventId, eventTotals);
  }

  return {
    totalIncomeCents: realizedIncomeCents + projectedIncomeCents,
    totalExpenseCents: realizedExpenseCents + projectedExpenseCents,
    realizedIncomeCents,
    projectedIncomeCents,
    realizedExpenseCents,
    projectedExpenseCents,
    openReceivablesCents: projectedIncomeCents,
    netRealizedCents: realizedIncomeCents - realizedExpenseCents,
    byPaymentMethod: [...byPaymentMethod.values()],
    byEvent: [...byEvent.values()],
    excludedCancelled,
  };
}
