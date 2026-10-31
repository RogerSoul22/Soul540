import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { advanceFinanceRecurrence as advanceRecurrence } from '../../../../../../packages/domain/src/index';
import { getInitialFinancePeriod } from '../../../../../../shared/finance/financePeriod';
import type { DreSection, RecurrenceFrequency } from '../../../../../../shared/contracts/types';
import { useFranchiseFinanceImport } from './use-franchise-finance-import';
import type {
  CostFilter,
  FilterType,
  FinanceModalityFilter,
  FinanceStatus,
  FinanceType,
  TabType,
} from '../types/finance-controller-types';

export function useFranchiseFinanceState() {
  const app = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('geral');
  const [costFilter, setCostFilter] = useState<CostFilter>('all');
  const [financePeriod, setFinancePeriod] = useState(() => getInitialFinancePeriod());
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [modalityFilter, setModalityFilter] = useState<FinanceModalityFilter>('all');
  const [search, setSearch] = useState('');
  const [lancamentosPage, setLancamentosPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedFinancialEvent, setSelectedFinancialEvent] = useState<(typeof app.events)[number] | null>(null);
  const [formType, setFormType] = useState<FinanceType>('cost');
  const [formModality, setFormModality] = useState<'feirinha' | 'evento_avulso'>('evento_avulso');
  const [formEventId, setFormEventId] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState<FinanceStatus>('pending');
  const [formPaymentMethod, setFormPaymentMethod] = useState('');
  const [formInstallments, setFormInstallments] = useState('1');
  const [formRecurring, setFormRecurring] = useState(false);
  const [formRecurrenceFrequency, setFormRecurrenceFrequency] = useState<RecurrenceFrequency>('monthly');
  const [formRecurrenceInterval, setFormRecurrenceInterval] = useState('1');
  const [formRecurrenceTotal, setFormRecurrenceTotal] = useState('12');
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
  }, [formDate, formRecurrenceFrequency, formRecurrenceInterval, formRecurrenceTotal, formRecurring]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [newCategorySection, setNewCategorySection] = useState<DreSection>('despesas-administrativas');
  const [savingCategory, setSavingCategory] = useState(false);
  const [eventSearch, setEventSearch] = useState('');
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const eventComboRef = useRef<HTMLDivElement>(null);
  const imports = useFranchiseFinanceImport({ addFinance: app.addFinance });

  const openEventDropdown = () => {
    const rect = eventComboRef.current?.getBoundingClientRect();
    if (rect)
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    setShowEventDropdown(true);
  };
  useEffect(() => {
    if (!showEventDropdown) return;
    const handler = (event: MouseEvent) => {
      if (eventComboRef.current && !eventComboRef.current.contains(event.target as Node)) {
        setShowEventDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEventDropdown]);

  return {
    ...app,
    activeTab,
    setActiveTab,
    costFilter,
    setCostFilter,
    financePeriod,
    setFinancePeriod,
    filterType,
    setFilterType,
    modalityFilter,
    setModalityFilter,
    search,
    setSearch,
    lancamentosPage,
    setLancamentosPage,
    showForm,
    setShowForm,
    editingId,
    setEditingId,
    showInfo,
    setShowInfo,
    selectedFinancialEvent,
    setSelectedFinancialEvent,
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
    formStatus,
    setFormStatus,
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
    eventSearch,
    setEventSearch,
    showEventDropdown,
    setShowEventDropdown,
    dropdownPos,
    setDropdownPos,
    eventComboRef,
    openEventDropdown,
    ...imports,
  };
}

export type FranchiseFinanceState = ReturnType<typeof useFranchiseFinanceState>;
