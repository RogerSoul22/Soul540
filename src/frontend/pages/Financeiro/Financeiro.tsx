import type { FormEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

// ── NF-e XML helpers ──────────────────────────────────────────────────────────
type XmlFinanceItem = {
  id: string;
  name: string;
  totalValue: number;
  quantity: number;
  measureUnit: string;
  unitValue: number;
  category: string;
  selected: boolean;
};

type OfxFinanceItem = {
  id: string;
  externalId: string;
  description: string;
  date: string;
  amount: number;
  type: FinanceType;
  category: string;
  selected: boolean;
  decision: 'duplicate' | 'link' | 'ambiguous' | 'create_unclassified';
  financeId?: string;
};

function unusedLegacyOfxParser(ofxText: string): { bankAccount: string; balance?: number; items: Omit<OfxFinanceItem, 'id' | 'category' | 'selected' | 'decision' | 'financeId'>[] } {
  const value = (source: string, tag: string) => {
    const match = source.match(new RegExp(`<${tag}[^>]*>\\s*([^<\\r\\n]+)`, 'i'));
    return match?.[1]?.trim() ?? '';
  };
  const bankId = value(ofxText, 'BANKID') || value(ofxText, 'ORG') || 'banco';
  const accountId = value(ofxText, 'ACCTID') || 'conta';
  const bankAccount = `${bankId} - ${accountId}`;
  const balanceRaw = value(ofxText, 'BALAMT');
  const transactionBlocks = ofxText.match(/<STMTTRN\b[^>]*>[\s\S]*?(?=<\/STMTTRN>|<STMTTRN\b|<LEDGERBAL\b|<BANKTRANLIST\b|$)/gi) ?? [];
  const items = transactionBlocks.map((block, index) => {
    const amount = Number(value(block, 'TRNAMT').replace(',', '.'));
    const rawDate = value(block, 'DTPOSTED');
    const fitId = value(block, 'FITID') || `${rawDate}-${amount}-${index}`;
    const description = value(block, 'MEMO') || value(block, 'NAME') || value(block, 'TRNTYPE') || 'Movimento bancário';
    return {
      externalId: `ofx:${bankId}:${accountId}:${fitId}`.slice(0, 300),
      description,
      date: /^\d{8}/.test(rawDate) ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}` : '',
      amount: Math.abs(amount),
      type: amount >= 0 ? 'revenue' as const : 'cost' as const,
    };
  }).filter((item) => item.date && Number.isFinite(item.amount) && item.amount > 0);
  if (!items.length) throw new Error('Nenhum movimento bancário encontrado');
  return { bankAccount, balance: balanceRaw ? Number(balanceRaw.replace(',', '.')) : undefined, items };
}

function formatNFeDate(raw: string): string {
  if (!raw) return new Date().toISOString().split('T')[0];
  const s = raw.replace(/-/g, '').replace(/T.*/, '');
  if (s.length === 8) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  return raw.split('T')[0] ?? new Date().toISOString().split('T')[0];
}

function parseNFeXmlForFinance(xmlText: string): { supplier: string; date: string; items: Omit<XmlFinanceItem, 'id' | 'selected' | 'category'>[] } {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  const get = (el: Element | Document, tag: string) =>
    el.querySelector(tag)?.textContent?.trim() ?? '';
  const supplier = get(doc, 'emit xNome') || get(doc, 'xNome');
  const rawDate = get(doc, 'dhEmi') || get(doc, 'dEmi');
  const date = formatNFeDate(rawDate);
  const items = Array.from(doc.querySelectorAll('det prod')).map((prod) => {
    const qty = parseFloat(get(prod, 'qCom')) || 0;
    const unitValue = parseFloat(get(prod, 'vUnCom')) || 0;
    const totalValue = parseFloat(get(prod, 'vProd')) || qty * unitValue;
    return {
      name: get(prod, 'xProd'),
      quantity: qty,
      measureUnit: get(prod, 'uCom') || 'un',
      unitValue,
      totalValue,
    };
  }).filter((it) => it.name && it.totalValue > 0);
  return { supplier, date, items };
}
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@frontend/contexts/AppContext';
import { apiFetch } from '@frontend/lib/api';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { FinanceStatus, FinanceType, DreSection, RecurrenceFrequency } from '@backend/domain/entities/Finance';
import {
  FIXED_CATEGORIES, VARIABLE_CATEGORIES, CATEGORY_LABELS as BUILTIN_CATEGORY_LABELS, CATEGORY_COLORS as BUILTIN_CATEGORY_COLORS,
  DRE_SECTIONS, groupCategoriesBySection, getCategorySection,
} from '@backend/infra/data/financeCategories';
import type { CategoryDef } from '@backend/infra/data/financeCategories';
import { buildDreTemplateValues, DRE_TEMPLATE_INPUT_CELLS, DRE_TEMPLATE_SHEET } from '@shared/dreTemplate';
import { isRealizedExpense, isRealizedRevenue } from '@shared/financeSettlement';
import { calculateSettlementStatus, getDerivedFinanceLabel, getOutstandingCents } from '@shared/financePolicy';
import { fromCents } from '@shared/money';
import FinancePeriodFilter from '@shared/FinancePeriodFilter';
import { getInitialFinancePeriod, matchesFinancePeriod } from '@shared/financePeriod';
import GaugeChart from '@frontend/components/GaugeChart/GaugeChart';
import HorizontalBarChart from '@frontend/components/HorizontalBarChart/HorizontalBarChart';
import Badge from '@frontend/components/Badge/Badge';
import Button from '@frontend/components/Button/Button';
import Modal from '@frontend/components/Modal/Modal';
import styles from './Financeiro.module.scss';

function formatCurrency(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  const reais = Math.floor(num / 100);
  const centavos = num % 100;
  return `R$ ${reais.toLocaleString('pt-BR')},${String(centavos).padStart(2, '0')}`;
}

function parseCurrency(value: string): number {
  return Number(value.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
}

function addMonths(dateStr: string, months: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const targetMonth = (m - 1) + months;
  const targetYear = y + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate();
  const safeDay = Math.min(d, lastDay);
  return [
    String(targetYear).padStart(4, '0'),
    String(normalizedMonth + 1).padStart(2, '0'),
    String(safeDay).padStart(2, '0'),
  ].join('-');
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return date.toISOString().split('T')[0];
}

function advanceRecurrence(date: string, frequency: RecurrenceFrequency, interval: number): string {
  if (frequency === 'daily') return addDays(date, interval);
  if (frequency === 'weekly') return addDays(date, interval * 7);
  if (frequency === 'yearly') return addMonths(date, interval * 12);
  return addMonths(date, interval);
}

type TabType = 'geral' | 'despesas' | 'mensal' | 'lancamentos' | 'valores';
type FilterType = 'all' | 'revenue' | 'cost';
type CostFilter = 'all' | 'fixed' | 'variable';

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const formatBRL = (v: number) => `R$ ${v.toLocaleString('pt-BR')}`;
const alphaCollator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });
const normalizeAlpha = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('pt-BR');
const compareAlpha = (a: string, b: string) => alphaCollator.compare(normalizeAlpha(a), normalizeAlpha(b));

type DataScope = 'main' | 'franchise' | 'factory' | 'combined';

export default function Financeiro() {
  const { events, finances, financeCategories, addFinance, updateFinance, settleFinance, deleteFinance, addFinanceCategory, deleteEvent, closeEventFinance, reopenEventFinance, refreshFinances } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('geral');
  const [costFilter, setCostFilter] = useState<CostFilter>('all');
  const [dataScope, setDataScope] = useState<DataScope>('main');
  const [franchiseFinances, setFranchiseFinances] = useState<typeof finances>([]);
  const [franchiseEvents, setFranchiseEvents] = useState<typeof events>([]);
  const [factoryFinances, setFactoryFinances] = useState<typeof finances>([]);
  const [factoryEvents, setFactoryEvents] = useState<typeof events>([]);
  const [directEvents, setDirectEvents] = useState<typeof events>([]);

  const [financePeriod, setFinancePeriod] = useState(() => getInitialFinancePeriod());

  // Table filters
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [lancamentosPage, setLancamentosPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<typeof events[number] | null>(null);
  const [selectedFinance, setSelectedFinance] = useState<typeof finances[number] | null>(null);
  const [financePendingDelete, setFinancePendingDelete] = useState<typeof finances[number] | null>(null);
  const [deletingFinance, setDeletingFinance] = useState(false);

  // Edição de lançamento
  const [editingFinanceId, setEditingFinanceId] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState<FinanceType>('cost');
  const [formEventId, setFormEventId] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPaymentMethod, setFormPaymentMethod] = useState('');

  // Parcelamento
  const [formInstallments, setFormInstallments] = useState('1');

  // Recorrência
  const [formRecurring, setFormRecurring] = useState(false);
  const [formRecurrenceFrequency, setFormRecurrenceFrequency] = useState<RecurrenceFrequency>('monthly');
  const [formRecurrenceInterval, setFormRecurrenceInterval] = useState('1');
  const [formRecurrenceTotal, setFormRecurrenceTotal] = useState('12');

  // Nova categoria personalizada
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

  // XML import state
  const [showXmlModal, setShowXmlModal] = useState(false);
  const [xmlItems, setXmlItems] = useState<XmlFinanceItem[]>([]);
  const [xmlSupplier, setXmlSupplier] = useState('');
  const [xmlDate, setXmlDate] = useState('');
  const [xmlImporting, setXmlImporting] = useState(false);
  const xmlInputRef = useRef<HTMLInputElement>(null);

  // OFX bank statement import state
  const [showOfxModal, setShowOfxModal] = useState(false);
  const [ofxItems, setOfxItems] = useState<OfxFinanceItem[]>([]);
  const [ofxBankAccount, setOfxBankAccount] = useState('');
  const [ofxStatementBalance, setOfxStatementBalance] = useState<number | undefined>();
  const [ofxText, setOfxText] = useState('');
  const [ofxPreviewing, setOfxPreviewing] = useState(false);
  const [ofxImporting, setOfxImporting] = useState(false);
  const ofxInputRef = useRef<HTMLInputElement>(null);

  const handleXmlFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        const { supplier, date, items } = parseNFeXmlForFinance(text);
        setXmlSupplier(supplier);
        setXmlDate(date);
        setXmlItems(items.map((it, i) => ({ ...it, id: String(i), category: '', selected: true })));
        setShowXmlModal(true);
      } catch {
        alert('Não foi possível ler o XML. Verifique se é uma NF-e válida.');
      }
    };
    reader.readAsText(file, 'ISO-8859-1');
    e.target.value = '';
  };

  const handleXmlImport = async () => {
    const selected = xmlItems.filter((it) => it.selected);
    if (!selected.length) return;
    setXmlImporting(true);
    for (const it of selected) {
      await addFinance({
        type: 'cost',
        category: it.category || 'outro',
        description: `${it.name}${xmlSupplier ? ` — ${xmlSupplier}` : ''}`,
        amount: it.totalValue,
        date: xmlDate,
        status: 'pending',
        eventId: '',
      });
    }
    setXmlImporting(false);
    setShowXmlModal(false);
    setXmlItems([]);
  };

  const handleOfxFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const bytes = ev.target?.result as ArrayBuffer;
        const utf8 = new TextDecoder('utf-8').decode(bytes);
        const text = utf8.includes('\uFFFD') ? new TextDecoder('windows-1252').decode(bytes) : utf8;
        setOfxPreviewing(true);
        const response = await apiFetch('/api/finances/ofx/preview', {
          method: 'POST',
          headers: { 'X-System': 'main' },
          body: JSON.stringify({ ofxText: text }),
        });
        const preview = await response.json();
        if (!response.ok) throw new Error(preview.error || 'OFX preview failed');
        setOfxText(text);
        setOfxBankAccount(preview.bankAccount);
        setOfxStatementBalance(preview.statementBalance);
        setOfxItems(preview.suggestions.map((item: Omit<OfxFinanceItem, 'id' | 'category' | 'selected'>, index: number) => ({
          ...item,
          id: String(index),
          category: '',
          selected: item.decision === 'link' || item.decision === 'create_unclassified',
        })));
        setShowOfxModal(true);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Não foi possível ler o arquivo OFX.');
      } finally {
        setOfxPreviewing(false);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleOfxImport = async () => {
    const selected = ofxItems.filter((item) => item.selected && item.decision !== 'duplicate' && item.decision !== 'ambiguous');
    if (!selected.length || !ofxText) return;
    setOfxImporting(true);
    try {
      const response = await apiFetch('/api/finances/ofx/import', {
        method: 'POST',
        headers: { 'X-System': 'main' },
        body: JSON.stringify({
          ofxText,
          selections: selected.map((item) => ({
            externalId: item.externalId,
            ...(item.decision === 'create_unclassified' && item.category ? { category: item.category } : {}),
            ...(item.financeId ? { financeId: item.financeId } : {}),
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'OFX import failed');
      refreshFinances();
      setShowOfxModal(false);
      setOfxItems([]);
      setOfxText('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Falha ao importar o extrato OFX.');
    } finally {
      setOfxImporting(false);
    }
  };

  // Event combobox state
  const [eventSearch, setEventSearch] = useState('');
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const eventComboRef = useRef<HTMLDivElement>(null);

  // Open form from URL query params (e.g. from Dashboard shortcut)
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      const type = searchParams.get('type') as FinanceType | null;
      if (type) setFormType(type);
      setShowForm(true);
      setSearchParams({});
    }
  }, []);

  // Fetch franchise/factory finances and events when scope includes them
  useEffect(() => {
    if (dataScope === 'main') {
      setFranchiseFinances([]); setFranchiseEvents([]);
      setFactoryFinances([]); setFactoryEvents([]);
      return;
    }
    if (dataScope === 'franchise' || dataScope === 'combined') {
      const h: HeadersInit = { 'X-System': 'franchise' };
      fetch('/api/finances', { headers: h, credentials: 'include' }).then(r => r.json()).then(d => Array.isArray(d) && setFranchiseFinances(d)).catch(() => {});
      fetch('/api/events',   { headers: h, credentials: 'include' }).then(r => r.json()).then(d => Array.isArray(d) && setFranchiseEvents(d)).catch(() => {});
    }
    if (dataScope === 'factory' || dataScope === 'combined') {
      const h: HeadersInit = { 'X-System': 'factory' };
      fetch('/api/finances', { headers: h, credentials: 'include' }).then(r => r.json()).then(d => Array.isArray(d) && setFactoryFinances(d)).catch(() => {});
      fetch('/api/events',   { headers: h, credentials: 'include' }).then(r => r.json()).then(d => Array.isArray(d) && setFactoryEvents(d)).catch(() => {});
    }
  }, [dataScope]);

  // Ensure events are available for the form regardless of AppContext state
  useEffect(() => {
    if (!showForm) return;
    fetch('/api/events', { credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-System': 'main' } })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setDirectEvents(d); })
      .catch(() => {});
  }, [showForm]);

  // Close event dropdown on outside click
  useEffect(() => {
    if (!showEventDropdown) return;
    const handler = (e: MouseEvent) => {
      if (eventComboRef.current && !eventComboRef.current.contains(e.target as Node)) {
        setShowEventDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEventDropdown]);

  const activeFinances = useMemo(() => {
    if (dataScope === 'franchise') return franchiseFinances;
    if (dataScope === 'factory')   return factoryFinances;
    if (dataScope === 'combined')  return [...finances, ...franchiseFinances, ...factoryFinances];
    return finances;
  }, [finances, franchiseFinances, factoryFinances, dataScope]);

  const activeEvents = useMemo(() => {
    if (dataScope === 'franchise') return franchiseEvents;
    if (dataScope === 'factory')   return factoryEvents;
    if (dataScope === 'combined')  return [...events, ...franchiseEvents, ...factoryEvents];
    return events.length > 0 ? events : directEvents;
  }, [events, franchiseEvents, factoryEvents, dataScope, directEvents]);

  const filteredEventsForCombo = useMemo(() => {
    const eventsById = new Map<string, (typeof activeEvents)[number]>();
    for (const evt of activeEvents) {
      if (evt?.id && evt.name?.trim()) eventsById.set(evt.id, evt);
    }
    const sorted = [...eventsById.values()].sort((a, b) => compareAlpha(a.name, b.name));
    if (!eventSearch) return sorted;
    const q = eventSearch.toLowerCase();
    return sorted.filter(evt => evt.name.toLowerCase().includes(q));
  }, [activeEvents, eventSearch]);

  const eventDropdownOptions = useMemo(
    () => [...filteredEventsForCombo].sort((a, b) => compareAlpha(a.name, b.name)),
    [filteredEventsForCombo],
  );

  // Categorias (padrão + personalizadas), rótulos/cores mesclados e agrupamento por seção do DRE
  const categoryLabels = useMemo(() => {
    const merged: Record<string, string> = { ...BUILTIN_CATEGORY_LABELS };
    for (const c of financeCategories) merged[c.key] = c.label;
    return merged;
  }, [financeCategories]);

  const categoryColors = useMemo(() => {
    const merged: Record<string, string> = { ...BUILTIN_CATEGORY_COLORS };
    for (const c of financeCategories) merged[c.key] = c.color || '#64748b';
    return merged;
  }, [financeCategories]);

  const groupedRevenueCategories = useMemo(
    () => groupCategoriesBySection('revenue', financeCategories),
    [financeCategories],
  );
  const groupedCostCategories = useMemo(
    () => groupCategoriesBySection('cost', financeCategories),
    [financeCategories],
  );
  const groupedFormCategories = formType === 'revenue' ? groupedRevenueCategories : groupedCostCategories;

  const handleCreateCategory = async () => {
    if (!newCategoryLabel.trim()) return;
    setSavingCategory(true);
    try {
      const created = await addFinanceCategory({
        key: '', // gerada no servidor a partir do label
        label: newCategoryLabel.trim(),
        type: formType,
        section: newCategorySection,
        color: '#64748b',
      } as any);
      setFormCategory(created.key);
      setShowCategoryModal(false);
      setNewCategoryLabel('');
    } catch {
      alert('Não foi possível criar a categoria.');
    } finally {
      setSavingCategory(false);
    }
  };

  // === DATA COMPUTATIONS ===

  const periodFinances = useMemo(
    () => activeFinances.filter((finance) => matchesFinancePeriod(finance.date, financePeriod)),
    [activeFinances, financePeriod],
  );
  const periodEvents = useMemo(
    () => activeEvents.filter((event) => matchesFinancePeriod(event.date, financePeriod)),
    [activeEvents, financePeriod],
  );

  const totalRevenue = useMemo(
    () => periodFinances.filter((f) => f.type === 'revenue').reduce((acc, f) => acc + f.amount, 0),
    [periodFinances],
  );
  const totalCosts = useMemo(
    () => periodFinances.filter((f) => f.type === 'cost').reduce((acc, f) => acc + f.amount, 0),
    [periodFinances],
  );
  const profit = totalRevenue - totalCosts;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  const realizedIncome = useMemo(() => periodFinances.filter((entry) => entry.type === 'revenue' && isRealizedRevenue(entry)).reduce((sum, entry) => sum + entry.amount, 0), [periodFinances]);
  const projectedIncome = totalRevenue - realizedIncome;
  const realizedExpense = useMemo(() => periodFinances.filter(isRealizedExpense).reduce((sum, entry) => sum + entry.amount, 0), [periodFinances]);
  const projectedExpense = totalCosts - realizedExpense;

  const expenseCategorySummary = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const entry of periodFinances.filter((item) => item.type === 'cost')) {
      grouped.set(entry.category, (grouped.get(entry.category) || 0) + entry.amount);
    }
    return [...grouped.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
  }, [periodFinances]);

  const revenueByEvent = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const entry of periodFinances.filter((item) => item.type === 'revenue' && item.eventId)) {
      grouped.set(entry.eventId, (grouped.get(entry.eventId) || 0) + entry.amount);
    }
    return [...grouped.entries()].map(([eventId, amount]) => ({
      eventId,
      name: activeEvents.find((event) => event.id === eventId)?.name || 'Evento não encontrado',
      amount,
    })).sort((a, b) => b.amount - a.amount);
  }, [periodFinances, activeEvents]);

  const revenueByOrigin = useMemo(() => {
    const grouped = new Map<string, { amount: number; count: number }>();
    for (const entry of periodFinances.filter((item) => item.type === 'revenue')) {
      const origin = entry.origin || 'manual';
      const current = grouped.get(origin) || { amount: 0, count: 0 };
      current.amount += entry.amount;
      current.count += 1;
      grouped.set(origin, current);
    }
    return [...grouped.entries()].map(([origin, values]) => ({ origin, ...values })).sort((a, b) => b.amount - a.amount);
  }, [periodFinances]);

  const commissionSummary = useMemo(() => periodFinances
    .filter((entry) => entry.type === 'cost' && entry.kind === 'commission')
    .sort((a, b) => b.amount - a.amount), [periodFinances]);

  // Saldo: lançamentos liquidados dentro do período selecionado.
  const wallet = useMemo(() => {
    const received = periodFinances.filter((f) => f.type === 'revenue' && isRealizedRevenue(f)).reduce((acc, f) => acc + f.amount, 0);
    const paid = periodFinances.filter(isRealizedExpense).reduce((acc, f) => acc + f.amount, 0);
    return { received, paid, balance: received - paid };
  }, [periodFinances]);
  const walletBalance = wallet.balance;
  const bankWallet = useMemo(() => {
    const latestByAccount = new Map<string, { date: string; balance: number }>();
    for (const entry of periodFinances) {
      if (entry.origin !== 'bank_import' || !entry.bankAccount || !Number.isFinite(entry.bankStatementBalance)) continue;
      const marker = entry.settledAt || entry.date;
      const current = latestByAccount.get(entry.bankAccount);
      if (!current || marker > current.date) latestByAccount.set(entry.bankAccount, { date: marker, balance: entry.bankStatementBalance! });
    }
    return {
      accounts: [...latestByAccount.entries()],
      balance: [...latestByAccount.values()].reduce((sum, account) => sum + account.balance, 0),
    };
  }, [periodFinances]);

  // Faturamento (tudo que foi vendido/contratado, mesmo pendente) x Recebido x Saldo em Aberto
  const faturamentoTotal = totalRevenue;
  const faturamentoRecebido = useMemo(
    () => periodFinances.filter((f) => f.type === 'revenue' && isRealizedRevenue(f)).reduce((acc, f) => acc + f.amount, 0),
    [periodFinances],
  );
  const saldoEmAberto = faturamentoTotal - faturamentoRecebido;
  const paymentMethodSummary = useMemo(() => {
    const grouped = new Map<string, { method: string; amount: number; count: number }>();
    for (const entry of periodFinances.filter(isRealizedRevenue)) {
      const method = entry.paymentMethod || 'nao-informado';
      const current = grouped.get(method) || { method, amount: 0, count: 0 };
      current.amount += entry.amount;
      current.count += 1;
      grouped.set(method, current);
    }
    return [...grouped.values()].sort((a, b) => b.amount - a.amount);
  }, [periodFinances]);
  const paymentMethodTotal = useMemo(
    () => paymentMethodSummary.reduce((sum, item) => sum + item.amount, 0),
    [paymentMethodSummary],
  );

  // Chart data is limited to the selected financial interval.
  const monthlyData = useMemo(() => {
    const source = periodFinances;
    const map = new Map<string, { month: string; receita: number; despesa: number }>();
    for (const f of source) {
      if (!f.date) continue;
      const ym = f.date.substring(0, 7);
      if (!map.has(ym)) map.set(ym, { month: ym, receita: 0, despesa: 0 });
      const entry = map.get(ym)!;
      if (f.type === 'revenue') entry.receita += f.amount;
      else entry.despesa += f.amount;
    }
    return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
  }, [periodFinances]);

  // Detail panel data follows the same period selected for the page.
  const monthFinances = periodFinances;

  const monthRevenue = useMemo(
    () => monthFinances.filter((f) => f.type === 'revenue').reduce((acc, f) => acc + f.amount, 0),
    [monthFinances],
  );
  const monthCosts = useMemo(
    () => monthFinances.filter((f) => f.type === 'cost').reduce((acc, f) => acc + f.amount, 0),
    [monthFinances],
  );
  const monthProfit = monthRevenue - monthCosts;
  const monthMargin = monthRevenue > 0 ? (monthProfit / monthRevenue) * 100 : 0;

  // Category breakdowns for selected month
  const fixedCosts = useMemo(() => {
    const costs: Record<string, number> = {};
    for (const f of monthFinances) {
      if (f.type === 'cost' && (FIXED_CATEGORIES as readonly string[]).includes(f.category)) {
        costs[f.category] = (costs[f.category] || 0) + f.amount;
      }
    }
    return Object.entries(costs)
      .map(([cat, val]) => ({
        label: categoryLabels[cat] || cat,
        value: val,
        color: categoryColors[cat] || '#64748b',
      }))
      .sort((a, b) => b.value - a.value);
  }, [monthFinances]);

  const variableCosts = useMemo(() => {
    const costs: Record<string, number> = {};
    for (const f of monthFinances) {
      if (f.type === 'cost' && (VARIABLE_CATEGORIES as readonly string[]).includes(f.category)) {
        costs[f.category] = (costs[f.category] || 0) + f.amount;
      }
    }
    return Object.entries(costs)
      .map(([cat, val]) => ({
        label: categoryLabels[cat] || cat,
        value: val,
        color: categoryColors[cat] || '#64748b',
      }))
      .sort((a, b) => b.value - a.value);
  }, [monthFinances]);

  // Gauge values for page-level month filter (used in Visão Geral)
  const insumosRatio = useMemo(() => {
    const insumos = periodFinances
      .filter((f) => f.type === 'cost' && f.category === 'insumos')
      .reduce((acc, f) => acc + f.amount, 0);
    return totalRevenue > 0 ? (insumos / totalRevenue) * 100 : 0;
  }, [periodFinances, totalRevenue]);

  const maoObraRatio = useMemo(() => {
    const mo = periodFinances
      .filter((f) => f.type === 'cost' && (f.category === 'salario' || f.category === 'pro-labore'))
      .reduce((acc, f) => acc + f.amount, 0);
    return totalRevenue > 0 ? (mo / totalRevenue) * 100 : 0;
  }, [periodFinances, totalRevenue]);

  // Gauge values for selected month (used in Painel Mensal)
  const insumosRatioMensal = useMemo(() => {
    const insumos = monthFinances
      .filter((f) => f.type === 'cost' && f.category === 'insumos')
      .reduce((acc, f) => acc + f.amount, 0);
    return monthRevenue > 0 ? (insumos / monthRevenue) * 100 : 0;
  }, [monthFinances, monthRevenue]);

  const maoObraRatioMensal = useMemo(() => {
    const mo = monthFinances
      .filter((f) => f.type === 'cost' && (f.category === 'salario' || f.category === 'pro-labore'))
      .reduce((acc, f) => acc + f.amount, 0);
    return monthRevenue > 0 ? (mo / monthRevenue) * 100 : 0;
  }, [monthFinances, monthRevenue]);

  // Table filter
  const filtered = useMemo(() => {
    return periodFinances.filter((f) => {
      if (!f.date) return false;
      if (filterType !== 'all' && f.type !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        const event = activeEvents.find((e) => e.id === f.eventId);
        return (
          f.description.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          event?.name.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  }, [periodFinances, filterType, search, activeEvents]);

  // Events with budget joined with their finance entry follow the selected interval.
  const eventsWithBudget = useMemo(() => {
    return periodEvents
      .filter((e) => e.budget > 0)
      .map((e) => ({
        event: e,
        finance: activeFinances.find(
          (f) => f.eventId === e.id && f.type === 'revenue' && f.category === 'contrato',
        ),
      }))
      .sort((a, b) => b.event.date.localeCompare(a.event.date));
  }, [periodEvents, activeFinances]);

  const totalContracted = useMemo(
    () => eventsWithBudget.reduce((acc, { event }) => acc + event.budget, 0),
    [eventsWithBudget],
  );
  const totalReceived = useMemo(
    () => eventsWithBudget
      .filter(({ finance }) => finance && isRealizedRevenue(finance))
      .reduce((acc, { event }) => acc + event.budget, 0),
    [eventsWithBudget],
  );

  const eventsWithFinalValue = useMemo(
    () => periodEvents
      .filter((e) => (e.finalValue ?? 0) > 0)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [periodEvents],
  );
  const totalFinalValue = useMemo(
    () => eventsWithFinalValue.reduce((acc, e) => acc + (e.finalValue || 0), 0),
    [eventsWithFinalValue],
  );

  // === HANDLERS ===

  const handleEventFinanceStatus = async (entry: (typeof finances)[number], status: FinanceStatus) => {
    if (status === 'pending') {
      alert('Para reabrir ou cancelar uma baixa, use o comando específico com justificativa. A situação não é alterada por um seletor.');
      return;
    }
    const settlementStatus = calculateSettlementStatus(entry);
    if (settlementStatus === 'cancelled') {
      alert('NÃ£o Ã© possÃ­vel liquidar um lanÃ§amento cancelado. Use o fluxo de ajuste com justificativa.');
      return;
    }
    if (entry.status === 'paid' || settlementStatus === 'settled') return;
    const outstandingAmount = fromCents(getOutstandingCents(entry));
    const amountText = window.prompt(
      'Baixa financeira: informe o valor efetivamente recebido/pago. A competência do lançamento não será alterada.',
      outstandingAmount.toFixed(2).replace('.', ','),
    );
    if (amountText === null) return;
    const amount = parseCurrency(amountText);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Informe um valor de baixa válido.');
      return;
    }
    const settledOn = window.prompt('Data efetiva da baixa (AAAA-MM-DD):', entry.date);
    if (!settledOn) return;
    const paymentMethod = window.prompt('Método de pagamento/recebimento:', entry.paymentMethod || '');
    const reason = window.prompt('Justificativa ou referência (opcional):', '') || undefined;
    await settleFinance(entry.id, { amount, settledOn, paymentMethod: paymentMethod || undefined, reason });
  };

  const exportCSV = () => {
    const typeLabel: Record<string, string> = { revenue: 'Receita', cost: 'Custo' };
    const stLabel: Record<string, string> = { pending: 'Pendente', paid: 'Pago' };
    const rows = [
      ['Data', 'Tipo', 'Categoria', 'Descrição', 'Status', 'Valor (R$)'].join(';'),
      ...filtered.map(f => [
        f.date,
        typeLabel[f.type] || f.type,
        categoryLabels[f.category] || f.category,
        `"${f.description.replace(/"/g, '""')}"`,
        stLabel[f.status] || f.status,
        f.amount.toFixed(2).replace('.', ','),
      ].join(';')),
    ];
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro-${financePeriod.start || 'todos'}_a_${financePeriod.end || 'todos'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Exportação no padrão do arquivo "DRE 2026 - SOUL PIZZA.xlsx": meses em coluna,
  // categorias agrupadas por seção do DRE, totais por seção e linhas de resultado.
  const exportDRELegacy = () => {
    const availablePeriodMonths = [...new Set(periodFinances.map((finance) => finance.date?.slice(0, 7)).filter(Boolean) as string[])].sort();
    if (availablePeriodMonths.length === 0) {
      alert('Nenhum lançamento financeiro para exportar.');
      return;
    }
    const months = availablePeriodMonths;
    const fmt = (v: number) => v.toFixed(2).replace('.', ',');
    const monthAmount = (categoryKey: string, type: FinanceType, month: string) =>
      periodFinances
        .filter((f) => f.type === type && f.category === categoryKey && f.date && f.date.startsWith(month))
        .reduce((acc, f) => acc + f.amount, 0);

    const sectionCategoriesMap = new Map<DreSection, CategoryDef[]>();
    for (const g of [...groupedRevenueCategories, ...groupedCostCategories]) sectionCategoriesMap.set(g.section.key, g.categories);

    const header = ['Categoria', ...months.map(formatMonth), 'Total'];
    const rows: string[][] = [header];
    const sectionTotalsByMonth: Record<string, number[]> = {};

    for (const sectionDef of DRE_SECTIONS) {
      const cats = sectionCategoriesMap.get(sectionDef.key) || [];
      rows.push([sectionDef.label, ...months.map(() => ''), '']);

      const totalsByMonth = months.map(() => 0);
      for (const cat of cats) {
        const values = months.map((m) => monthAmount(cat.key, sectionDef.type, m));
        values.forEach((v, i) => { totalsByMonth[i] += v; });
        rows.push([cat.label, ...values.map(fmt), fmt(values.reduce((a, b) => a + b, 0))]);
      }
      rows.push([`Total ${sectionDef.label}`, ...totalsByMonth.map(fmt), fmt(totalsByMonth.reduce((a, b) => a + b, 0))]);
      sectionTotalsByMonth[sectionDef.key] = totalsByMonth;
    }

    const faturamentos = sectionTotalsByMonth['faturamentos'];
    const deducoes = sectionTotalsByMonth['deducoes'];
    const receitaLiquida = faturamentos.map((v, i) => v - deducoes[i]);
    rows.push(['( = ) Receita Líquida Operacional', ...receitaLiquida.map(fmt), fmt(receitaLiquida.reduce((a, b) => a + b, 0))]);

    const custosOperacionais = sectionTotalsByMonth['custos-operacionais'];
    const despesasLogistica = sectionTotalsByMonth['despesas-logistica'];
    const totalCustos = custosOperacionais.map((v, i) => v + despesasLogistica[i]);
    rows.push(['Total Custos', ...totalCustos.map(fmt), fmt(totalCustos.reduce((a, b) => a + b, 0))]);

    const lucroBruto = receitaLiquida.map((v, i) => v - totalCustos[i]);
    rows.push(['( = ) Lucro Bruto / Margem de Contribuição', ...lucroBruto.map(fmt), fmt(lucroBruto.reduce((a, b) => a + b, 0))]);

    const despesasAdm = sectionTotalsByMonth['despesas-administrativas'];
    const despesasCom = sectionTotalsByMonth['despesas-comerciais'];
    const despesasFin = sectionTotalsByMonth['despesas-financeiras'];
    const totalDespesas = despesasAdm.map((v, i) => v + despesasCom[i] + despesasFin[i]);
    rows.push(['Total Despesas Adm/Comerciais/Financeiras', ...totalDespesas.map(fmt), fmt(totalDespesas.reduce((a, b) => a + b, 0))]);

    const lucroLiquidoOp = lucroBruto.map((v, i) => v - totalDespesas[i]);
    rows.push(['( = ) Lucro Líquido Operacional', ...lucroLiquidoOp.map(fmt), fmt(lucroLiquidoOp.reduce((a, b) => a + b, 0))]);

    let acumulado = 0;
    const resultadoAcumulado = lucroLiquidoOp.map((v) => { acumulado += v; return acumulado; });
    rows.push(['( = ) Resultado Líquido Acumulado', ...resultadoAcumulado.map(fmt), '']);

    const receitasNaoOperacionais = sectionTotalsByMonth['receitas-nao-operacionais'];
    const outrasSaidas = sectionTotalsByMonth['outras-saidas'];
    const resultadoFinal = lucroLiquidoOp.map((v, i) => v + receitasNaoOperacionais[i] - outrasSaidas[i]);
    rows.push(['( = ) Resultado Após Empréstimos/Investimentos', ...resultadoFinal.map(fmt), fmt(resultadoFinal.reduce((a, b) => a + b, 0))]);

    const csv = rows.map((r) => r.join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dre-${months[0]}_a_${months[months.length - 1]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportDRE = async () => {
    const dreValues = buildDreTemplateValues(periodFinances, financeCategories);
    if (dreValues.size === 0) {
      alert('Nenhum lançamento entre julho e dezembro de 2026 para exportar.');
      return;
    }

    try {
      const [{ default: ExcelJS }, templateResponse] = await Promise.all([
        import('exceljs'),
        fetch('/dre-2026-soul-pizza.xlsx'),
      ]);
      if (!templateResponse.ok) throw new Error('Modelo oficial do DRE não encontrado.');

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await templateResponse.arrayBuffer());
      const worksheet = workbook.getWorksheet(DRE_TEMPLATE_SHEET);
      if (!worksheet) throw new Error(`A aba "${DRE_TEMPLATE_SHEET}" não existe no modelo.`);

      for (const address of DRE_TEMPLATE_INPUT_CELLS) worksheet.getCell(address).value = 0;
      for (const [address, amount] of dreValues) worksheet.getCell(address).value = amount;
      workbook.calcProperties.fullCalcOnLoad = true;

      const output = await workbook.xlsx.writeBuffer();
      const blob = new Blob([output as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DRE 2026 - SOUL PIZZA - ${dataScope}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Não foi possível gerar o DRE.');
    }
  };

  const resetForm = () => {
    setFormType('revenue');
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

  const openEditFinance = (entry: (typeof finances)[number]) => {
    setEditingFinanceId(entry.id);
    setFormType(entry.type);
    setFormEventId(entry.eventId || '');
    const evt = activeEvents.find((ev) => ev.id === entry.eventId);
    setEventSearch(evt?.name || '');
    setFormCategory(entry.category);
    setFormDescription(entry.description);
    setFormAmount(entry.amount ? formatCurrency(String(Math.round(entry.amount * 100))) : '');
    setFormDate(entry.date);
    setFormPaymentMethod(entry.paymentMethod || '');
    setFormInstallments('1');
    setFormRecurring(false);
    setShowForm(true);
  };

  const handleFinanceEditAction = (entry: (typeof finances)[number]) => {
    openEditFinance(entry);
  };

  const requestFinanceDelete = (entry: (typeof finances)[number]) => {
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
      alert(error instanceof Error ? error.message : 'Não foi possível excluir o lançamento.');
    } finally {
      setDeletingFinance(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formCategory || !formAmount) return;
    const base = {
      eventId: formEventId,
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
          description: formDescription ? `${formDescription} (${i + 1}/${installments})` : `Parcela ${i + 1}/${installments}`,
          date: addMonths(formDate, i),
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

  // === RENDER ===

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Financeiro</h1>
            <button className={styles.btnInfo} onClick={() => setShowInfo(true)} title="Como usar esta página">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </button>
          </div>
          <p className={styles.subtitle}>Controle completo de receitas, despesas e indicadores</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.scopeToggle}>
            <button
              className={`${styles.scopeBtn} ${dataScope === 'main' ? styles.scopeBtnActive : ''}`}
              onClick={() => setDataScope('main')}
              title="Exibir apenas dados do sistema principal"
            >
              Sorocaba
            </button>
            <button
              className={`${styles.scopeBtn} ${dataScope === 'franchise' ? styles.scopeBtnActive : ''}`}
              onClick={() => setDataScope('franchise')}
              title="Exibir apenas dados de Campinas"
            >
              Campinas
            </button>
            <button
              className={`${styles.scopeBtn} ${dataScope === 'factory' ? styles.scopeBtnActive : ''}`}
              onClick={() => setDataScope('factory')}
              title="Exibir apenas dados da fábrica"
            >
              Fábrica
            </button>
            <button
              className={`${styles.scopeBtn} ${dataScope === 'combined' ? styles.scopeBtnActive : ''}`}
              onClick={() => setDataScope('combined')}
              title="Exibir dados consolidados (principal + campinas + fábrica)"
            >
              Consolidado
            </button>
          </div>
          <input ref={xmlInputRef} type="file" accept=".xml" style={{ display: 'none' }} onChange={handleXmlFile} />
          <button className={styles.btnXml} onClick={() => xmlInputRef.current?.click()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="12" y2="12"/><line x1="15" y1="15" x2="12" y2="12"/></svg>
            Importar XML
          </button>
          <input ref={ofxInputRef} type="file" accept=".ofx,application/x-ofx" style={{ display: 'none' }} onChange={handleOfxFile} />
          <button className={styles.btnXml} onClick={() => ofxInputRef.current?.click()} title="Importar extrato bancário OFX">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h18"/><path d="M5 10V7l7-4 7 4v3"/><path d="M7 14v4"/><path d="M12 14v4"/><path d="M17 14v4"/><path d="M3 21h18"/></svg>
            Importar OFX
          </button>
          <Button onClick={() => { resetForm(); setShowForm(true); }}>+ Novo Lançamento</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {([
          ['geral', 'Visão Geral'],
          ['despesas', 'Painel Despesas'],
          ['mensal', 'Painel do Período'],
          ['lancamentos', 'Lançamentos'],
          ['valores', 'Financeiro dos Eventos'],
        ] as [TabType, string][]).map(([key, label]) => (
          <button
            key={key}
            className={`${styles.tab} ${activeTab === key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <FinancePeriodFilter period={financePeriod} onChange={setFinancePeriod} accentColor="#f5a000" />

      {/* ===== TAB: VISAO GERAL ===== */}
      {activeTab === 'geral' && (
        <div className={styles.tabContent}>
          {/* Summary Bar */}
          <div className={`${styles.summaryBar} ${styles.eventFinancialSummary}`}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryItemLabel}>Receita realizada</span>
              <span className={`${styles.summaryItemValue} ${styles.green}`}>{formatBRL(realizedIncome)}</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryItem}>
              <span className={styles.summaryItemLabel}>Receita prevista</span>
              <span className={`${styles.summaryItemValue} ${styles.amber}`}>{formatBRL(projectedIncome)}</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryItem}>
              <span className={styles.summaryItemLabel}>Despesa realizada</span>
              <span className={`${styles.summaryItemValue} ${styles.red}`}>{formatBRL(realizedExpense)}</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryItem}>
              <span className={styles.summaryItemLabel}>Despesa prevista</span>
              <span className={`${styles.summaryItemValue} ${styles.amber}`}>{formatBRL(projectedExpense)}</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryItem}>
              <span className={styles.summaryItemLabel}>{profit >= 0 ? 'Resultado líquido' : 'Prejuízo'}</span>
              <span className={`${styles.summaryItemValue} ${profit >= 0 ? styles.green : styles.red}`}>{formatBRL(Math.abs(profit))}</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryItem}>
              <span className={styles.summaryItemLabel}>Margem</span>
              <span className={`${styles.summaryItemValue} ${styles.amber}`}>{margin.toFixed(1)}%</span>
            </div>
          </div>

          {/* Carteira + Faturamento x Saldo em Aberto */}
          <div className={styles.walletGrid}>
            <div className={styles.agendamentosCard}>
              <div className={styles.agendamentosHeader}>
                <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Carteira</h3>
              </div>
              <div className={styles.summaryItem} style={{ padding: '4px 0' }}>
                <span className={styles.summaryItemLabel}>Saldo bancário</span>
                <span className={`${styles.summaryItemValue} ${bankWallet.balance >= 0 ? styles.green : styles.red}`} style={{ fontSize: 28 }}>
                  {bankWallet.accounts.length ? formatBRL(bankWallet.balance) : '--'}
                </span>
              </div>
              <div className={styles.walletBreakdown} style={{ display: 'none' }}>
                <div><span>Entradas recebidas</span><strong className={styles.green}>{formatBRL(wallet.received)}</strong></div>
                <div><span>Saídas pagas</span><strong className={styles.red}>{formatBRL(wallet.paid)}</strong></div>
              </div>
              <p className={styles.agendamentosEmpty} style={{ marginTop: 4 }}>
                {bankWallet.accounts.length ? `${bankWallet.accounts.length} conta(s) atualizada(s) por extrato OFX.` : 'Importe um extrato OFX para preencher a carteira.'}
              </p>
            </div>
            <div className={styles.agendamentosCard}>
              <div className={styles.agendamentosHeader}>
                <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Saldo</h3>
              </div>
              <div className={styles.summaryItem} style={{ padding: '4px 0' }}>
                <span className={styles.summaryItemLabel}>Eventos e lançamentos</span>
                <span className={`${styles.summaryItemValue} ${walletBalance >= 0 ? styles.green : styles.red}`} style={{ fontSize: 28 }}>{formatBRL(walletBalance)}</span>
              </div>
              <div className={styles.walletBreakdown}>
                <div><span>Entradas recebidas</span><strong className={styles.green}>{formatBRL(wallet.received)}</strong></div>
                <div><span>Saídas pagas</span><strong className={styles.red}>{formatBRL(wallet.paid)}</strong></div>
              </div>
            </div>
            <div className={styles.agendamentosCard}>
              <div className={styles.agendamentosHeader}>
                <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Faturamento x Saldo em Aberto</h3>
              </div>
              <div className={styles.summaryBar} style={{ padding: '4px 0' }}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryItemLabel}>Faturamento</span>
                  <span className={styles.summaryItemValue}>{formatBRL(faturamentoTotal)}</span>
                </div>
                <div className={styles.summaryDivider} />
                <div className={styles.summaryItem}>
                  <span className={styles.summaryItemLabel}>Recebido</span>
                  <span className={`${styles.summaryItemValue} ${styles.green}`}>{formatBRL(faturamentoRecebido)}</span>
                </div>
                <div className={styles.summaryDivider} />
                <div className={styles.summaryItem}>
                  <span className={styles.summaryItemLabel}>Em Aberto</span>
                  <span className={`${styles.summaryItemValue} ${saldoEmAberto > 0 ? styles.amber : styles.green}`}>{formatBRL(saldoEmAberto)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.agendamentosCard} ${styles.paymentMethodsSection}`}>
            <div className={styles.agendamentosHeader}>
              <div>
                <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Recebimentos por forma</h3>
                <p className={styles.paymentMethodsSubtitle}>Distribuição dos valores recebidos no período selecionado</p>
              </div>
              {paymentMethodTotal > 0 && <strong className={styles.paymentMethodsTotal}>{formatBRL(paymentMethodTotal)}</strong>}
            </div>
            {!paymentMethodSummary.length ? (
              <p className={styles.agendamentosEmpty}>Nenhum recebimento identificado no período.</p>
            ) : (
              <div className={styles.paymentMethodCards}>
                {paymentMethodSummary.map((item) => {
                  const label = item.method === 'pix' ? 'Pix'
                    : item.method === 'money' ? 'Dinheiro'
                      : item.method === 'debit' ? 'Cartão de débito'
                        : item.method === 'credit' ? 'Cartão de crédito'
                          : item.method === 'bank' ? 'Conta bancária'
                            : item.method === 'nao-informado' ? 'Não informado'
                              : item.method.replace(/_/g, ' ');
                  const percentage = paymentMethodTotal > 0 ? (item.amount / paymentMethodTotal) * 100 : 0;
                  return (
                    <div key={item.method} className={styles.paymentMethodCard}>
                      <div className={styles.paymentMethodCardHeader}>
                        <span>{label}</span>
                        <small>{percentage.toFixed(1)}%</small>
                      </div>
                      <strong>{formatBRL(item.amount)}</strong>
                      <span className={styles.paymentMethodCount}>{item.count} {item.count === 1 ? 'transação' : 'transações'}</span>
                      <div className={styles.paymentMethodProgress}><span style={{ width: `${percentage}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.financeInsightsGrid}>
            <div className={styles.agendamentosCard}>
              <div className={styles.agendamentosHeader}>
                <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Distribuição de despesas</h3>
                <strong className={styles.red}>{formatBRL(totalCosts)}</strong>
              </div>
              {!expenseCategorySummary.length ? <p className={styles.agendamentosEmpty}>Nenhuma despesa no período.</p> : (
                <div className={styles.financeRankingList}>
                  {expenseCategorySummary.slice(0, 8).map((item) => {
                    const percentage = totalCosts > 0 ? (item.amount / totalCosts) * 100 : 0;
                    return <div key={item.category} className={styles.financeRankingItem}>
                      <div><span>{categoryLabels[item.category] || item.category}</span><small>{percentage.toFixed(1)}%</small></div>
                      <strong className={styles.red}>{formatBRL(item.amount)}</strong>
                      <div className={styles.financeRankingTrack}><span className={styles.expenseTrack} style={{ width: `${percentage}%` }} /></div>
                    </div>;
                  })}
                </div>
              )}
            </div>

            <div className={styles.agendamentosCard}>
              <div className={styles.agendamentosHeader}>
                <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Receita por evento</h3>
                <strong className={styles.green}>{formatBRL(revenueByEvent.reduce((sum, item) => sum + item.amount, 0))}</strong>
              </div>
              {!revenueByEvent.length ? <p className={styles.agendamentosEmpty}>Nenhuma receita vinculada a eventos no período.</p> : (
                <div className={styles.financeRankingList}>
                  {revenueByEvent.slice(0, 8).map((item) => {
                    const eventTotal = revenueByEvent.reduce((sum, current) => sum + current.amount, 0);
                    const percentage = eventTotal > 0 ? (item.amount / eventTotal) * 100 : 0;
                    return <button key={item.eventId} type="button" className={styles.financeRankingItemButton} onClick={() => setSelectedEvent(activeEvents.find((event) => event.id === item.eventId) || null)}>
                      <div className={styles.financeRankingItem}>
                        <div><span>{item.name}</span><small>{percentage.toFixed(1)}%</small></div>
                        <strong className={styles.green}>{formatBRL(item.amount)}</strong>
                        <div className={styles.financeRankingTrack}><span style={{ width: `${percentage}%` }} /></div>
                      </div>
                    </button>;
                  })}
                </div>
              )}
            </div>

            <div className={styles.agendamentosCard}>
              <div className={styles.agendamentosHeader}>
                <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Origem do faturamento</h3>
                <strong className={styles.green}>{formatBRL(totalRevenue)}</strong>
              </div>
              {!revenueByOrigin.length ? <p className={styles.agendamentosEmpty}>Nenhuma receita no período.</p> : (
                <div className={styles.originCards}>
                  {revenueByOrigin.map((item) => {
                    const label = item.origin === 'event' ? 'Eventos' : item.origin === 'factory_order' ? 'Pedidos da fábrica' : item.origin === 'bank_import' ? 'Extrato bancário' : 'Lançamentos manuais';
                    return <div key={item.origin}><span>{label}</span><strong>{formatBRL(item.amount)}</strong><small>{item.count} {item.count === 1 ? 'lançamento' : 'lançamentos'}</small></div>;
                  })}
                </div>
              )}
            </div>
          </div>

          {commissionSummary.length > 0 && (
            <div className={`${styles.agendamentosCard} ${styles.commissionSection}`}>
              <div className={styles.agendamentosHeader}>
                <div><h3 className={styles.sectionTitle} style={{ margin: 0 }}>Comissões da equipe</h3><p className={styles.paymentMethodsSubtitle}>Custos de comissão registrados no período</p></div>
                <strong className={styles.red}>{formatBRL(commissionSummary.reduce((sum, item) => sum + item.amount, 0))}</strong>
              </div>
              <div className={styles.commissionGrid}>
                {commissionSummary.slice(0, 12).map((item) => <button key={item.id} type="button" onClick={() => setSelectedFinance(item)}><span>{item.description || 'Comissão'}</span><strong>{formatBRL(item.amount)}</strong><small>{safeFormatDate(item.date, 'dd/MM/yyyy', { locale: ptBR })}</small></button>)}
              </div>
            </div>
          )}

          {/* Revenue vs Costs Chart */}
          <div className={styles.chartSection}>
            <h3 className={styles.sectionTitle}>Receita x Despesas por Mês</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={monthlyData} barGap={4} barCategoryGap="15%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={formatMonth}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1a2235',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                      fontSize: '13px',
                    }}
                    formatter={(value: unknown) => [formatBRL(Number(value))]}
                    labelFormatter={(label: unknown) => formatMonth(String(label))}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                  />
                  <Bar dataKey="receita" name="Receita" fill="#4ade80" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesa" name="Despesa" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gauges */}
          <div className={styles.gaugesGrid}>
            <div className={styles.gaugeCard}>
              <GaugeChart
                label="Margem de Lucro"
                value={margin}
                max={100}
                suffix="%"
                color={margin >= 20 ? '#4ade80' : margin >= 10 ? '#fbbf24' : '#f87171'}
              />
            </div>
            <div className={styles.gaugeCard}>
              <GaugeChart
                label="Insumos / Receita"
                value={insumosRatio}
                max={100}
                suffix="%"
                color={insumosRatio <= 30 ? '#4ade80' : insumosRatio <= 45 ? '#fbbf24' : '#f87171'}
              />
            </div>
            <div className={styles.gaugeCard}>
              <GaugeChart
                label="Mao de Obra / Receita"
                value={maoObraRatio}
                max={100}
                suffix="%"
                color={maoObraRatio <= 25 ? '#4ade80' : maoObraRatio <= 40 ? '#fbbf24' : '#f87171'}
              />
            </div>
          </div>

          {/* Events Budget Card */}
          <div className={styles.agendamentosCard}>
            <div className={styles.agendamentosHeader}>
              <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Valores dos Agendamentos</h3>
              <div className={styles.agendamentosPills}>
                <div className={styles.agendamentosPill}>
                  <span className={styles.agendamentosPillLabel}>Total Final</span>
                  <span className={`${styles.agendamentosPillValue} ${styles.green}`}>{formatBRL(totalFinalValue)}</span>
                </div>
              </div>
            </div>

            {eventsWithFinalValue.length === 0 ? (
              <p className={styles.agendamentosEmpty}>Nenhum agendamento com valor final cadastrado.</p>
            ) : (
              <div className={styles.agendamentosList}>
                {eventsWithFinalValue.map((event) => (
                  <div
                    key={event.id}
                    className={`${styles.agendamentoRow} ${styles.agendamentoRowInteractive}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedEvent(event)}
                    onKeyDown={(keyEvent) => {
                      if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
                        keyEvent.preventDefault();
                        setSelectedEvent(event);
                      }
                    }}
                  >
                    <div className={styles.agendamentoInfo}>
                      <span className={styles.agendamentoName}>{event.name}</span>
                      <span className={styles.agendamentoDate}>
                        {safeFormatDate(event.date, "dd 'de' MMM yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <div className={styles.agendamentoRight}>
                      <span className={`${styles.agendamentoValue} ${styles.green}`}>{formatBRL(event.finalValue || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== TAB: PAINEL DESPESAS ===== */}
      {activeTab === 'despesas' && (
        <div className={styles.tabContent}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              {(['all', 'fixed', 'variable'] as CostFilter[]).map((f) => (
                <button
                  key={f}
                  className={`${styles.filterBtn} ${costFilter === f ? styles.filterBtnActive : ''}`}
                  onClick={() => setCostFilter(f)}
                >
                  {f === 'all' ? 'Todas' : f === 'fixed' ? 'Fixas' : 'Variaveis'}
                </button>
              ))}
            </div>
          </div>

          {/* Category totals list */}
          <div className={styles.chartSection}>
            <h3 className={styles.sectionTitle}>Total por Categoria</h3>
            {(() => {
              const cats = costFilter === 'fixed' ? [...FIXED_CATEGORIES]
                : costFilter === 'variable' ? [...VARIABLE_CATEGORIES]
                  : [...FIXED_CATEGORIES, ...VARIABLE_CATEGORIES];
              const totals = cats
                .map((cat) => ({
                  cat,
                  total: periodFinances.filter((f) => f.type === 'cost' && f.category === cat).reduce((a, f) => a + f.amount, 0),
                }))
                .filter(({ total }) => total > 0)
                .sort((a, b) => b.total - a.total);
              const max = totals[0]?.total || 1;
              if (totals.length === 0) return (
                <div className={styles.emptyStateBox}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748b', marginBottom: 8 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p className={styles.emptyStateTitle}>Nenhuma despesa no período selecionado.</p>
                  <p className={styles.emptyStateHint}>Registre despesas clicando em <strong>+ Novo Lançamento</strong> e escolhendo o tipo <strong>Custo</strong>.</p>
                </div>
              );
              return (
                <div className={styles.catList}>
                  {totals.map(({ cat, total }) => (
                    <div key={cat} className={styles.catRow}>
                      <span className={styles.catDot} style={{ background: categoryColors[cat] || '#64748b' }} />
                      <span className={styles.catName}>{categoryLabels[cat] || cat}</span>
                      <div className={styles.catBarWrap}>
                        <div className={styles.catBar} style={{ width: `${(total / max) * 100}%`, background: categoryColors[cat] || '#64748b' }} />
                      </div>
                      <span className={styles.catValue}>{formatBRL(total)}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ===== TAB: PAINEL DO PERÍODO ===== */}
      {activeTab === 'mensal' && (
        <div className={styles.tabContent}>
          {/* Period summary bar */}
          <div className={styles.monthSummary}>
            <div className={`${styles.monthSummaryItem} ${styles.monthRevenue}`}>
              <span className={styles.monthSummaryLabel}>Receita</span>
              <span className={styles.monthSummaryValue}>{formatBRL(monthRevenue)}</span>
            </div>
            <div className={styles.monthSummaryOperator}>-</div>
            <div className={`${styles.monthSummaryItem} ${styles.monthExpense}`}>
              <span className={styles.monthSummaryLabel}>Despesas</span>
              <span className={styles.monthSummaryValue}>{formatBRL(monthCosts)}</span>
            </div>
            <div className={styles.monthSummaryOperator}>=</div>
            <div className={`${styles.monthSummaryItem} ${monthProfit >= 0 ? styles.monthProfit : styles.monthLoss}`}>
              <span className={styles.monthSummaryLabel}>{monthProfit >= 0 ? 'Lucro' : 'Prejuízo'}</span>
              <span className={styles.monthSummaryValue}>{formatBRL(Math.abs(monthProfit))}</span>
            </div>
          </div>

          {/* Gauges row */}
          <div className={styles.gaugesGrid}>
            <div className={styles.gaugeCard}>
              <GaugeChart
                label="Lucro"
                value={monthMargin}
                max={100}
                suffix="%"
                color={monthMargin >= 20 ? '#4ade80' : monthMargin >= 10 ? '#fbbf24' : '#f87171'}
              />
            </div>
            <div className={styles.gaugeCard}>
              <GaugeChart
                label="Insumos"
                value={insumosRatioMensal}
                max={100}
                suffix="%"
                color={insumosRatioMensal <= 30 ? '#4ade80' : insumosRatioMensal <= 45 ? '#fbbf24' : '#f87171'}
              />
            </div>
            <div className={styles.gaugeCard}>
              <GaugeChart
                label="Mao de Obra"
                value={maoObraRatioMensal}
                max={100}
                suffix="%"
                color={maoObraRatioMensal <= 25 ? '#4ade80' : maoObraRatioMensal <= 40 ? '#fbbf24' : '#f87171'}
              />
            </div>
          </div>

          {/* Horizontal bars */}
          <div className={styles.barsGrid}>
            <div className={styles.barCard}>
              <HorizontalBarChart
                title="Despesas Variaveis"
                items={variableCosts}
                formatValue={formatBRL}
              />
            </div>
            <div className={styles.barCard}>
              <HorizontalBarChart
                title="Despesas Fixas"
                items={fixedCosts}
                formatValue={formatBRL}
              />
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB: LANCAMENTOS ===== */}
      {activeTab === 'lancamentos' && (
        <div className={styles.tabContent}>
          {/* Filters */}
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              {(['all', 'revenue', 'cost'] as FilterType[]).map((type) => (
                <button
                  key={type}
                  className={`${styles.filterBtn} ${filterType === type ? styles.filterBtnActive : ''}`}
                  onClick={() => { setFilterType(type); setLancamentosPage(1); }}
                >
                  {type === 'all' ? 'Todos' : type === 'revenue' ? 'Receitas' : 'Custos'}
                </button>
              ))}
            </div>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar por descricao, categoria..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setLancamentosPage(1); }}
            />
            <button className={styles.btnExport} onClick={exportCSV} title="Exportar lançamentos filtrados para CSV">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar CSV
            </button>
            <button className={styles.btnExport} onClick={exportDRE} title="Exportar no padrão DRE (mensal, por seção)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Exportar DRE
            </button>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>Nenhum lançamento encontrado.</div>
          ) : (
            <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descricao</th>
                  <th>Categoria</th>
                  <th>Origem</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Valor</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice((lancamentosPage - 1) * 50, lancamentosPage * 50).map((entry) => (
                  <tr
                    key={entry.id}
                    className={styles.clickableRow}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedFinance(entry)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedFinance(entry);
                      }
                    }}
                  >
                    <td>
                      <span className={entry.type === 'revenue' ? styles.typeRevenue : styles.typeCost}>
                        {entry.type === 'revenue' ? 'Receita' : 'Custo'}
                      </span>
                    </td>
                    <td>{entry.description}</td>
                    <td>
                      <span className={styles.categoryTag}>
                        <span
                          className={styles.categoryDot}
                          style={{ background: categoryColors[entry.category] || '#64748b' }}
                        />
                        {categoryLabels[entry.category] || entry.category}
                      </span>
                    </td>
                    <td>{entry.automatic ? 'Evento automático' : entry.origin === 'factory_order' ? 'Pedido da Fábrica' : entry.origin === 'bank_import' ? 'Extrato OFX' : 'Manual'}</td>
                    <td>{safeFormatDate(entry.date, 'dd/MM/yy', { locale: ptBR })}</td>
                    <td>
                      <select
                        className={`${styles.agendamentoStatus} ${entry.status === 'paid' ? styles.statusReceived : styles.statusPending}`}
                        value={entry.status}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(e) => handleEventFinanceStatus(entry, e.target.value as FinanceStatus)}
                        >
                          <option value="pending">Pendente</option>
                          <option value="paid">Pago</option>
                      </select>
                    </td>
                    <td>
                      <span className={entry.type === 'revenue' ? styles.typeRevenue : styles.typeCost}>
                        {entry.type === 'revenue' ? '+' : '-'} {formatBRL(entry.amount)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className={styles.actionBtn}
                          onClick={(event) => { event.stopPropagation(); handleFinanceEditAction(entry); }}
                          title="Editar lançamento"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          onClick={(event) => { event.stopPropagation(); requestFinanceDelete(entry); }}
                          title="Excluir lançamento"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
          {filtered.length > 50 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setLancamentosPage(p => p - 1)}
                disabled={lancamentosPage <= 1}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                Anterior
              </button>
              <span className={styles.pageInfo}>
                Página {lancamentosPage} de {Math.ceil(filtered.length / 50)}
                <span className={styles.pageTotal}> · {filtered.length} lançamentos</span>
              </span>
              <button
                className={styles.pageBtn}
                onClick={() => setLancamentosPage(p => p + 1)}
                disabled={lancamentosPage >= Math.ceil(filtered.length / 50)}
              >
                Próxima
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== TAB: ESTIMADO x FINAL ===== */}
      {activeTab === 'valores' && (() => {
        const eventsWithValues = activeEvents
          .filter((e) =>
            (e.budget > 0 || (e.travelCost ?? 0) > 0 || (e.depositValue ?? 0) > 0 || (e.finalValue ?? 0) > 0) &&
            matchesFinancePeriod(e.date, financePeriod),
          )
          .sort((a, b) => b.date.localeCompare(a.date));
        const totalEstimado = eventsWithValues.reduce((acc, e) => acc + (e.budget || 0), 0);
        const totalDeslocamento = eventsWithValues.reduce((acc, e) => acc + (e.travelCost || 0), 0);
        const totalSinal = eventsWithValues.reduce((acc, e) => acc + (e.depositValue || 0), 0);
        const totalFinal = eventsWithValues.reduce((acc, e) => acc + (e.finalValue || 0), 0);
        const diff = totalFinal - totalEstimado;
        return (
          <div className={styles.tabContent}>
            {/* Summary */}
            <div className={`${styles.summaryBar} ${styles.eventFinancialSummary}`}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>Total Estimado</span>
                <span className={styles.summaryItemValue}>{formatBRL(totalEstimado)}</span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>Deslocamento</span>
                <span className={`${styles.summaryItemValue} ${styles.amber}`}>{formatBRL(totalDeslocamento)}</span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>Sinal Recebido</span>
                <span className={`${styles.summaryItemValue} ${styles.green}`}>{formatBRL(totalSinal)}</span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>Total Final</span>
                <span className={`${styles.summaryItemValue} ${totalFinal >= totalEstimado ? styles.green : styles.amber}`}>{formatBRL(totalFinal)}</span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>Diferença</span>
                <span className={`${styles.summaryItemValue} ${diff >= 0 ? styles.green : styles.red}`}>
                  {diff >= 0 ? '+' : ''}{formatBRL(diff)}
                </span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>Eventos</span>
                <span className={styles.summaryItemValue}>{eventsWithValues.length}</span>
              </div>
            </div>

            {/* Table */}
            {eventsWithValues.length === 0 ? (
              <div className={styles.emptyState}>Nenhum evento com valor cadastrado.</div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Situação</th>
                      <th>Data</th>
                      <th>Valor Estimado</th>
                      <th>Deslocamento</th>
                      <th>Sinal Recebido</th>
                      <th>Valor Final</th>
                      <th>Custos vinculados</th>
                      <th>Resultado</th>
                      <th>Pagamento</th>
                      <th>Diferença</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventsWithValues.map((e) => {
                      const estimado = e.budget || 0;
                      const deslocamento = e.travelCost || 0;
                      const sinal = e.depositValue || 0;
                      const final = e.finalValue || 0;
                      const eventCosts = activeFinances.filter((entry) => entry.eventId === e.id && entry.type === 'cost').reduce((sum, entry) => sum + entry.amount, 0);
                      const eventResult = (final || estimado) - eventCosts;
                      const d = final - estimado;
                      return (
                        <tr
                          key={e.id}
                          className={styles.clickableRow}
                          onClick={() => setSelectedEvent(e)}
                          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedEvent(e); } }}
                          tabIndex={0}
                          role="button"
                        >
                          <td>{e.name}</td>
                          <td><span className={styles.financialStatus}>{e.financialStatus === 'closed' ? 'Fechado' : e.financialStatus === 'settled' ? 'Quitado' : e.financialStatus === 'partial' ? 'Parcial' : 'Em aberto'}</span></td>
                          <td>{safeFormatDate(e.date, "dd/MM/yyyy", { locale: ptBR })}</td>
                          <td>{estimado > 0 ? formatBRL(estimado) : '—'}</td>
                          <td>{deslocamento > 0 ? <span className={styles.amber}>{formatBRL(deslocamento)}</span> : '—'}</td>
                          <td>{sinal > 0 ? <span className={styles.green}>{formatBRL(sinal)}</span> : '—'}</td>
                          <td>{final > 0 ? <span className={styles.green}>{formatBRL(final)}</span> : '—'}</td>
                          <td>{eventCosts > 0 ? <span className={styles.red}>{formatBRL(eventCosts)}</span> : '—'}</td>
                          <td><span className={eventResult >= 0 ? styles.green : styles.red}>{formatBRL(eventResult)}</span></td>
                          <td>{e.paymentMethod || '—'}</td>
                          <td>
                            {estimado > 0 && final > 0 ? (
                              <span className={d >= 0 ? styles.green : styles.red}>
                                {d >= 0 ? '+' : ''}{formatBRL(d)}
                              </span>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {selectedEvent && (
        <Modal title={`Detalhes: ${selectedEvent.name}`} size="md" onClose={() => setSelectedEvent(null)}>
          <div className={styles.eventDetailGrid}>
            <div><span className={styles.eventDetailLabel}>Data</span><strong>{safeFormatDate(selectedEvent.date, 'dd/MM/yyyy', { locale: ptBR })}</strong></div>
            <div><span className={styles.eventDetailLabel}>Situação financeira</span><strong>{selectedEvent.financialStatus === 'closed' ? 'Fechado' : selectedEvent.financialStatus === 'settled' ? 'Quitado' : selectedEvent.financialStatus === 'partial' ? 'Parcial' : 'Em aberto'}</strong></div>
            <div><span className={styles.eventDetailLabel}>Status</span><strong>{selectedEvent.status || 'Não informado'}</strong></div>
            <div><span className={styles.eventDetailLabel}>Valor estimado</span><strong>{formatBRL(selectedEvent.budget || 0)}</strong></div>
            <div><span className={styles.eventDetailLabel}>Deslocamento</span><strong>{selectedEvent.travelCost ? formatBRL(selectedEvent.travelCost) : 'Não informado'}</strong></div>
            <div><span className={styles.eventDetailLabel}>Valor final</span><strong>{selectedEvent.finalValue ? formatBRL(selectedEvent.finalValue) : 'Não informado'}</strong></div>
            <div><span className={styles.eventDetailLabel}>Diferença</span><strong className={(selectedEvent.finalValue || 0) - (selectedEvent.budget || 0) >= 0 ? styles.green : styles.red}>{selectedEvent.finalValue ? formatBRL((selectedEvent.finalValue || 0) - (selectedEvent.budget || 0)) : 'Não informado'}</strong></div>
            <div><span className={styles.eventDetailLabel}>Convidados</span><strong>{selectedEvent.guestCount || 0}</strong></div>
            <div><span className={styles.eventDetailLabel}>Local</span><strong>{selectedEvent.location || 'Não informado'}</strong></div>
            <div><span className={styles.eventDetailLabel}>Forma de pagamento</span><strong>{selectedEvent.paymentMethod || 'Não informado'}</strong></div>
            <div><span className={styles.eventDetailLabel}>Sinal recebido</span><strong>{selectedEvent.depositValue ? formatBRL(selectedEvent.depositValue) : 'Não informado'}</strong></div>
          </div>
          {selectedEvent.notes && <div className={styles.eventDetailNotes}><span className={styles.eventDetailLabel}>Observações</span><p>{selectedEvent.notes}</p></div>}
          <div className={styles.eventDetailActions}>
            {selectedEvent.financialCloseStatus === 'closed' ? (
              <button className={styles.btnExport} type="button" onClick={async () => { await reopenEventFinance(selectedEvent.id); setSelectedEvent(null); }}>
                Reabrir financeiro
              </button>
            ) : (
              <>
                <button className={styles.btnExport} type="button" onClick={async () => { await closeEventFinance(selectedEvent.id); setSelectedEvent(null); }}>
                  Fechar financeiro
                </button>
              </>
            )}
            <button className={styles.btnPrimary} type="button" onClick={() => { window.location.href = `/eventos?edit=${encodeURIComponent(selectedEvent.id)}`; }}>
              Editar evento
            </button>
            <button
              className={styles.btnDanger}
              type="button"
              onClick={async () => {
                if (!window.confirm('Excluir este evento? Esta ação não pode ser desfeita.')) return;
                await deleteEvent(selectedEvent.id);
                setSelectedEvent(null);
              }}
            >
              Excluir evento
            </button>
          </div>
        </Modal>
      )}

      {selectedFinance && (() => {
        const linkedEvent = activeEvents.find((event) => event.id === selectedFinance.eventId);
        const originLabel = selectedFinance.automatic
          ? 'Evento automático'
          : selectedFinance.origin === 'factory_order'
            ? 'Pedido da Fábrica'
            : selectedFinance.origin === 'bank_import'
              ? 'Extrato OFX'
              : 'Manual';
        const paymentLabel = selectedFinance.paymentMethod === 'pix' ? 'Pix'
          : selectedFinance.paymentMethod === 'money' ? 'Dinheiro'
            : selectedFinance.paymentMethod === 'debit' ? 'Cartão de débito'
              : selectedFinance.paymentMethod === 'credit' ? 'Cartão de crédito'
                : selectedFinance.paymentMethod === 'transfer' ? 'Transferência'
                  : selectedFinance.paymentMethod === 'bank' ? 'Conta bancária'
                    : selectedFinance.paymentMethod || 'Não informada';
        return (
          <Modal title="Detalhes do lançamento" size="md" onClose={() => setSelectedFinance(null)}>
            <div className={styles.eventDetailGrid}>
              <div><span className={styles.eventDetailLabel}>Tipo</span><strong className={selectedFinance.type === 'revenue' ? styles.green : styles.red}>{selectedFinance.type === 'revenue' ? 'Receita' : 'Custo'}</strong></div>
              <div><span className={styles.eventDetailLabel}>Valor</span><strong className={selectedFinance.type === 'revenue' ? styles.green : styles.red}>{selectedFinance.type === 'revenue' ? '+' : '-'} {formatBRL(selectedFinance.amount)}</strong></div>
              <div><span className={styles.eventDetailLabel}>Data</span><strong>{safeFormatDate(selectedFinance.date, 'dd/MM/yyyy', { locale: ptBR })}</strong></div>
              <div><span className={styles.eventDetailLabel}>Status</span><strong>{getDerivedFinanceLabel(selectedFinance)}</strong></div>
              <div><span className={styles.eventDetailLabel}>Categoria</span><strong>{categoryLabels[selectedFinance.category] || selectedFinance.category}</strong></div>
              <div><span className={styles.eventDetailLabel}>Origem</span><strong>{originLabel}</strong></div>
              <div><span className={styles.eventDetailLabel}>Evento</span><strong>{linkedEvent?.name || 'Não vinculado'}</strong></div>
              <div><span className={styles.eventDetailLabel}>Forma de pagamento</span><strong>{paymentLabel}</strong></div>
              {selectedFinance.dueDate && <div><span className={styles.eventDetailLabel}>Vencimento</span><strong>{safeFormatDate(selectedFinance.dueDate, 'dd/MM/yyyy', { locale: ptBR })}</strong></div>}
              {selectedFinance.settledAt && <div><span className={styles.eventDetailLabel}>Liquidação</span><strong>{safeFormatDate(selectedFinance.settledAt.slice(0, 10), 'dd/MM/yyyy', { locale: ptBR })}</strong></div>}
              {selectedFinance.installmentTotal && <div><span className={styles.eventDetailLabel}>Parcela</span><strong>{selectedFinance.installmentNumber || 1} de {selectedFinance.installmentTotal}</strong></div>}
              {selectedFinance.bankAccount && <div><span className={styles.eventDetailLabel}>Conta bancária</span><strong>{selectedFinance.bankAccount}</strong></div>}
            </div>
            <div className={styles.eventDetailNotes}>
              <span className={styles.eventDetailLabel}>Descrição</span>
              <p>{selectedFinance.description || 'Sem descrição'}</p>
            </div>
            <div className={styles.eventDetailActions}>
              <button
                className={styles.btnExport}
                type="button"
                title="Editar lançamento"
                onClick={() => { const entry = selectedFinance; setSelectedFinance(null); handleFinanceEditAction(entry); }}
              >
                Editar
              </button>
              <button
                className={styles.btnDanger}
                type="button"
                title="Excluir lançamento"
                onClick={() => requestFinanceDelete(selectedFinance)}
              >
                Excluir
              </button>
            </div>
          </Modal>
        );
      })()}

      {financePendingDelete && (
        <Modal
          title="Confirmar exclusão"
          size="sm"
          onClose={() => { if (!deletingFinance) setFinancePendingDelete(null); }}
        >
          <div className={styles.confirmDeleteContent}>
            <p>
              Tem certeza de que deseja excluir este lançamento? Esta ação não pode ser desfeita.
            </p>
            <div className={styles.confirmDeleteSummary}>
              <strong>{financePendingDelete.description || 'Sem descrição'}</strong>
              <span className={financePendingDelete.type === 'revenue' ? styles.green : styles.red}>
                {financePendingDelete.type === 'revenue' ? '+' : '-'} {formatBRL(financePendingDelete.amount)}
              </span>
            </div>
            <div className={styles.eventDetailActions}>
              <button className={styles.btnExport} type="button" disabled={deletingFinance} onClick={() => setFinancePendingDelete(null)}>Cancelar</button>
              <button className={styles.btnDanger} type="button" disabled={deletingFinance} onClick={confirmFinanceDelete}>
                {deletingFinance ? 'Processando...' : 'Confirmar exclusão'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title={editingFinanceId ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'} size="lg" onClose={() => { resetForm(); setShowForm(false); }}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Tipo</label>
                <select
                  className={styles.formSelect}
                  value={formType}
                  onChange={(e) => {
                    setFormType(e.target.value as FinanceType);
                    setFormCategory('');
                  }}
                >
                  <option value="revenue">Receita</option>
                  <option value="cost">Custo</option>
                </select>
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Evento</label>
                <div className={styles.eventCombo} ref={eventComboRef}>
                  <input
                    type="text"
                    className={`${styles.formInput} ${styles.eventComboInput}`}
                    placeholder="Buscar evento..."
                    value={eventSearch}
                    autoComplete="off"
                    onChange={(e) => {
                      setEventSearch(e.target.value);
                      setFormEventId('');
                      setShowEventDropdown(true);
                    }}
                    onFocus={() => setShowEventDropdown(true)}
                  />
                  {(eventSearch || formEventId) && (
                    <button
                      type="button"
                      className={styles.eventClearBtn}
                      onClick={() => { setFormEventId(''); setEventSearch(''); setShowEventDropdown(false); }}
                      title="Limpar"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  )}
                  {showEventDropdown && (
                    <div className={styles.eventDropdown}>
                      {eventDropdownOptions.length === 0 ? (
                        <div className={styles.eventDropdownEmpty}>Nenhum evento encontrado</div>
                      ) : (
                        eventDropdownOptions.map((evt) => (
                          <button
                            key={evt.id}
                            type="button"
                            className={`${styles.eventOption} ${formEventId === evt.id ? styles.eventOptionSelected : ''}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setFormEventId(evt.id);
                              setEventSearch(evt.name);
                              setShowEventDropdown(false);
                            }}
                          >
                            {evt.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  Categoria
                  <button
                    type="button"
                    className={styles.btnAddCategory}
                    onClick={() => { setNewCategorySection(formType === 'revenue' ? 'faturamentos' : 'despesas-administrativas'); setShowCategoryModal(true); }}
                    title="Criar nova categoria"
                  >
                    + Nova categoria
                  </button>
                </label>
                <select
                  className={styles.formSelect}
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  {groupedFormCategories.filter((g) => g.categories.length > 0).map((g) => (
                    <optgroup key={g.section.key} label={g.section.label}>
                      {g.categories.map((cat) => (
                        <option key={cat.key} value={cat.key}>{cat.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Valor (R$)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={formAmount}
                  onChange={(e) => setFormAmount(formatCurrency(e.target.value))}
                  placeholder="R$ 0,00"
                  required
                />
              </div>
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Descricao</label>
              <input
                type="text"
                className={styles.formInput}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Descreva o lançamento"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Data</label>
                <input
                  type="date"
                  className={styles.formInput}
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Situação inicial</label>
                <p className={styles.formHint}>Pendente. Registre a liquidação depois, com valor e data efetiva.</p>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Forma de pagamento</label>
                <select className={styles.formSelect} value={formPaymentMethod} onChange={(e) => setFormPaymentMethod(e.target.value)}>
                  <option value="">Não informada</option>
                  <option value="pix">Pix</option>
                  <option value="money">Dinheiro</option>
                  <option value="debit">Cartao de debito</option>
                  <option value="credit">Cartao de credito</option>
                  <option value="transfer">Transferencia</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            </div>

            {!editingFinanceId && (
              <div className={styles.formSection}>
                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Parcelar em quantas vezes?</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      className={styles.formInput}
                      value={formInstallments}
                      onChange={(e) => { setFormInstallments(e.target.value); if (Number(e.target.value) > 1) setFormRecurring(false); }}
                    />
                    <p className={styles.formHint}>1 = à vista. Acima disso gera parcelas mensais (1/N, 2/N...).</p>
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.recurrenceToggle}>
                      <input type="checkbox" checked={formRecurring} onChange={(e) => { setFormRecurring(e.target.checked); if (e.target.checked) setFormInstallments('1'); }} disabled={Number(formInstallments) > 1} />
                      <span><strong>Repetir lançamento</strong><small>Crie automaticamente as próximas ocorrências</small></span>
                    </label>
                  </div>
                </div>
                {formRecurring && (
                  <div className={styles.recurrencePanel}>
                    <div className={styles.recurrenceFields}>
                      <label><span>Repetir a cada</span><input type="number" min="1" max="365" className={styles.formInput} value={formRecurrenceInterval} onChange={(e) => setFormRecurrenceInterval(e.target.value)} /></label>
                      <label><span>Frequência</span><select className={styles.formSelect} value={formRecurrenceFrequency} onChange={(e) => setFormRecurrenceFrequency(e.target.value as RecurrenceFrequency)}><option value="daily">Dia(s)</option><option value="weekly">Semana(s)</option><option value="monthly">Mês(es)</option><option value="yearly">Ano(s)</option></select></label>
                      <label><span>Terminar após</span><div className={styles.occurrenceInput}><input type="number" min="1" max="366" className={styles.formInput} value={formRecurrenceTotal} onChange={(e) => setFormRecurrenceTotal(e.target.value)} /><span>ocorrências</span></div></label>
                    </div>
                    <div className={styles.recurrencePreview}>
                      <div><strong>Recorrências previstas</strong><span>{recurrencePreview.length} lançamentos · Total {formatBRL(parseCurrency(formAmount) * recurrencePreview.length)}</span></div>
                      <div className={styles.recurrenceDates}>{recurrencePreview.slice(0, 6).map((date, index) => <span key={`${date}-${index}`}>{index + 1}. {safeFormatDate(date, 'dd/MM/yyyy')}</span>)}{recurrencePreview.length > 6 && <span>+ {recurrencePreview.length - 6} ocorrências</span>}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className={styles.formActions}>
              <Button variant="secondary" type="button" onClick={() => { resetForm(); setShowForm(false); }}>
                Cancelar
              </Button>
              <Button type="submit">{editingFinanceId ? 'Salvar Alterações' : 'Salvar'}</Button>
            </div>
          </form>
        </Modal>
      )}
      {/* XML Import Modal */}
      {showXmlModal && (
        <div className={styles.overlay} onClick={() => setShowXmlModal(false)}>
          <div className={styles.xmlModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Importar NF-e XML</h2>
                {xmlSupplier && <p className={styles.xmlSupplier}>Fornecedor: <strong>{xmlSupplier}</strong></p>}
                {xmlDate && <p className={styles.xmlSupplier}>Data: <strong>{new Date(xmlDate + 'T12:00:00').toLocaleDateString('pt-BR')}</strong></p>}
              </div>
              <button className={styles.modalClose} onClick={() => setShowXmlModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className={styles.modalBody} style={{ padding: '16px 24px', gap: 12 }}>
              <div className={styles.xmlMeta}>
                <span className={styles.xmlCount}>{xmlItems.filter(i => i.selected).length} de {xmlItems.length} itens selecionados</span>
                <button className={styles.xmlToggleAll} onClick={() => {
                  const allSelected = xmlItems.every(i => i.selected);
                  setXmlItems(prev => prev.map(i => ({ ...i, selected: !allSelected })));
                }}>
                  {xmlItems.every(i => i.selected) ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
              </div>
              <div className={styles.xmlList}>
                {xmlItems.map((item) => (
                  <div key={item.id} className={`${styles.xmlRow} ${!item.selected ? styles.xmlRowDisabled : ''}`}>
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={(e) => setXmlItems(prev => prev.map(i => i.id === item.id ? { ...i, selected: e.target.checked } : i))}
                      style={{ accentColor: 'var(--accent)', flexShrink: 0 }}
                    />
                    <div className={styles.xmlInfo}>
                      <span className={styles.xmlName}>{item.name}</span>
                      <span className={styles.xmlDetails}>
                        {item.quantity} {item.measureUnit} × R$ {item.unitValue.toFixed(2)} = <strong>R$ {item.totalValue.toFixed(2)}</strong>
                      </span>
                    </div>
                    <select
                      className={styles.xmlCatSelect}
                      value={item.category}
                      onChange={(e) => setXmlItems(prev => prev.map(i => i.id === item.id ? { ...i, category: e.target.value } : i))}
                    >
                      <option value="">Categoria...</option>
                      {groupedCostCategories.filter((g) => g.categories.length > 0).map((g) => (
                        <optgroup key={g.section.key} label={g.section.label}>
                          {g.categories.map((cat) => (
                            <option key={cat.key} value={cat.key}>{cat.label}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className={styles.xmlTotal}>
                Total selecionado: <strong>R$ {xmlItems.filter(i => i.selected).reduce((acc, i) => acc + i.totalValue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setShowXmlModal(false)}>Cancelar</button>
              <button
                className={styles.btnPrimary}
                onClick={handleXmlImport}
                disabled={xmlImporting || xmlItems.every(i => !i.selected)}
              >
                {xmlImporting
                  ? 'Importando...'
                  : `Importar ${xmlItems.filter(i => i.selected).length} item${xmlItems.filter(i => i.selected).length !== 1 ? 's' : ''}`
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {showOfxModal && (
        <div className={styles.overlay} onClick={() => setShowOfxModal(false)}>
          <div className={styles.xmlModal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Importar extrato OFX</h2>
                <p className={styles.xmlSupplier}>Conta: <strong>{ofxBankAccount}</strong></p>
                {ofxStatementBalance !== undefined && Number.isFinite(ofxStatementBalance) && (
                  <p className={styles.xmlSupplier}>Saldo informado pelo banco: <strong>{formatBRL(ofxStatementBalance)}</strong></p>
                )}
              </div>
              <button className={styles.modalClose} onClick={() => setShowOfxModal(false)} aria-label="Fechar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className={styles.modalBody} style={{ padding: '16px 24px', gap: 12 }}>
              <div className={styles.xmlMeta}>
                <span className={styles.xmlCount}>
                  {ofxItems.filter((item) => item.selected).length} de {ofxItems.length} movimentos selecionados
                  {ofxItems.some((item) => item.decision === 'duplicate') && ` - ${ofxItems.filter((item) => item.decision === 'duplicate').length} ja importado(s)`}
                </span>
                <button className={styles.xmlToggleAll} onClick={() => {
                  const available = ofxItems.filter((item) => item.decision === 'link' || item.decision === 'create_unclassified');
                  const allSelected = available.length > 0 && available.every((item) => item.selected);
                  setOfxItems((current) => current.map((item) => ({ ...item, selected: item.decision === 'duplicate' || item.decision === 'ambiguous' ? false : !allSelected })));
                }}>
                  {ofxItems.filter((item) => item.decision === 'link' || item.decision === 'create_unclassified').every((item) => item.selected) ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
              </div>
              <div className={styles.xmlList}>
                {ofxItems.map((item) => {
                  const groups = item.type === 'revenue' ? groupedRevenueCategories : groupedCostCategories;
                  return (
                    <div key={item.id} className={`${styles.xmlRow} ${(!item.selected || item.decision === 'duplicate' || item.decision === 'ambiguous') ? styles.xmlRowDisabled : ''}`}>
                      <input
                        type="checkbox"
                        checked={item.selected}
                        disabled={item.decision === 'duplicate' || item.decision === 'ambiguous'}
                        onChange={(event) => setOfxItems((current) => current.map((currentItem) => currentItem.id === item.id ? { ...currentItem, selected: event.target.checked } : currentItem))}
                      />
                      <span className={`${styles.ofxType} ${item.type === 'revenue' ? styles.ofxCredit : styles.ofxDebit}`}>
                        {item.type === 'revenue' ? 'Entrada' : 'Saída'}
                      </span>
                      <div className={styles.xmlInfo}>
                        <span className={styles.xmlName}>{item.description}</span>
                        <span className={styles.xmlDetails}>{safeFormatDate(item.date, 'dd/MM/yyyy')} - <strong>{formatBRL(item.amount)}</strong>{item.decision === 'duplicate' ? ' - Já importado' : item.decision === 'link' ? ' - Vincular à previsão' : item.decision === 'ambiguous' ? ' - Requer decisão manual' : ' - Não classificado até escolher categoria'}</span>
                      </div>
                      <select
                        className={styles.xmlCatSelect}
                        value={item.category}
                        disabled={item.decision !== 'create_unclassified'}
                        onChange={(event) => setOfxItems((current) => current.map((currentItem) => currentItem.id === item.id ? { ...currentItem, category: event.target.value } : currentItem))}
                      >
                        <option value="">Não classificar agora — fora do DRE</option>
                        <option value="outro">Outros</option>
                        {groups.filter((group) => group.categories.length > 0).map((group) => (
                          <optgroup key={group.section.key} label={group.section.label}>
                            {group.categories.map((category) => <option key={category.key} value={category.key}>{category.label}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
              <div className={styles.ofxTotals}>
                <span>Entradas <strong className={styles.green}>{formatBRL(ofxItems.filter((item) => item.selected && item.type === 'revenue').reduce((sum, item) => sum + item.amount, 0))}</strong></span>
                <span>Saídas <strong className={styles.red}>{formatBRL(ofxItems.filter((item) => item.selected && item.type === 'cost').reduce((sum, item) => sum + item.amount, 0))}</strong></span>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setShowOfxModal(false)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleOfxImport} disabled={ofxPreviewing || ofxImporting || !ofxItems.some((item) => item.selected && item.decision !== 'duplicate' && item.decision !== 'ambiguous')}>
                {ofxImporting ? 'Importando...' : `Importar ${ofxItems.filter((item) => item.selected && item.decision !== 'duplicate' && item.decision !== 'ambiguous').length} movimentos`}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <Modal title="Nova Categoria" size="sm" onClose={() => setShowCategoryModal(false)}>
          <div className={styles.form}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Nome da categoria</label>
              <input
                type="text"
                className={styles.formInput}
                value={newCategoryLabel}
                onChange={(e) => setNewCategoryLabel(e.target.value)}
                placeholder="Ex: Manutenção de Fornos"
                autoFocus
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Seção do DRE</label>
              <select
                className={styles.formSelect}
                value={newCategorySection}
                onChange={(e) => setNewCategorySection(e.target.value as DreSection)}
              >
                {DRE_SECTIONS.filter((s) => s.type === formType).map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
              <p className={styles.formHint}>Define em qual linha do DRE essa categoria entra na exportação.</p>
            </div>
            <div className={styles.formActions}>
              <Button variant="secondary" type="button" onClick={() => setShowCategoryModal(false)}>Cancelar</Button>
              <Button type="button" onClick={handleCreateCategory} disabled={savingCategory || !newCategoryLabel.trim()}>
                {savingCategory ? 'Salvando...' : 'Criar categoria'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showInfo && (
        <div className={styles.overlay} onClick={() => setShowInfo(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Sobre esta página</h2>
              <button className={styles.modalClose} onClick={() => setShowInfo(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.infoSection}>
                <p className={styles.infoSectionTitle}>O que é esta página?</p>
                <p className={styles.infoText}>
                  A página <strong>Financeiro</strong> centraliza o controle de receitas e despesas do seu negócio. Visualize indicadores, gráficos por categoria, evolução mensal e gerencie todos os lançamentos.
                </p>
              </div>
              <div className={styles.infoSection}>
                <p className={styles.infoSectionTitle}>Como registrar um lançamento</p>
                <ol className={styles.infoList}>
                  <li>Clique em <strong>Novo Lançamento</strong> no canto superior direito.</li>
                  <li>Selecione o tipo: <strong>Receita</strong> ou <strong>Despesa</strong>.</li>
                  <li>Escolha a categoria, descreva o lançamento e informe o valor.</li>
                  <li><strong>Competência</strong> é a data prevista; <strong>Caixa</strong> usa a data efetiva de cada baixa.</li>
                  <li>Para liquidar, informe valor, data efetiva, método e referência. Uma receita liquidada aparece como Recebido; uma despesa, como Pago.</li>
                  <li>Pendente ainda não possui baixa, Parcial possui baixa incompleta e Cancelado não compõe os totais.</li>
                  <li>Clique em <strong>Salvar</strong> para confirmar.</li>
                </ol>
              </div>
              <div className={styles.infoSection}>
                <p className={styles.infoSectionTitle}>Regras financeiras</p>
                <ul className={styles.infoList}>
                  <li><strong>Liquidação é o único estado financeiro:</strong> ela registra uma entrada ou saída efetiva. “Recebido” e “Pago” são apenas descrições de receita e despesa liquidada.</li>
                  <li><strong>Competência</strong> usa a data prevista do lançamento; <strong>Caixa</strong> usa a data efetiva de cada liquidação. Um sinal entra no mês em que foi recebido.</li>
                  <li>Liquidações podem ser parciais. Para corrigir, estornar ou cancelar uma baixa, use o comando com justificativa; não altere o status diretamente.</li>
                  <li><strong>Evento cancelado exclui automaticamente</strong> a previsão financeira vinculada, mesmo que já tenha baixa registrada.</li>
                  <li>O fechamento financeiro do evento apenas encerra a conferência operacional: ele não cria recebimento, pagamento ou baixa automática.</li>
                </ul>
              </div>
              <div className={styles.infoSection}>
                <p className={styles.infoSectionTitle}>DRE, extratos e unidades</p>
                <ul className={styles.infoList}>
                  <li>O DRE considera lançamentos classificados. Movimentos OFX não classificados ficam fora do DRE até receberem uma categoria.</li>
                  <li>A importação OFX é revisada no servidor: duplicidades são ignoradas e vínculos ambíguos exigem escolha manual.</li>
                  <li>A partir de agosto de 2026, Campinas passa a compor Sorocaba nos relatórios gerenciais; a unidade de origem do lançamento é preservada.</li>
                </ul>
              </div>
              <div className={styles.infoSection}>
                <p className={styles.infoSectionTitle}>Abas disponíveis</p>
                <ul className={styles.infoList}>
                  <li><strong>Geral</strong> — indicadores de saúde financeira e gráfico de receitas vs despesas.</li>
                  <li><strong>Despesas</strong> — breakdown por categoria fixa e variável.</li>
                  <li><strong>Mensal</strong> — evolução mês a mês.</li>
                  <li><strong>Lançamentos</strong> — tabela completa com filtros e busca.</li>
                </ul>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <span />
              <button className={styles.btnPrimary} onClick={() => setShowInfo(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers
function formatMonth(ym: string) {
  const [y, m] = ym.split('-');
  return `${MONTHS_PT[parseInt(m, 10) - 1]} ${y?.substring(2)}`;
}

function safeFormatDate(date: string | undefined | null, fmt: string, options?: Parameters<typeof format>[2]): string {
  if (!date) return '-';
  const d = parseISO(date);
  return isValid(d) ? format(d, fmt, options) : '-';
}
