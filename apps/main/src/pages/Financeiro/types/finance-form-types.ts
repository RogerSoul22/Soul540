import type { EventModality, FinanceEntry, FinanceType, RecurrenceFrequency } from '@soul540/contracts';
import type { PizzaEvent } from '@soul540/contracts';
import type { useApp } from '../../../contexts/AppContext';
type Setter<T> = (value: T) => void;
export type FinanceFormDependencies = Pick<
  ReturnType<typeof useApp>,
  'addFinance' | 'updateFinance' | 'deleteFinance'
> & {
  finances: FinanceEntry[];
  activeEvents: PizzaEvent[];
  formType: FinanceType;
  setFormType: Setter<FinanceType>;
  formModality: EventModality;
  setFormModality: Setter<EventModality>;
  formEventId: string;
  setFormEventId: Setter<string>;
  setEventSearch: Setter<string>;
  formCategory: string;
  setFormCategory: Setter<string>;
  formDescription: string;
  setFormDescription: Setter<string>;
  formAmount: string;
  setFormAmount: Setter<string>;
  formDate: string;
  setFormDate: Setter<string>;
  formPaymentMethod: string;
  setFormPaymentMethod: Setter<string>;
  formInstallments: string;
  setFormInstallments: Setter<string>;
  formRecurring: boolean;
  setFormRecurring: Setter<boolean>;
  formRecurrenceFrequency: RecurrenceFrequency;
  setFormRecurrenceFrequency: Setter<RecurrenceFrequency>;
  formRecurrenceInterval: string;
  setFormRecurrenceInterval: Setter<string>;
  formRecurrenceTotal: string;
  setFormRecurrenceTotal: Setter<string>;
  editingFinanceId: string | null;
  setEditingFinanceId: Setter<string | null>;
  setShowForm: Setter<boolean>;
  financePendingDelete: FinanceEntry | null;
  deletingFinance: boolean;
  setDeletingFinance: Setter<boolean>;
  setSelectedFinance: Setter<FinanceEntry | null>;
  setFinancePendingDelete: Setter<FinanceEntry | null>;
  recurrencePreview: string[];
};
