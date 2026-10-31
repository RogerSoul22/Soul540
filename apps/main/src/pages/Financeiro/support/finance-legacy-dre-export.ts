import { notifyFeedback } from '../../../../../../packages/api-client/src/index';
import type { FinanceType } from '../../../../../../packages/contracts/src/index';
import { DRE_SECTIONS, type CategoryDef } from '../../../../../../shared/finance/financeCategories';
import type { DreSection } from '../../../../../../shared/contracts/types';
import type { FinanceEntry } from '../../../../../../packages/contracts/src/index';

export type GroupedCategories = Array<{
  section: { key: DreSection };
  categories: CategoryDef[];
}>;

export function exportFinanceDreLegacy(
  periodFinances: FinanceEntry[],
  groupedRevenueCategories: GroupedCategories,
  groupedCostCategories: GroupedCategories,
) {
  const availablePeriodMonths = [
    ...new Set(periodFinances.map((finance) => finance.date?.slice(0, 7)).filter(Boolean) as string[]),
  ].sort();
  if (availablePeriodMonths.length === 0) {
    notifyFeedback('Nenhum lançamento no período selecionado.');
    return;
  }
  const months = availablePeriodMonths;
  const formatValue = (value: number) => value.toFixed(2).replace('.', ',');
  const monthAmount = (categoryKey: string, type: FinanceType, month: string) =>
    periodFinances
      .filter(
        (finance) =>
          finance.type === type && finance.category === categoryKey && finance.date && finance.date.startsWith(month),
      )
      .reduce((total, finance) => total + finance.amount, 0);
  const sectionCategories = new Map<DreSection, CategoryDef[]>();
  for (const group of [...groupedRevenueCategories, ...groupedCostCategories]) {
    sectionCategories.set(group.section.key, group.categories);
  }
  const rows: string[][] = [['Categoria', ...months.map(formatMonth), 'Total']];
  const sectionTotals: Record<string, number[]> = {};
  for (const section of DRE_SECTIONS) {
    const categories = sectionCategories.get(section.key) || [];
    rows.push([section.label, ...months.map(() => ''), '']);
    const totals = months.map(() => 0);
    for (const category of categories) {
      const values = months.map((month) => monthAmount(category.key, section.type, month));
      values.forEach((value, index) => {
        totals[index] += value;
      });
      rows.push([
        category.label,
        ...values.map(formatValue),
        formatValue(values.reduce((total, value) => total + value, 0)),
      ]);
    }
    rows.push([
      `Total ${section.label}`,
      ...totals.map(formatValue),
      formatValue(totals.reduce((total, value) => total + value, 0)),
    ]);
    sectionTotals[section.key] = totals;
  }
  appendDreSummary(rows, sectionTotals, formatValue);
  const blob = new Blob([rows.map((row) => row.join(';')).join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dre-${months[0]}_a_${months[months.length - 1]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function appendDreSummary(rows: string[][], totals: Record<string, number[]>, formatValue: (value: number) => string) {
  const faturamentos = totals.faturamentos;
  const deducoes = totals.deducoes;
  const receitaLiquida = faturamentos.map((value, index) => value - deducoes[index]);
  appendSummaryRow(rows, '( = ) Receita Liquida', receitaLiquida, formatValue);
  const totalCustos = totals['custos-operacionais'].map((value, index) => value + totals['despesas-logistica'][index]);
  appendSummaryRow(rows, 'Total Custos', totalCustos, formatValue);
  const lucroBruto = receitaLiquida.map((value, index) => value - totalCustos[index]);
  appendSummaryRow(rows, '( = ) Lucro Bruto / Margem', lucroBruto, formatValue);
  const totalDespesas = totals['despesas-administrativas'].map(
    (value, index) => value + totals['despesas-comerciais'][index] + totals['despesas-financeiras'][index],
  );
  appendSummaryRow(rows, 'Total Despesas Adm/Comerciais/Financeiras', totalDespesas, formatValue);
  const lucroLiquido = lucroBruto.map((value, index) => value - totalDespesas[index]);
  appendSummaryRow(rows, '( = ) Lucro Liquido', lucroLiquido, formatValue);
  let accumulated = 0;
  const accumulatedResult = lucroLiquido.map((value) => {
    accumulated += value;
    return accumulated;
  });
  appendSummaryRow(rows, '( = ) Resultado Acumulado', accumulatedResult, formatValue);
  const result = lucroLiquido.map(
    (value, index) => value + totals['receitas-nao-operacionais'][index] - totals['outras-saidas'][index],
  );
  appendSummaryRow(rows, '( = ) Resultado Final', result, formatValue);
}

function appendSummaryRow(rows: string[][], label: string, values: number[], formatValue: (value: number) => string) {
  rows.push([label, ...values.map(formatValue), formatValue(values.reduce((total, value) => total + value, 0))]);
}

function formatMonth(value: string) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const [year, month] = value.split('-');
  return `${months[Number(month) - 1]} ${year?.slice(2)}`;
}
