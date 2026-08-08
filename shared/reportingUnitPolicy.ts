import {
  getEffectiveSettlements,
  getFinanceAmountCents,
  isCancelledFinance,
  type FinancePolicyEntry,
} from './financePolicy';

export type FinanceReportingView = 'cash' | 'competence';
export type ReportingUnit = 'main' | 'franchise' | 'factory';

export const CAMPINAS_CONSOLIDATION_START = '2026-08-01';

export type ReportingAllocation = {
  source: ReportingUnit;
  reportingUnit: ReportingUnit;
  date: string;
  amountCents: number;
};

type FinanceWithSource = FinancePolicyEntry & { source?: string };

function getSourceUnit(source?: string): ReportingUnit {
  return source === 'franchise' || source === 'factory' || source === 'main' ? source : 'main';
}

export function getReportingUnit(source: string | undefined, relevantDate: string): ReportingUnit {
  const sourceUnit = getSourceUnit(source);
  if (sourceUnit === 'franchise' && relevantDate >= CAMPINAS_CONSOLIDATION_START) return 'main';
  return sourceUnit;
}

export function getFinanceReportingAllocations(entry: FinanceWithSource, view: FinanceReportingView): ReportingAllocation[] {
  if (isCancelledFinance(entry)) return [];
  const source = getSourceUnit(entry.source);
  if (view === 'competence') {
    return [{
      source,
      reportingUnit: getReportingUnit(source, entry.date),
      date: entry.date,
      amountCents: getFinanceAmountCents(entry),
    }];
  }

  return getEffectiveSettlements(entry).map((settlement) => ({
    source,
    reportingUnit: getReportingUnit(source, settlement.settledOn),
    date: settlement.settledOn,
    amountCents: settlement.amountCents,
  }));
}
