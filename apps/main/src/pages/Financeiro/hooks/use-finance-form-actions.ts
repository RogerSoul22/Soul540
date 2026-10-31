import type { FormEvent } from 'react';
import {
  advanceFinanceRecurrence as advanceRecurrence,
  formatCurrencyInput as formatCurrency,
  parseCurrencyInput as parseCurrency,
} from '../../../../../../packages/domain/src/index';
import type { FinanceEntry } from '../../../../../../packages/contracts/src/index';
import type { FinanceFormDependencies } from '../types/finance-form-types';
import { useFinanceDeleteActions } from './use-finance-delete-actions';

export function useFinanceFormActions(dependencies: FinanceFormDependencies) {
  const {
    activeEvents,
    addFinance,
    updateFinance,
    formType,
    setFormType,
    formModality,
    setFormModality,
    formEventId,
    setFormEventId,
    setEventSearch,
    formCategory,
    setFormCategory,
    formDescription,
    setFormDescription,
    formAmount,
    setFormAmount,
    formDate,
    setFormDate,
    formPaymentMethod,
    setFormPaymentMethod,
    formInstallments,
    setFormInstallments,
    formRecurring,
    setFormRecurring,
    formRecurrenceFrequency,
    setFormRecurrenceFrequency,
    formRecurrenceInterval,
    setFormRecurrenceInterval,
    formRecurrenceTotal,
    setFormRecurrenceTotal,
    editingFinanceId,
    setEditingFinanceId,
    setShowForm,
    recurrencePreview,
  } = dependencies;
  const { requestFinanceDelete, confirmFinanceDelete } = useFinanceDeleteActions(dependencies);

  const resetForm = () => {
    setFormType('revenue');
    setFormModality('evento_avulso');
    setFormEventId('');
    setEventSearch('');
    setFormCategory('');
    setFormDescription('');
    setFormAmount('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPaymentMethod('');
    setFormInstallments('1');
    setFormRecurring(false);
    setFormRecurrenceFrequency('monthly');
    setFormRecurrenceInterval('1');
    setFormRecurrenceTotal('12');
    setEditingFinanceId(null);
  };

  const openEditFinance = (entry: FinanceEntry) => {
    setEditingFinanceId(entry.id);
    setFormType(entry.type);
    setFormModality(entry.modality === 'feirinha' ? 'feirinha' : 'evento_avulso');
    setFormEventId(entry.eventId || '');
    const event = activeEvents.find((item) => item.id === entry.eventId);
    setEventSearch(event?.name || '');
    setFormCategory(entry.category);
    setFormDescription(entry.description);
    setFormAmount(entry.amount ? formatCurrency(String(Math.round(entry.amount * 100))) : '');
    setFormDate(entry.date);
    setFormPaymentMethod(entry.paymentMethod || '');
    setFormInstallments('1');
    setFormRecurring(false);
    setShowForm(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formCategory || !formAmount) return;
    const base = {
      eventId: formEventId,
      modality: formModality,
      type: formType,
      category: formCategory,
      description: formDescription,
      amount: parseCurrency(formAmount),
      date: formDate,
      status: 'pending' as const,
      paymentMethod: formPaymentMethod || undefined,
    };
    if (editingFinanceId) {
      const { eventId: _eventId, ...editableBase } = base;
      await updateFinance(editingFinanceId, editableBase);
      resetForm();
      setShowForm(false);
      return;
    }
    const installments = Math.max(1, parseInt(formInstallments, 10) || 1);
    if (installments > 1) {
      const groupId = `parc-${Date.now()}`;
      for (let i = 0; i < installments; i++) {
        await addFinance({
          ...base,
          description: formDescription
            ? `${formDescription} (${i + 1}/${installments})`
            : `Parcela ${i + 1}/${installments}`,
          date: advanceRecurrence(formDate, 'monthly', i),
          status: 'pending' as const,
          installmentGroupId: groupId,
          installmentNumber: i + 1,
          installmentTotal: installments,
        });
      }
    } else if (formRecurring) {
      const recurrenceId = `rec-${Date.now()}`;
      const interval = Math.max(1, Math.min(365, Number(formRecurrenceInterval) || 1));
      const total = Math.max(1, Math.min(366, Number(formRecurrenceTotal) || 1));
      const endDate = recurrencePreview[recurrencePreview.length - 1] || formDate;
      let current = formDate;
      for (let i = 0; i < total; i += 1) {
        await addFinance({
          ...base,
          date: current,
          status: 'pending' as const,
          recurrenceId,
          recurrenceFrequency: formRecurrenceFrequency,
          recurrenceEndDate: endDate,
          recurrenceInterval: interval,
          recurrenceTotal: total,
        });
        current = advanceRecurrence(current, formRecurrenceFrequency, interval);
      }
    } else {
      await addFinance(base);
    }
    resetForm();
    setShowForm(false);
  };

  return {
    resetForm,
    openEditFinance,
    handleFinanceEditAction: openEditFinance,
    requestFinanceDelete,
    confirmFinanceDelete,
    handleSubmit,
  };
}
