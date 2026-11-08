import { notifyFeedback } from '../../../../../../packages/api-client/src/index';
import { useFinanceDerivedFilters } from './use-finance-derived-filters';
import { useFinanceExportActions } from './use-finance-export-actions';
import { useFinanceFormActions } from './use-finance-form-actions';
import { useFinancePeriodDerivations } from './use-finance-period-derivations';
import { useFinanceSettlementAction } from './use-finance-settlement-action';
import { useFinanceiroEffects } from './use-financeiro-effects';
import { useFinanceiroState } from './use-financeiro-state';
import { useAuth } from '../../../hooks/useAuth';

export function useFinanceiroController() {
  const state = useFinanceiroState();
  const { isAdmin, user } = useAuth();
  const canAccessConsolidatedData = isAdmin && user?.unit === 'main';
  useFinanceiroEffects(state);

  const scope = useFinanceDerivedFilters({
    finances: state.finances,
    events: state.events,
    financeCategories: state.financeCategories,
    franchiseFinances: state.franchiseFinances,
    franchiseEvents: state.franchiseEvents,
    factoryFinances: state.factoryFinances,
    factoryEvents: state.factoryEvents,
    directEvents: state.directEvents,
    dataScope: state.dataScope,
    franchiseFilter: state.franchiseFilter,
    eventSearch: state.eventSearch,
    formType: state.formType,
  });

  const period = useFinancePeriodDerivations({
    activeFinances: scope.activeFinances,
    activeEvents: scope.activeEvents,
    financePeriod: state.financePeriod,
    filterType: state.filterType,
    modalityFilter: state.modalityFilter,
    search: state.search,
    categoryLabels: scope.categoryLabels,
    categoryColors: scope.categoryColors,
  });

  const exports = useFinanceExportActions({
    filtered: period.filtered,
    categoryLabels: scope.categoryLabels,
    financePeriod: state.financePeriod,
    periodFinances: period.periodFinances,
    groupedRevenueCategories: scope.groupedRevenueCategories,
    groupedCostCategories: scope.groupedCostCategories,
    financeCategories: state.financeCategories,
    dataScope: state.dataScope,
  });

  const forms = useFinanceFormActions({
    ...state,
    activeEvents: scope.activeEvents,
  });

  const settlement = useFinanceSettlementAction({
    updateFinance: state.updateFinance,
    settleFinance: state.settleFinance,
    canEdit: state.dataScope === 'main',
  });
  const canEditEntries = state.dataScope === 'main';
  const setDataScope = (scope: typeof state.dataScope) => {
    if (!canAccessConsolidatedData) return;
    state.setSelectedFinance(null);
    state.setFinancePendingDelete(null);
    state.setShowForm(false);
    state.setShowXmlModal(false);
    state.setShowOfxModal(false);
    forms.resetForm();
    settlement.closeSettlement();
    state.setDataScope(scope);
    state.setFranchiseFilter('all');
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
    ...state,
    setDataScope,
    canAccessConsolidatedData,
    canEditEntries,
    ...scope,
    ...period,
    ...exports,
    ...settlement,
    ...forms,
    handleCreateCategory,
  };
}

export type FinanceiroController = ReturnType<typeof useFinanceiroController>;
