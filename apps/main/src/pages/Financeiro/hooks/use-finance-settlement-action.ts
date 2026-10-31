import { useState } from 'react';
import type { FinanceEntry, FinanceStatus } from '@soul540/contracts';
import { notifyFeedback } from '@soul540/api-client';
import { calculateSettlementStatus, getOutstandingCents } from '../../../../../../shared/finance/financePolicy';
import { fromCents, parseCurrencyInput as parseCurrency } from '@soul540/domain';

type SettlementInput = {
  settleFinance: (
    id: string,
    data: {
      amount: number;
      settledOn: string;
      paymentMethod?: string;
      reason?: string;
    },
  ) => Promise<unknown>;
};

export type SettlementDraft = {
  amount: string;
  settledOn: string;
  paymentMethod: string;
  reason: string;
};

export function useFinanceSettlementAction({ settleFinance }: SettlementInput) {
  const [settlementEntry, setSettlementEntry] = useState<FinanceEntry | null>(null);
  const [settlementDraft, setSettlementDraft] = useState<SettlementDraft>({
    amount: '',
    settledOn: '',
    paymentMethod: '',
    reason: '',
  });

  const handleEventFinanceStatus = async (entry: FinanceEntry, status: FinanceStatus) => {
    if (status === 'pending') {
      notifyFeedback('Para reabrir ou cancelar uma baixa, use a ação correspondente no lançamento.');
      return;
    }
    const settlementStatus = calculateSettlementStatus(entry);
    if (settlementStatus === 'cancelled') {
      notifyFeedback('Este lançamento está cancelado.');
      return;
    }
    if (entry.status === 'paid' || settlementStatus === 'settled') return;
    const outstandingAmount = fromCents(getOutstandingCents(entry));
    setSettlementEntry(entry);
    setSettlementDraft({
      amount: outstandingAmount.toFixed(2).replace('.', ','),
      settledOn: entry.date,
      paymentMethod: entry.paymentMethod || '',
      reason: '',
    });
  };

  const updateSettlementDraft = (field: keyof SettlementDraft, value: string) => {
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
    await settleFinance(settlementEntry.id, {
      amount,
      settledOn: settlementDraft.settledOn,
      paymentMethod: settlementDraft.paymentMethod || undefined,
      reason: settlementDraft.reason || undefined,
    });
    closeSettlement();
  };

  return {
    handleEventFinanceStatus,
    settlementEntry,
    settlementDraft,
    updateSettlementDraft,
    closeSettlement,
    submitSettlement,
  };
}
