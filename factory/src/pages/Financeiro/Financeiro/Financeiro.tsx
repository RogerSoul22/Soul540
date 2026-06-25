import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import GaugeChart from '@/components/GaugeChart/GaugeChart';
import HorizontalBarChart from '@/components/HorizontalBarChart/HorizontalBarChart';
import Button from '@/components/Button/Button';
import Modal from '@/components/Modal/Modal';
import styles from './Financeiro.module.scss';

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

function safeFormat(date: string | undefined | null, fmt: string, options?: Parameters<typeof format>[2]): string {
  if (!date) return '—';
  const d = parseISO(date);
  return isValid(d) ? format(d, fmt, options) : '—';
}

type FinanceType = 'revenue' | 'cost';
type FinanceStatus = 'pending' | 'paid' | 'received';

const FIXED_CATEGORIES = ['salario', 'pro-labore', 'aluguel', 'emprestimos', 'contador', 'agua-luz', 'tarifa-bancos', 'investimento'] as const;
const VARIABLE_CATEGORIES = ['insumos', 'impostos', 'embalagens', 'marketing', 'tarifa-cartao', 'carro-manut', 'combustivel', 'maquinas-manut', 'outros', 'pedagio', 'gas', 'premio', 'batatas', 'alimentacao', 'bebidas', 'prod-limpeza'] as const;

const CATEGORY_LABELS: Record<string, string> = {
  'salario': 'Salario', 'pro-labore': 'Pro Labore', 'aluguel': 'Aluguel', 'emprestimos': 'Emprestimos',
  'contador': 'Contador', 'agua-luz': 'Agua e Luz', 'tarifa-bancos': 'Tarifa Bancos', 'investimento': 'Investimento',
  'insumos': 'Insumos', 'impostos': 'Impostos', 'embalagens': 'Embalagens', 'marketing': 'Marketing',
  'tarifa-cartao': 'Tarifa Cartao', 'carro-manut': 'Carro Manut.', 'combustivel': 'Combustivel',
  'maquinas-manut': 'Maquinas Manut.', 'outros': 'Outros', 'pedagio': 'Pedagio', 'gas': 'Gas',
  'premio': 'Premio', 'batatas': 'Batatas', 'alimentacao': 'Alimentacao', 'bebidas': 'Bebidas',
  'prod-limpeza': 'Prod. Limpeza', 'contrato': 'Contrato', 'adicional': 'Adicional', 'equipe': 'Equipe',
  'ingredientes': 'Ingredientes', 'logistica': 'Logistica',
};

const CATEGORY_COLORS: Record<string, string> = {
  'insumos': '#ef4444', 'impostos': '#f97316', 'embalagens': '#eab308', 'marketing': '#84cc16',
  'tarifa-cartao': '#22c55e', 'carro-manut': '#06b6d4', 'combustivel': '#3b82f6', 'gas': '#8b5cf6',
  'maquinas-manut': '#d946ef', 'outros': '#64748b', 'pedagio': '#14b8a6', 'premio': '#f43f5e',
  'batatas': '#a3e635', 'alimentacao': '#fb923c', 'bebidas': '#38bdf8', 'prod-limpeza': '#a78bfa',
  'salario': '#dc2626', 'pro-labore': '#b91c1c', 'aluguel': '#0ea5e9', 'emprestimos': '#7c3aed',
  'contador': '#059669', 'agua-luz': '#0891b2', 'tarifa-bancos': '#6366f1', 'investimento': '#ca8a04',
};

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

type TabType = 'geral' | 'despesas' | 'mensal' | 'lancamentos';
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
const getCategoryLabel = (category: string) => CATEGORY_LABELS[category] || category;
const sortCategoriesAlpha = (categories: readonly string[]) =>
  [...categories].sort((a, b) => compareAlpha(getCategoryLabel(a), getCategoryLabel(b)));

const formCategories: Record<FinanceType, string[]> = {
  revenue: sortCategoriesAlpha(['contrato', 'adicional', 'taxa', 'outro']),
  cost: sortCategoriesAlpha([...FIXED_CATEGORIES, ...VARIABLE_CATEGORIES]),
};

