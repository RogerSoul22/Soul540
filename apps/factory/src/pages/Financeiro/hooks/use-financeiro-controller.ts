import { useFactoryFinanceActions } from './use-factory-finance-actions';
import { useFactoryFinanceCategories } from './use-factory-finance-categories';
import { useFactoryFinancePeriod } from './use-factory-finance-period';
import { useFactoryFinanceState } from './use-factory-finance-state';

export function useFinanceiroController() {
  const state = useFactoryFinanceState();
  const categories = useFactoryFinanceCategories(state);
  const period = useFactoryFinancePeriod({ ...state, ...categories });
  const derived = { ...categories, ...period };
  const actions = useFactoryFinanceActions({ state, derived });
  return { ...state, ...derived, ...actions };
}

export type FactoryFinanceController = ReturnType<typeof useFinanceiroController>;
