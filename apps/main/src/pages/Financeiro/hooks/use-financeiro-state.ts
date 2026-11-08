import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../../contexts/AppContext';
import { getInitialFinancePeriod } from '../../../../../../shared/finance/financePeriod';
import { useFinanceImportController } from './use-finance-import-controller';
import type { DataScope } from './use-finance-derived-filters';
import { useFinanceFormState } from './use-finance-form-state';
import type { FinanceModalityFilter } from '../support/finance-modalities';
type TabType = 'geral' | 'despesas' | 'mensal' | 'lancamentos' | 'valores';
type FilterType = 'all' | 'revenue' | 'cost' | 'pending';
type CostFilter = 'all' | 'fixed' | 'variable';
export function useFinanceiroState() {
  const appState = useApp();
  const {
    events,
    finances,
    financeCategories,
    addFinance,
    updateFinance,
    settleFinance,
    deleteFinance,
    addFinanceCategory,
    deleteEvent,
    closeEventFinance,
    reopenEventFinance,
    refreshFinances,
  } = appState;
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('geral');
  const [costFilter, setCostFilter] = useState<CostFilter>('all');
  const [dataScope, setDataScope] = useState<DataScope>('main');
  const [franchiseFilter, setFranchiseFilter] = useState<string>('all');
  const [franchises, setFranchises] = useState<{ id: string; name: string }[]>([]);
  const [franchiseFinances, setFranchiseFinances] = useState<typeof finances>([]);
  const [franchiseEvents, setFranchiseEvents] = useState<typeof events>([]);
  const [factoryFinances, setFactoryFinances] = useState<typeof finances>([]);
  const [factoryEvents, setFactoryEvents] = useState<typeof events>([]);
  const [directEvents, setDirectEvents] = useState<typeof events>([]);
  const [financePeriod, setFinancePeriod] = useState(() => getInitialFinancePeriod());
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [modalityFilter, setModalityFilter] = useState<FinanceModalityFilter>('all');
  const [search, setSearch] = useState('');
  const [lancamentosPage, setLancamentosPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<(typeof events)[number] | null>(null);
  const [selectedFinance, setSelectedFinance] = useState<(typeof finances)[number] | null>(null);
  const [financePendingDelete, setFinancePendingDelete] = useState<(typeof finances)[number] | null>(null);
  const [deletingFinance, setDeletingFinance] = useState(false);
  const [editingFinanceId, setEditingFinanceId] = useState<string | null>(null);
  const formState = useFinanceFormState();
  const {
    showXmlModal,
    setShowXmlModal,
    xmlItems,
    setXmlItems,
    xmlSupplier,
    setXmlSupplier,
    xmlDate,
    setXmlDate,
    xmlImporting,
    setXmlImporting,
    xmlInputRef,
    showOfxModal,
    setShowOfxModal,
    ofxItems,
    setOfxItems,
    ofxBankAccount,
    setOfxBankAccount,
    ofxStatementBalance,
    setOfxStatementBalance,
    ofxText,
    setOfxText,
    ofxPreviewing,
    setOfxPreviewing,
    ofxImporting,
    setOfxImporting,
    ofxInputRef,
    handleXmlFile,
    handleXmlImport,
    handleOfxFile,
    handleOfxImport,
  } = useFinanceImportController({ addFinance, refreshFinances });
  const [eventSearch, setEventSearch] = useState('');
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const eventComboRef = useRef<HTMLDivElement>(null);
  return {
    ...appState,
    ...formState,
    searchParams,
    setSearchParams,
    activeTab,
    setActiveTab,
    costFilter,
    setCostFilter,
    dataScope,
    setDataScope,
    franchiseFilter,
    setFranchiseFilter,
    franchises,
    setFranchises,
    franchiseFinances,
    franchiseEvents,
    factoryFinances,
    factoryEvents,
    directEvents,
    setFranchiseFinances,
    setFranchiseEvents,
    setFactoryFinances,
    setFactoryEvents,
    setDirectEvents,
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
    showInfo,
    setShowInfo,
    selectedEvent,
    setSelectedEvent,
    selectedFinance,
    setSelectedFinance,
    financePendingDelete,
    setFinancePendingDelete,
    deletingFinance,
    setDeletingFinance,
    editingFinanceId,
    setEditingFinanceId,
    showXmlModal,
    setShowXmlModal,
    xmlItems,
    setXmlItems,
    xmlSupplier,
    setXmlSupplier,
    xmlDate,
    setXmlDate,
    xmlImporting,
    setXmlImporting,
    xmlInputRef,
    showOfxModal,
    setShowOfxModal,
    ofxItems,
    setOfxItems,
    ofxBankAccount,
    setOfxBankAccount,
    ofxStatementBalance,
    setOfxStatementBalance,
    ofxText,
    setOfxText,
    ofxPreviewing,
    setOfxPreviewing,
    ofxImporting,
    setOfxImporting,
    ofxInputRef,
    handleXmlFile,
    handleXmlImport,
    handleOfxFile,
    handleOfxImport,
    eventSearch,
    setEventSearch,
    showEventDropdown,
    setShowEventDropdown,
    eventComboRef,
  };
}
export type FinanceiroState = ReturnType<typeof useFinanceiroState>;
