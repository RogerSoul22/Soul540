import type { FinancePeriod } from '../../../../../../shared/finance/financePeriod';
import { notifyFeedback } from '../../../../../../packages/api-client/src/index';
import { DRE_SECTIONS, type CategoryDef } from '../../../../../../shared/finance/financeCategories';
import type { DreSection } from '../../../../../../shared/contracts/types';
import type { FinanceEntry, FinanceType } from '../types/finance-controller-types';
import { formatMonth } from '../types/finance-controller-types';

export function exportFranchiseFinanceCsv(
  filtered: FinanceEntry[],
  categoryLabels: Record<string, string>,
  financePeriod: FinancePeriod,
) {
  const typeLabels: Record<string, string> = {
    revenue: 'Receita',
    cost: 'Custo',
  };
  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    paid: 'Pago',
  };
  const rows = [
    ['Data', 'Tipo', 'Categoria', 'Descrição', 'Status', 'Valor (R$)'].join(';'),
    ...filtered.map((finance) =>
      [
        finance.date,
        typeLabels[finance.type] || finance.type,
        categoryLabels[finance.category] || finance.category,
        `"${(finance.description || '').replace(/"/g, '""')}"`,
        statusLabels[finance.status] || finance.status,
        finance.amount.toFixed(2).replace('.', ','),
      ].join(';'),
    ),
  ];
  const blob = new Blob(['\uFEFF' + rows.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `financeiro-itu-${financePeriod.start || 'todos'}_a_${financePeriod.end || 'todos'}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportFranchiseFinanceDre(
  periodFinances: FinanceEntry[],
  groupedRevenueCategories: {
    section: { key: DreSection };
    categories: CategoryDef[];
  }[],
  groupedCostCategories: {
    section: { key: DreSection };
    categories: CategoryDef[];
  }[],
) {
  const months = [
    ...new Set(periodFinances.map((finance) => finance.date?.slice(0, 7)).filter(Boolean) as string[]),
  ].sort();
  if (!months.length) {
    notifyFeedback('Nenhum lançamento financeiro para exportar.');
    return;
  }
  const formatValue = (value: number) => value.toFixed(2).replace('.', ',');
  const amountFor = (category: string, type: FinanceType, month: string) =>
    periodFinances
      .filter((finance) => finance.type === type && finance.category === category && finance.date.startsWith(month))
      .reduce((sum, finance) => sum + finance.amount, 0);
  const sections = new Map<DreSection, CategoryDef[]>();
  [...groupedRevenueCategories, ...groupedCostCategories].forEach((group) =>
    sections.set(group.section.key, group.categories),
  );
  const rows: string[][] = [['Categoria', ...months.map(formatMonth), 'Total']];
  const totals: Record<string, number[]> = {};
  for (const section of DRE_SECTIONS) {
    const categories = sections.get(section.key) || [];
    rows.push([section.label, ...months.map(() => ''), '']);
    const values = months.map(() => 0);
    for (const category of categories) {
      const amounts = months.map((month) => amountFor(category.key, section.type, month));
      amounts.forEach((amount, index) => {
        values[index] += amount;
      });
      rows.push([category.label, ...amounts.map(formatValue), formatValue(amounts.reduce((a, b) => a + b, 0))]);
    }
    rows.push([`Total ${section.label}`, ...values.map(formatValue), formatValue(values.reduce((a, b) => a + b, 0))]);
    totals[section.key] = values;
  }
  const combine = (left: number[], right: number[]) => left.map((value, index) => value + right[index]);
  const subtract = (left: number[], right: number[]) => left.map((value, index) => value - right[index]);
  const addResult = (label: string, values: number[]) =>
    rows.push([label, ...values.map(formatValue), formatValue(values.reduce((a, b) => a + b, 0))]);
  const liquidRevenue = subtract(totals.faturamentos, totals.deducoes);
  addResult('( = ) Receita Líquida Operacional', liquidRevenue);
  const totalCosts = combine(totals['custos-operacionais'], totals['despesas-logistica']);
  addResult('Total Custos', totalCosts);
  const grossProfit = subtract(liquidRevenue, totalCosts);
  addResult('( = ) Lucro Bruto / Margem de Contribuição', grossProfit);
  const totalExpenses = combine(
    combine(totals['despesas-administrativas'], totals['despesas-comerciais']),
    totals['despesas-financeiras'],
  );
  addResult('Total Despesas Adm/Comerciais/Financeiras', totalExpenses);
  const netProfit = subtract(grossProfit, totalExpenses);
  addResult('( = ) Lucro Líquido Operacional', netProfit);
  let accumulated = 0;
  addResult(
    '( = ) Resultado Líquido Acumulado',
    netProfit.map((value) => (accumulated += value)),
  );
  addResult(
    '( = ) Resultado Após Empréstimos/Investimentos',
    netProfit.map(
      (value, index) => value + totals['receitas-nao-operacionais'][index] - totals['outras-saidas'][index],
    ),
  );
  const blob = new Blob(['\uFEFF' + rows.map((row) => row.join(';')).join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `dre-itu-${months[0]}_a_${months[months.length - 1]}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
