import { notifyFeedback } from '@soul540/api-client';
import type { FinanceEntry } from '@soul540/contracts';
import type { FinanceFormDependencies } from '../types/finance-form-types';

type FinanceDeleteDependencies = Pick<
  FinanceFormDependencies,
  | 'deleteFinance'
  | 'financePendingDelete'
  | 'deletingFinance'
  | 'setDeletingFinance'
  | 'setSelectedFinance'
  | 'setFinancePendingDelete'
>;

export function useFinanceDeleteActions({
  deleteFinance,
  financePendingDelete,
  deletingFinance,
  setDeletingFinance,
  setSelectedFinance,
  setFinancePendingDelete,
}: FinanceDeleteDependencies) {
  const requestFinanceDelete = (entry: FinanceEntry) => {
    setSelectedFinance(null);
    setFinancePendingDelete(entry);
  };

  const confirmFinanceDelete = async () => {
    if (!financePendingDelete || deletingFinance) return;
    setDeletingFinance(true);
    try {
      await deleteFinance(financePendingDelete.id);
      setFinancePendingDelete(null);
    } catch (error) {
      notifyFeedback(error instanceof Error ? error.message : 'Não foi possível excluir o lançamento.');
    } finally {
      setDeletingFinance(false);
    }
  };

  return { requestFinanceDelete, confirmFinanceDelete };
}
