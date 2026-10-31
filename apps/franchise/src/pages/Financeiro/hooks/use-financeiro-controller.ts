import { useFranchiseFinanceActions } from './use-franchise-finance-actions';
import { useFranchiseFinanceCategories } from './use-franchise-finance-categories';
import { useFranchiseFinancePeriod } from './use-franchise-finance-period';
import { useFranchiseFinanceState } from './use-franchise-finance-state';
import { formatMonth, safeFormat } from '../types/finance-controller-types';

export function useFinanceiroController() {
  const state = useFranchiseFinanceState();
  const categories = useFranchiseFinanceCategories(state);
  const period = useFranchiseFinancePeriod({ ...state, ...categories });
  const derived = { ...categories, ...period };
  const actions = useFranchiseFinanceActions({ state, derived });
  return {
    ...state,
    ...derived,
    ...actions,
    editingFinanceId: state.editingId,
    setEditingFinanceId: state.setEditingId,
    openEditFinance: actions.handleEdit,
    formatMonth,
    safeFormatDate: safeFormat,
  };
}

export type FranchiseFinanceController = ReturnType<typeof useFinanceiroController>;