export default function Financeiro() {
  const { events, finances, addFinance, updateFinance, deleteFinance } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('geral');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().substring(0, 7));
  const [costFilter, setCostFilter] = useState<CostFilter>('all');
  const [pageMonth, setPageMonth] = useState<string>('all');

  // Table filters
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Form state
  const [formType, setFormType] = useState<FinanceType>('cost');
  const [formEventId, setFormEventId] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState<FinanceStatus>('pending');

  // Event combobox state
  const [eventSearch, setEventSearch] = useState('');
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const eventComboRef = useRef<HTMLDivElement>(null);

  const openEventDropdown = () => {
    if (eventComboRef.current) {
      const rect = eventComboRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setShowEventDropdown(true);
  };

  // XML import state
  const [showXmlModal, setShowXmlModal] = useState(false);
  const [xmlItems, setXmlItems] = useState<XmlFinanceItem[]>([]);
  const [xmlSupplier, setXmlSupplier] = useState('');
  const [xmlDate, setXmlDate] = useState('');
  const [xmlImporting, setXmlImporting] = useState(false);
  const xmlInputRef = useRef<HTMLInputElement>(null);

  const handleXmlFile = (e: ChangeEvent<HTMLInputElement>) => {
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
        category: it.category || 'outros',
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

  const filteredEventsForCombo = useMemo(() => {
    const eventsById = new Map<string, (typeof events)[number]>();
    for (const evt of events) {
      if (evt?.id && evt.name?.trim()) eventsById.set(evt.id, evt);
    }
    const sorted = [...eventsById.values()].sort((a, b) => compareAlpha(a.name, b.name));
    if (!eventSearch) return sorted;
    const q = eventSearch.toLowerCase();
    return sorted.filter(evt => evt.name.toLowerCase().includes(q));
  }, [events, eventSearch]);

  const eventDropdownOptions = useMemo(
    () => [...filteredEventsForCombo].sort((a, b) => compareAlpha(a.name, b.name)),
    [filteredEventsForCombo],
  );

  // === DATA COMPUTATIONS ===
  const pageMonthFinances = useMemo(
    () => pageMonth === 'all' ? finances : finances.filter((f) => f.date && f.date.startsWith(pageMonth)),
    [finances, pageMonth],
  );

  const totalRevenue = useMemo(
    () => pageMonthFinances.filter((f) => f.type === 'revenue').reduce((acc, f) => acc + f.amount, 0),
    [pageMonthFinances],
  );
  const totalCosts = useMemo(
    () => pageMonthFinances.filter((f) => f.type === 'cost').reduce((acc, f) => acc + f.amount, 0),
    [pageMonthFinances],
  );
  const profit = totalRevenue - totalCosts;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  // Monthly chart data
  const monthlyData = useMemo(() => {
    const map = new Map<string, { month: string; receita: number; despesa: number }>();
    for (const f of pageMonthFinances) {
      const ym = f.date.substring(0, 7);
      if (!map.has(ym)) map.set(ym, { month: ym, receita: 0, despesa: 0 });
      const entry = map.get(ym)!;
      if (f.type === 'revenue') entry.receita += f.amount;
      else entry.despesa += f.amount;
    }
    return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
  }, [pageMonthFinances]);

  // Available months for selector
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    for (const f of finances) set.add(f.date.substring(0, 7));
    return [...set].sort();
  }, [finances]);

  // Auto-select most recent month when finances load
  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[availableMonths.length - 1]);
    }
  }, [availableMonths]);

  // Monthly detail data
  const monthFinances = useMemo(
    () => finances.filter((f) => f.date.startsWith(selectedMonth)),
    [finances, selectedMonth],
  );

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
        label: CATEGORY_LABELS[cat] || cat,
        value: val,
        color: CATEGORY_COLORS[cat] || '#64748b',
      }))
      .sort((a, b) => compareAlpha(a.label, b.label));
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
        label: CATEGORY_LABELS[cat] || cat,
        value: val,
        color: CATEGORY_COLORS[cat] || '#64748b',
      }))
      .sort((a, b) => compareAlpha(a.label, b.label));
  }, [monthFinances]);

  // Gauge values for selected month
  const insumosRatio = useMemo(() => {
    const insumos = monthFinances
      .filter((f) => f.type === 'cost' && f.category === 'insumos')
      .reduce((acc, f) => acc + f.amount, 0);
    return monthRevenue > 0 ? (insumos / monthRevenue) * 100 : 0;
  }, [monthFinances, monthRevenue]);

  const maoObraRatio = useMemo(() => {
    const mo = monthFinances
      .filter((f) => f.type === 'cost' && (f.category === 'salario' || f.category === 'pro-labore'))
      .reduce((acc, f) => acc + f.amount, 0);
    return monthRevenue > 0 ? (mo / monthRevenue) * 100 : 0;
  }, [monthFinances, monthRevenue]);

  // Table filter
  const filtered = useMemo(() => {
    return finances.filter((f) => {
      if (filterType !== 'all' && f.type !== filterType) return false;
      if (filterMonth !== 'all' && !f.date.startsWith(filterMonth)) return false;
      if (search) {
        const q = search.toLowerCase();
        const event = events.find((e) => e.id === f.eventId);
        return (
          f.description.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          event?.name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [finances, filterType, filterMonth, search, events]);

  // Events with budget joined with their finance entry
  const eventsWithBudget = useMemo(() => {
    return events
      .filter((e) => (e.budget ?? 0) > 0)
      .map((e) => ({
        event: e,
        finance: finances.find(
          (f) => f.eventId === e.id && f.type === 'revenue' && f.category === 'contrato',
        ),
      }))
      .sort((a, b) => b.event.date.localeCompare(a.event.date));
  }, [events, finances]);

  const totalContracted = useMemo(
    () => eventsWithBudget.reduce((acc, { event }) => acc + (event.budget ?? 0), 0),
    [eventsWithBudget],
  );
  const totalReceived = useMemo(
    () => eventsWithBudget
      .filter(({ finance }) => finance?.status === 'received')
      .reduce((acc, { event }) => acc + (event.budget ?? 0), 0),
    [eventsWithBudget],
  );

  // === HANDLERS ===

  const handleEventFinanceStatus = async (financeId: string, status: FinanceStatus) => {
    await updateFinance(financeId, { status });
  };

  const exportCSV = () => {
    const typeLabel: Record<string, string> = { revenue: 'Receita', cost: 'Custo' };
    const stLabel: Record<string, string> = { pending: 'Pendente', paid: 'Pago', received: 'Recebido' };
    const rows = [
      ['Data', 'Tipo', 'Categoria', 'Descricao', 'Status', 'Valor (R$)'].join(';'),
      ...filtered.map((f) => [
        f.date,
        typeLabel[f.type] || f.type,
        CATEGORY_LABELS[f.category] || f.category,
        `"${(f.description || '').replace(/"/g, '""')}"`,
        stLabel[f.status] || f.status,
        f.amount.toFixed(2).replace('.', ','),
      ].join(';')),
    ];
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financeiro-fabrica-todos.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFormType('revenue');
    setFormEventId('');
    setEventSearch('');
    setFormCategory('');
    setFormDescription('');
    setFormAmount('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormStatus('pending');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formCategory || !formAmount) return;
    await addFinance({
      eventId: formEventId,
      type: formType,
      category: formCategory,
      description: formDescription,
      amount: parseCurrency(formAmount),
      date: formDate,
      status: formStatus,
    });
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
          <input ref={xmlInputRef} type="file" accept=".xml" style={{ display: 'none' }} onChange={handleXmlFile} />
          <button className={styles.btnXml} onClick={() => xmlInputRef.current?.click()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="12" y2="12"/><line x1="15" y1="15" x2="12" y2="12"/></svg>
            Importar XML
          </button>
          <Button onClick={() => setShowForm(true)}>+ Novo Lancamento</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {([
          ['geral', 'Visao Geral'],
          ['despesas', 'Painel Despesas'],
          ['mensal', 'Painel Mensal'],
          ['lancamentos', 'Lancamentos'],
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

      {['geral', 'despesas'].includes(activeTab) && availableMonths.length > 0 && (
        <div className={styles.pageMonthFilter}>
          <div className={styles.pageMonthField}>
            <label className={styles.pageMonthLabel}>Filtrar mês</label>
            <select className={styles.pageMonthSelect} value={pageMonth} onChange={(e) => setPageMonth(e.target.value)}>
              <option value="all">Todos os meses</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>
          </div>
          {pageMonth !== 'all' && (
            <button className={styles.pageMonthClear} onClick={() => setPageMonth('all')}>
              Limpar
            </button>
          )}
        </div>
      )}

      {/* ===== TAB: VISAO GERAL ===== */}
      {activeTab === 'geral' && (
        <div className={styles.tabContent}>
          {/* Summary Bar */}
          <div className={styles.summaryBar}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryItemLabel}>Receita Total</span>
              <span className={`${styles.summaryItemValue} ${styles.green}`}>{formatBRL(totalRevenue)}</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryItem}>
              <span className={styles.summaryItemLabel}>Despesas Total</span>
              <span className={`${styles.summaryItemValue} ${styles.red}`}>{formatBRL(totalCosts)}</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryItem}>
              <span className={styles.summaryItemLabel}>{profit >= 0 ? 'Lucro' : 'Prejuizo'}</span>
              <span className={`${styles.summaryItemValue} ${profit >= 0 ? styles.green : styles.red}`}>
                {formatBRL(Math.abs(profit))}
              </span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryItem}>
              <span className={styles.summaryItemLabel}>Margem</span>
              <span className={`${styles.summaryItemValue} ${styles.amber}`}>{margin.toFixed(1)}%</span>
            </div>
          </div>

          {/* Revenue vs Costs Chart */}
          <div className={styles.chartSection}>
            <h3 className={styles.sectionTitle}>Receita x Despesas por Mes</h3>
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
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
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
                  <span className={styles.agendamentosPillLabel}>Contratado</span>
                  <span className={styles.agendamentosPillValue}>{formatBRL(totalContracted)}</span>
                </div>
                <div className={styles.agendamentosPill}>
                  <span className={styles.agendamentosPillLabel}>Recebido</span>
                  <span className={`${styles.agendamentosPillValue} ${styles.green}`}>{formatBRL(totalReceived)}</span>
                </div>
                <div className={styles.agendamentosPill}>
                  <span className={styles.agendamentosPillLabel}>Pendente</span>
                  <span className={`${styles.agendamentosPillValue} ${styles.amber}`}>{formatBRL(totalContracted - totalReceived)}</span>
                </div>
              </div>
            </div>

            {eventsWithBudget.length === 0 ? (
              <p className={styles.agendamentosEmpty}>Nenhum agendamento com valor cadastrado.</p>
            ) : (
              <div className={styles.agendamentosList}>
                {eventsWithBudget.map(({ event, finance }) => (
                  <div key={event.id} className={styles.agendamentoRow}>
                    <div className={styles.agendamentoInfo}>
                      <span className={styles.agendamentoName}>{event.name}</span>
                      <span className={styles.agendamentoDate}>
                        {safeFormat(event.date, "dd 'de' MMM yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <div className={styles.agendamentoRight}>
                      <span className={styles.agendamentoValue}>{formatBRL(event.budget ?? 0)}</span>
                      {finance ? (
                        <select
                          className={`${styles.agendamentoStatus} ${finance.status === 'received' || finance.status === 'paid' ? styles.statusReceived : styles.statusPending}`}
                          value={finance.status}
                          onChange={(e) => handleEventFinanceStatus(finance.id, e.target.value as FinanceStatus)}
                        >
                          <option value="pending">Pendente</option>
                          <option value="paid">Pago</option>
                          <option value="received">Recebido</option>
                        </select>
                      ) : (
                        <span className={styles.agendamentoNoFinance}>—</span>
                      )}
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
              const cats = costFilter === 'fixed' ? sortCategoriesAlpha(FIXED_CATEGORIES)
                : costFilter === 'variable' ? sortCategoriesAlpha(VARIABLE_CATEGORIES)
                  : sortCategoriesAlpha([...FIXED_CATEGORIES, ...VARIABLE_CATEGORIES]);
              const totals = cats
                .map((cat) => ({
                  cat,
                  total: pageMonthFinances.filter((f) => f.type === 'cost' && f.category === cat).reduce((a, f) => a + f.amount, 0),
                }))
                .filter(({ total }) => total > 0);
              const max = totals[0]?.total || 1;
              if (totals.length === 0) return <p className={styles.emptyState}>Nenhuma despesa registrada.</p>;
              return (
                <div className={styles.catList}>
                  {totals.map(({ cat, total }) => (
                    <div key={cat} className={styles.catRow}>
                      <span className={styles.catDot} style={{ background: CATEGORY_COLORS[cat] || '#64748b' }} />
                      <span className={styles.catName}>{CATEGORY_LABELS[cat] || cat}</span>
                      <div className={styles.catBarWrap}>
                        <div className={styles.catBar} style={{ width: `${(total / max) * 100}%`, background: CATEGORY_COLORS[cat] || '#64748b' }} />
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

      {/* ===== TAB: PAINEL MENSAL ===== */}
      {activeTab === 'mensal' && (
        <div className={styles.tabContent}>
          {/* Month selector */}
          <div className={styles.monthSelector}>
            {availableMonths.map((m) => (
              <button
                key={m}
                className={`${styles.monthBtn} ${selectedMonth === m ? styles.monthBtnActive : ''}`}
                onClick={() => setSelectedMonth(m)}
              >
                {formatMonth(m)}
              </button>
            ))}
          </div>

          {/* Monthly summary bar */}
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
              <span className={styles.monthSummaryLabel}>{monthProfit >= 0 ? 'Lucro' : 'Prejuizo'}</span>
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
                value={insumosRatio}
                max={100}
                suffix="%"
                color={insumosRatio <= 30 ? '#4ade80' : insumosRatio <= 45 ? '#fbbf24' : '#f87171'}
              />
            </div>
            <div className={styles.gaugeCard}>
              <GaugeChart
                label="Mao de Obra"
                value={maoObraRatio}
                max={100}
                suffix="%"
                color={maoObraRatio <= 25 ? '#4ade80' : maoObraRatio <= 40 ? '#fbbf24' : '#f87171'}
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
                  onClick={() => setFilterType(type)}
                >
                  {type === 'all' ? 'Todos' : type === 'revenue' ? 'Receitas' : 'Custos'}
                </button>
              ))}
            </div>
            <select
              className={styles.searchInput}
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="all">Todos os meses</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar por descricao, categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className={styles.btnExport} onClick={exportCSV} title="Exportar lancamentos filtrados para CSV">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar CSV
            </button>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>Nenhum lancamento encontrado.</div>
          ) : (
            <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descricao</th>
                  <th>Categoria</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Valor</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map((entry) => (
                  <tr key={entry.id}>
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
                          style={{ background: CATEGORY_COLORS[entry.category] || '#64748b' }}
                        />
                        {CATEGORY_LABELS[entry.category] || entry.category}
                      </span>
                    </td>
                    <td>{safeFormat(entry.date, 'dd/MM/yy', { locale: ptBR })}</td>
                    <td>
                      <select
                        className={`${styles.agendamentoStatus} ${entry.status === 'received' || entry.status === 'paid' ? styles.statusReceived : styles.statusPending}`}
                        value={entry.status}
                        onChange={(e) => handleEventFinanceStatus(entry.id, e.target.value as FinanceStatus)}
                      >
                        <option value="pending">Pendente</option>
                        <option value="paid">Pago</option>
                        <option value="received">Recebido</option>
                      </select>
                    </td>
                    <td>
                      <span className={entry.type === 'revenue' ? styles.typeRevenue : styles.typeCost}>
                        {entry.type === 'revenue' ? '+' : '-'} {formatBRL(entry.amount)}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => deleteFinance(entry.id)}
                        title="Excluir"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
          {filtered.length > 50 && (
            <p className={styles.tableNote}>Mostrando 50 de {filtered.length} lancamentos</p>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title="Novo Lancamento Financeiro" size="lg" onClose={() => setShowForm(false)}>
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
                    className={`${styles.formSelect} ${styles.eventComboInput}`}
                    placeholder="Buscar evento..."
                    value={eventSearch}
                    autoComplete="off"
                    onChange={(e) => {
                      setEventSearch(e.target.value);
                      setFormEventId('');
                      openEventDropdown();
                    }}
                    onFocus={() => openEventDropdown()}
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
                    <div
                      className={styles.eventDropdown}
                      style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
                    >
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
                <label className={styles.formLabel}>Categoria</label>
                <select
                  className={styles.formSelect}
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  {formCategories[formType].map((cat) => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[cat] || cat}</option>
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
                placeholder="Descreva o lancamento"
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
                <label className={styles.formLabel}>Status</label>
                <select
                  className={styles.formSelect}
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as FinanceStatus)}
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="received">Recebido</option>
                </select>
              </div>
            </div>

            <div className={styles.formActions}>
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
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
                      {formCategories.cost.map((cat) => (
                        <option key={cat} value={cat}>{CATEGORY_LABELS[cat] || cat}</option>
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
                  <li>Defina a data e o status (Pendente, Pago ou Recebido).</li>
                  <li>Clique em <strong>Salvar</strong> para confirmar.</li>
                </ol>
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
