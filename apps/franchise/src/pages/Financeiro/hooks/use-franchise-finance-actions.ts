import { useState } from 'react';
import {
  formatCurrencyInput as formatCurrency,
  formatCurrencyPtBr as formatBRL,
  parseCurrencyInput as parseCurrency,
} from '@soul540/domain';
import { notifyFeedback } from '@soul540/api-client';
import { exportFranchiseFinanceCsv, exportFranchiseFinanceDre } from '../support/finance-export-actions';
import { useFranchiseFinanceFormActions } from './use-franchise-finance-form-actions';
import type { FranchiseFinanceState } from './use-franchise-finance-state';
import type { FinanceStatus } from '../types/finance-controller-types';
import type { useFranchiseFinanceCategories } from './use-franchise-finance-categories';
import type { useFranchiseFinancePeriod } from './use-franchise-finance-period';

type Derived = ReturnType<typeof useFranchiseFinanceCategories> & ReturnType<typeof useFranchiseFinancePeriod>;

type Props = { state: FranchiseFinanceState; derived: Derived };

export type FranchiseSettlementDraft = {
  amount: string;
  settledOn: string;
  paymentMethod: string;
  reason: string;
};

export function useFranchiseFinanceActions({ state, derived }: Props) {
  const form = useFranchiseFinanceFormActions(state);
  const [settlementEntry, setSettlementEntry] = useState<FranchiseFinanceState['finances'][number] | null>(null);
  const [settlementDraft, setSettlementDraft] = useState<FranchiseSettlementDraft>({
    amount: '',
    settledOn: '',
    paymentMethod: '',
    reason: '',
  });
  const handleEventFinanceStatus = async (entry: FranchiseFinanceState['finances'][number], status: FinanceStatus) => {
    if (status === 'pending') {
      notifyFeedback('Para reabrir ou cancelar uma baixa, use o comando específico com justificativa.');
      return;
    }
    if (entry.status === status) return;
    setSettlementEntry(entry);
    setSettlementDraft({
      amount: entry.amount.toFixed(2).replace('.', ','),
      settledOn: entry.date,
      paymentMethod: entry.paymentMethod || '',
      reason: '',
    });
  };
  const updateSettlementDraft = (field: keyof FranchiseSettlementDraft, value: string) => {
    setSettlementDraft((current) => ({ ...current, [field]: value }));
  };
  const closeSettlement = () => setSettlementEntry(null);
  const submitSettlement = async () => {
    if (!settlementEntry) return;
    const amount = parseCurrency(settlementDraft.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      notifyFeedback('Informe um valor de baixa válido.');
      return;
    }
    if (!settlementDraft.settledOn) {
      notifyFeedback('Informe a data efetiva da baixa.');
      return;
    }
    await state.settleFinance(settlementEntry.id, {
      amount,
      settledOn: settlementDraft.settledOn,
      paymentMethod: settlementDraft.paymentMethod || undefined,
      reason: settlementDraft.reason || undefined,
    });
    closeSettlement();
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
    settlementEntry,
    settlementDraft,
    updateSettlementDraft,
    closeSettlement,
    submitSettlement,
    handleCreateCategory,
    exportCSV: () => exportFranchiseFinanceCsv(derived.filtered, derived.categoryLabels, state.financePeriod),
    exportDRE: () =>
      exportFranchiseFinanceDre(
        derived.periodFinances,
        derived.groupedRevenueCategories,
        derived.groupedCostCategories,
      ),
  };
}
