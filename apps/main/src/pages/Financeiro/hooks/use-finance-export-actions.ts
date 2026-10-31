import type { FinanceCategoryEntry, FinanceEntry } from '../../../../../../packages/contracts/src/index';
import { notifyFeedback } from '../../../../../../packages/api-client/src/index';
import {
  buildDreTemplateValues,
  DRE_TEMPLATE_INPUT_CELLS,
  DRE_TEMPLATE_SHEET,
} from '../../../../../../shared/finance/dreTemplate';
import type { FinancePeriod } from '../../../../../../shared/finance/financePeriod';
import { exportFinanceDreLegacy } from '../support/finance-legacy-dre-export';
import type { GroupedCategories } from '../support/finance-legacy-dre-export';
type FinanceExportInput = {
  filtered: FinanceEntry[];
  categoryLabels: Record<string, string>;
  financePeriod: FinancePeriod;
  periodFinances: FinanceEntry[];
  groupedRevenueCategories: GroupedCategories;
  groupedCostCategories: GroupedCategories;
  financeCategories: FinanceCategoryEntry[];
  dataScope: string;
};
const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const formatMonth = (ym: string) => {
  const [year, month] = ym.split('-');
  return `${MONTHS_PT[Number(month) - 1]} ${year?.slice(2)}`;
};
export function useFinanceExportActions({
  filtered,
  categoryLabels,
  financePeriod,
  periodFinances,
  groupedRevenueCategories,
  groupedCostCategories,
  financeCategories,
  dataScope,
}: FinanceExportInput) {
  const exportCSV = () => {
    const typeLabel: Record<string, string> = { revenue: 'Receita', cost: 'Custo' };
    const stLabel: Record<string, string> = { pending: 'Pendente', paid: 'Pago' };
    const rows = [
      ['Data', 'Tipo', 'Categoria', 'Descricao', 'Status', 'Valor'],
      ...filtered.map((f) =>
        [
          f.date,
          typeLabel[f.type] || f.type,
          categoryLabels[f.category] || f.category,
          `"${f.description.replace(/"/g, '""')}"`,
          stLabel[f.status] || f.status,
          f.amount.toFixed(2).replace('.', ','),
        ].join(';'),
      ),
    ];
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro-${financePeriod.start || 'todos'}_a_${financePeriod.end || 'todos'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportDRELegacy = () => exportFinanceDreLegacy(periodFinances, groupedRevenueCategories, groupedCostCategories);
  const exportDRE = async () => {
    const dreValues = buildDreTemplateValues(periodFinances, financeCategories);
    if (dreValues.size === 0) {
      notifyFeedback('Nenhum lançamento no período selecionado.');
      return;
    }
    try {
      const [{ default: ExcelJS }, templateResponse] = await Promise.all([
        import('exceljs'),
        fetch('/dre-2026-soul-pizza.xlsx'),
      ]);
      if (!templateResponse.ok) throw new Error('Modelo oficial do DRE nao encontrado.');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await templateResponse.arrayBuffer());
      const worksheet = workbook.getWorksheet(DRE_TEMPLATE_SHEET);
      if (!worksheet) throw new Error('A aba do DRE nao foi encontrada.');
      for (const address of DRE_TEMPLATE_INPUT_CELLS) worksheet.getCell(address).value = 0;
      for (const [address, amount] of dreValues) worksheet.getCell(address).value = amount;
      workbook.calcProperties.fullCalcOnLoad = true;
      const output = await workbook.xlsx.writeBuffer();
      const blob = new Blob([output as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DRE 2026 - SOUL PIZZA - ${dataScope}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      notifyFeedback(error instanceof Error ? error.message : 'Não foi possível exportar o DRE.');
    }
  };
  return { exportCSV, exportDRELegacy, exportDRE };
}
