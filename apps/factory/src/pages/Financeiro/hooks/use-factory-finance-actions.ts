import {
  formatCurrencyInput as formatCurrency,
  formatCurrencyPtBr as formatBRL,
  parseCurrencyInput as parseCurrency,
} from '../../../../../../packages/domain/src/index';
import { notifyFeedback } from '../../../../../../packages/api-client/src/index';
import { exportFactoryFinanceCsv, exportFactoryFinanceDre } from '../support/finance-export-actions';
import { useFactoryFinanceFormActions } from './use-factory-finance-form-actions';
import type { FactoryFinanceState } from './use-factory-finance-state';
import type { FinanceStatus } from '../types/finance-controller-types';
import type { useFactoryFinanceCategories } from './use-factory-finance-categories';
import type { useFactoryFinancePeriod } from './use-factory-finance-period';

type Derived = ReturnType<typeof useFactoryFinanceCategories> & ReturnType<typeof useFactoryFinancePeriod>;

type Props = { state: FactoryFinanceState; derived: Derived };

export function useFactoryFinanceActions({ state, derived }: Props) {
  const form = useFactoryFinanceFormActions(state);
  const handleEventFinanceStatus = async (entry: FactoryFinanceState['finances'][number], status: FinanceStatus) => {
    if (entry.status === status) return;
    try {
      await state.updateFinance(entry.id, { status });
    } catch (error) {
      notifyFeedback(error instanceof Error ? error.message : 'Não foi possível alterar o status do lançamento.');
    }
  };
  const handleCreateCategory = async () => {
    if (!state.newCategoryLabel.trim()) return;
    state.setSavingCategory(true);
    try {
      const created = await state.addFinanceCategory({
        key: '',
        label: state.newCategoryLabel.trim(),
        type: state.formType,
        section: state.newCategorySection,
        color: '#64748b',
      } as never);
      state.setFormCategory(created.key);
      state.setShowCategoryModal(false);
      state.setNewCategoryLabel('');
    } catch {
      notifyFeedback('Não foi possível criar a categoria.');
    } finally {
      state.setSavingCategory(false);
    }
  };
  return {
    formatCurrency,
    formatBRL,
    parseCurrency,
    ...form,
    handleEventFinanceStatus,
    handleCreateCategory,
    exportCSV: () => exportFactoryFinanceCsv(derived.filtered, derived.categoryLabels, state.financePeriod),
    exportDRE: () =>
      exportFactoryFinanceDre(derived.periodFinances, derived.groupedRevenueCategories, derived.groupedCostCategories),
  };
}
