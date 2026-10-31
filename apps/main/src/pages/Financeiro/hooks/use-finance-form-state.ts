import { useMemo, useState } from 'react';
import type { DreSection, FinanceType, RecurrenceFrequency } from '../../../../../../packages/contracts/src/index';
import { advanceFinanceRecurrence as advanceRecurrence } from '../../../../../../packages/domain/src/index';
import type { EventModality } from '../../../../../../packages/contracts/src/index';

export function useFinanceFormState() {
  const [formType, setFormType] = useState<FinanceType>('cost');
  const [formModality, setFormModality] = useState<EventModality>('evento_avulso');
  const [formEventId, setFormEventId] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPaymentMethod, setFormPaymentMethod] = useState('');
  const [formInstallments, setFormInstallments] = useState('1');
  const [formRecurring, setFormRecurring] = useState(false);
  const [formRecurrenceFrequency, setFormRecurrenceFrequency] = useState<RecurrenceFrequency>('monthly');
  const [formRecurrenceInterval, setFormRecurrenceInterval] = useState('1');
  const [formRecurrenceTotal, setFormRecurrenceTotal] = useState('12');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [newCategorySection, setNewCategorySection] = useState<DreSection>('despesas-administrativas');
  const [savingCategory, setSavingCategory] = useState(false);
  const recurrencePreview = useMemo(() => {
    if (!formRecurring || !formDate) return [];
    const interval = Math.max(1, Math.min(365, Number(formRecurrenceInterval) || 1));
    const total = Math.max(1, Math.min(366, Number(formRecurrenceTotal) || 1));
    const dates: string[] = [];
    let current = formDate;
    for (let index = 0; index < total; index += 1) {
      dates.push(current);
      current = advanceRecurrence(current, formRecurrenceFrequency, interval);
    }
    return dates;
  }, [formRecurring, formDate, formRecurrenceFrequency, formRecurrenceInterval, formRecurrenceTotal]);
  return {
    formType,
    setFormType,
    formModality,
    setFormModality,
    formEventId,
    setFormEventId,
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
    recurrencePreview,
    showCategoryModal,
    setShowCategoryModal,
    newCategoryLabel,
    setNewCategoryLabel,
    newCategorySection,
    setNewCategorySection,
    savingCategory,
    setSavingCategory,
  };
}
