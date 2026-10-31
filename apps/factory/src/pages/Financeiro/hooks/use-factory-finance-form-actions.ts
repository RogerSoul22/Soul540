import type { FormEvent } from 'react';
import {
  advanceFinanceRecurrence as advanceRecurrence,
  formatCurrencyInput as formatCurrency,
  parseCurrencyInput as parseCurrency,
} from '../../../../../../packages/domain/src/index';
import type { FinanceEntry } from '../types/finance-controller-types';
import type { FactoryFinanceState } from './use-factory-finance-state';

type Props = FactoryFinanceState & { recurrencePreview: string[] };

export function useFactoryFinanceFormActions(state: Props) {
  const resetForm = () => {
    state.setEditingId(null);
    state.setFormType('revenue');
    state.setFormEventId('');
    state.setEventSearch('');
    state.setFormCategory('');
    state.setFormDescription('');
    state.setFormAmount('');
    state.setFormDate(new Date().toISOString().split('T')[0]);
    state.setFormStatus('pending');
    state.setFormPaymentMethod('');
    state.setFormInstallments('1');
    state.setFormRecurring(false);
    state.setFormRecurrenceFrequency('monthly');
    state.setFormRecurrenceInterval('1');
    state.setFormRecurrenceTotal('12');
  };
  const handleEdit = (entry: FinanceEntry) => {
    state.setEditingId(entry.id);
    state.setFormType(entry.type);
    state.setFormEventId(entry.eventId || '');
    state.setEventSearch(state.events.find((event) => event.id === entry.eventId)?.name || '');
    state.setFormCategory(entry.category);
    state.setFormDescription(entry.description || '');
    state.setFormAmount(formatCurrency(String(Math.round(entry.amount * 100))));
    state.setFormDate(entry.date);
    state.setFormStatus(entry.status);
    state.setFormPaymentMethod(entry.paymentMethod || '');
    state.setFormInstallments('1');
    state.setFormRecurring(false);
    state.setShowForm(true);
  };
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!state.formCategory || !state.formAmount) return;
    const base = {
      eventId: state.formEventId,
      type: state.formType,
      category: state.formCategory,
      description: state.formDescription,
      amount: parseCurrency(state.formAmount),
      date: state.formDate,
      status: state.formStatus,
      paymentMethod: state.formPaymentMethod || undefined,
    };
    if (state.editingId) {
      const { eventId: _eventId, ...editable } = base;
      await state.updateFinance(state.editingId, editable);
      resetForm();
      state.setShowForm(false);
      return;
    }
    const installments = Math.max(1, Number.parseInt(state.formInstallments, 10) || 1);
    if (installments > 1) {
      const groupId = `parc-${Date.now()}`;
      for (let index = 0; index < installments; index += 1) {
        await state.addFinance({
          ...base,
          description: state.formDescription
            ? `${state.formDescription} (${index + 1}/${installments})`
            : `Parcela ${index + 1}/${installments}`,
          date: advanceRecurrence(state.formDate, 'monthly', index),
          status: index === 0 ? state.formStatus : 'pending',
          installmentGroupId: groupId,
          installmentNumber: index + 1,
          installmentTotal: installments,
        });
      }
    } else if (state.formRecurring) {
      const recurrenceId = `rec-${Date.now()}`;
      const interval = Math.max(1, Math.min(365, Number(state.formRecurrenceInterval) || 1));
      const total = Math.max(1, Math.min(366, Number(state.formRecurrenceTotal) || 1));
      let current = state.formDate;
      for (let index = 0; index < total; index += 1) {
        await state.addFinance({
          ...base,
          date: current,
          status: index === 0 ? state.formStatus : 'pending',
          recurrenceId,
          recurrenceFrequency: state.formRecurrenceFrequency,
          recurrenceEndDate: state.recurrencePreview[state.recurrencePreview.length - 1] || state.formDate,
          recurrenceInterval: interval,
          recurrenceTotal: total,
        });
        current = advanceRecurrence(current, state.formRecurrenceFrequency, interval);
      }
    } else {
      await state.addFinance(base);
    }
    resetForm();
    state.setShowForm(false);
  };
  return { resetForm, handleEdit, handleSubmit };
}
