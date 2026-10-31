import { format, isValid, parseISO } from 'date-fns';
import type { useApp } from '../../../contexts/AppContext';
import type { RecurrenceFrequency } from '../../../../../../shared/contracts/types';
import { getNfeEmissionDate as formatNFeDate } from '@soul540/domain';

export type FinanceType = 'revenue' | 'cost';
export type FinanceStatus = 'pending' | 'paid';
export type TabType = 'geral' | 'despesas' | 'mensal' | 'lancamentos';
export type FilterType = 'all' | 'revenue' | 'cost' | 'pending';
export type CostFilter = 'all' | 'fixed' | 'variable';

export type XmlFinanceItem = {
  id: string;
  name: string;
  totalValue: number;
  quantity: number;
  measureUnit: string;
  unitValue: number;
  category: string;
  selected: boolean;
};

export type FinanceAppState = ReturnType<typeof useApp>;
export type FinanceEntry = FinanceAppState['finances'][number];
export type FinancePeriodState = {
  financePeriod: { start: string; end: string };
  periodFinances: FinanceEntry[];
  periodEvents: FinanceAppState['events'];
};
export type FinanceFormState = {
  formType: FinanceType;
  formEventId: string;
  formCategory: string;
  formDescription: string;
  formAmount: string;
  formDate: string;
  formStatus: FinanceStatus;
  formPaymentMethod: string;
  formInstallments: string;
  formRecurring: boolean;
  formRecurrenceFrequency: RecurrenceFrequency;
  formRecurrenceInterval: string;
  formRecurrenceTotal: string;
  recurrencePreview: string[];
};

export const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function parseNFeXmlForFinance(xmlText: string) {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  const get = (el: Element | Document, tag: string) => el.querySelector(tag)?.textContent?.trim() ?? '';
  const supplier = get(doc, 'emit xNome') || get(doc, 'xNome');
  const date = formatNFeDate(get(doc, 'dhEmi') || get(doc, 'dEmi'));
  const items = Array.from(doc.querySelectorAll('det prod'))
    .map((prod) => {
      const quantity = Number.parseFloat(get(prod, 'qCom')) || 0;
      const unitValue = Number.parseFloat(get(prod, 'vUnCom')) || 0;
      return {
        name: get(prod, 'xProd'),
        quantity,
        measureUnit: get(prod, 'uCom') || 'un',
        unitValue,
        totalValue: Number.parseFloat(get(prod, 'vProd')) || quantity * unitValue,
      };
    })
    .filter((item) => item.name && item.totalValue > 0);
  return { supplier, date, items };
}

export function safeFormat(date: string | undefined | null, pattern: string, options?: Parameters<typeof format>[2]) {
  if (!date) return '-';
  const parsed = parseISO(date);
  return isValid(parsed) ? format(parsed, pattern, options) : '-';
}

export function formatMonth(value: string) {
  const [year, month] = value.split('-');
  return `${MONTHS_PT[Number.parseInt(month, 10) - 1]} ${year?.substring(2)}`;
}

import type { useFinanceiroController } from '../hooks/use-financeiro-controller';

export type FactoryFinanceController = ReturnType<typeof useFinanceiroController>;
