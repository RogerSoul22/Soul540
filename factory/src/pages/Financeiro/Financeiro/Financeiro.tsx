import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import type { FinanceEntry } from '@shared/types';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DreSection, RecurrenceFrequency } from '@shared/types';
import {
  FIXED_CATEGORIES, VARIABLE_CATEGORIES, CATEGORY_LABELS as BUILTIN_CATEGORY_LABELS, CATEGORY_COLORS as BUILTIN_CATEGORY_COLORS,
  DRE_SECTIONS, groupCategoriesBySection,
} from '@shared/financeCategories';
import type { CategoryDef } from '@shared/financeCategories';
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

export default function Financeiro() {
  const { events, finances, financeCategories, addFinance, updateFinance, deleteFinance, reverseFinance, addFinanceCategory } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('geral');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().substring(0, 7));
  const [costFilter, setCostFilter] = useState<CostFilter>('all');
  const [pageMonth, setPageMonth] = useState<string>('all');

  // Table filters
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Form state
  const [formType, setFormType] = useState<FinanceType>('cost');
  const [formEventId, setFormEventId] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState<FinanceStatus>('pending');
  const [formPaymentMethod, setFormPaymentMethod] = useState('');

  // Parcelamento
  const [formInstallments, setFormInstallments] = useState('1');

  // Recorrência
  const [formRecurring, setFormRecurring] = useState(false);
  const [formRecurrenceFrequency, setFormRecurrenceFrequency] = useState<RecurrenceFrequency>('monthly');
  const [formRecurrenceEndDate, setFormRecurrenceEndDate] = useState('');

  // Nova categoria personalizada
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [newCategorySection, setNewCategorySection] = useState<DreSection>('despesas-administrativas');
  const [savingCategory, setSavingCategory] = useState(false);

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

  // Carteira: saldo calculado automaticamente a partir de TODOS os lançamentos
  // já liquidados (receitas recebidas − custos pagos), independente do filtro de mês.
  const walletBalance = useMemo(() => {
    const received = finances.filter((f) => f.type === 'revenue' && f.status === 'received').reduce((acc, f) => acc + f.amount, 0);
    const paid = finances.filter((f) => f.type === 'cost' && f.status === 'paid').reduce((acc, f) => acc + f.amount, 0);
    return received - paid;
  }, [finances]);

  // Faturamento (tudo que foi vendido/contratado, mesmo pendente) x Recebido x Saldo em Aberto
  const faturamentoTotal = totalRevenue;
  const faturamentoRecebido = useMemo(
    () => pageMonthFinances.filter((f) => f.type === 'revenue' && f.status === 'received').reduce((acc, f) => acc + f.amount, 0),
    [pageMonthFinances],
  );
  const saldoEmAberto = faturamentoTotal - faturamentoRecebido;

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
        label: categoryLabels[cat] || cat,
        value: val,
        color: categoryColors[cat] || '#64748b',
      }))
      .sort((a, b) => compareAlpha(a.label, b.label));
  }, [monthFinances, categoryLabels, categoryColors]);

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
      .sort((a, b) => compareAlpha(a.label, b.label));
  }, [monthFinances, categoryLabels, categoryColors]);

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
      if (!f.date) return false;
      if (useCustomRange) {
        if (filterDateFrom && f.date < filterDateFrom) return false;
        if (filterDateTo && f.date > filterDateTo) return false;
      } else if (filterMonth !== 'all' && !f.date.startsWith(filterMonth)) {
        return false;
      }
      if (filterType !== 'all' && f.type !== filterType) return false;
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
    }).sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  }, [finances, filterType, filterMonth, useCustomRange, filterDateFrom, filterDateTo, search, events]);

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
      .filter(({ finance }) => ['paid', 'received'].includes(finance?.status ?? ''))
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
        categoryLabels[f.category] || f.category,
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

  // Exporta\u00E7\u00E3o no padr\u00E3o do arquivo "DRE 2026 - SOUL PIZZA.xlsx": meses em coluna,
  // categorias agrupadas por se\u00E7\u00E3o do DRE, totais por se\u00E7\u00E3o e linhas de resultado.
  const exportDRE = () => {
    if (availableMonths.length === 0) {
      alert('Nenhum lan\u00E7amento financeiro para exportar.');
      return;
    }
    const months = availableMonths;
    const fmt = (v: number) => v.toFixed(2).replace('.', ',');
    const monthAmount = (categoryKey: string, type: FinanceType, month: string) =>
      finances
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
    rows.push(['( = ) Receita L\u00EDquida Operacional', ...receitaLiquida.map(fmt), fmt(receitaLiquida.reduce((a, b) => a + b, 0))]);

    const custosOperacionais = sectionTotalsByMonth['custos-operacionais'];
    const despesasLogistica = sectionTotalsByMonth['despesas-logistica'];
    const totalCustos = custosOperacionais.map((v, i) => v + despesasLogistica[i]);
    rows.push(['Total Custos', ...totalCustos.map(fmt), fmt(totalCustos.reduce((a, b) => a + b, 0))]);

    const lucroBruto = receitaLiquida.map((v, i) => v - totalCustos[i]);
    rows.push(['( = ) Lucro Bruto / Margem de Contribui\u00E7\u00E3o', ...lucroBruto.map(fmt), fmt(lucroBruto.reduce((a, b) => a + b, 0))]);

    const despesasAdm = sectionTotalsByMonth['despesas-administrativas'];
    const despesasCom = sectionTotalsByMonth['despesas-comerciais'];
    const despesasFin = sectionTotalsByMonth['despesas-financeiras'];
    const totalDespesas = despesasAdm.map((v, i) => v + despesasCom[i] + despesasFin[i]);
    rows.push(['Total Despesas Adm/Comerciais/Financeiras', ...totalDespesas.map(fmt), fmt(totalDespesas.reduce((a, b) => a + b, 0))]);

    const lucroLiquidoOp = lucroBruto.map((v, i) => v - totalDespesas[i]);
    rows.push(['( = ) Lucro L\u00EDquido Operacional', ...lucroLiquidoOp.map(fmt), fmt(lucroLiquidoOp.reduce((a, b) => a + b, 0))]);

    let acumulado = 0;
    const resultadoAcumulado = lucroLiquidoOp.map((v) => { acumulado += v; return acumulado; });
    rows.push(['( = ) Resultado L\u00EDquido Acumulado', ...resultadoAcumulado.map(fmt), '']);

    const receitasNaoOperacionais = sectionTotalsByMonth['receitas-nao-operacionais'];
    const outrasSaidas = sectionTotalsByMonth['outras-saidas'];
    const resultadoFinal = lucroLiquidoOp.map((v, i) => v + receitasNaoOperacionais[i] - outrasSaidas[i]);
    rows.push(['( = ) Resultado Ap\u00F3s Empr\u00E9stimos/Investimentos', ...resultadoFinal.map(fmt), fmt(resultadoFinal.reduce((a, b) => a + b, 0))]);

    const csv = rows.map((r) => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dre-fabrica-${months[0]}_a_${months[months.length - 1]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormType('revenue');
    setFormEventId('');
    setEventSearch('');
    setFormCategory('');
    setFormDescription('');
    setFormAmount('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormStatus('pending');
    setFormPaymentMethod('');
    setFormInstallments('1');
    setFormRecurring(false);
    setFormRecurrenceFrequency('monthly');
    setFormRecurrenceEndDate('');
  };

  const handleEdit = (entry: FinanceEntry) => {
    setEditingId(entry.id);
    setFormType(entry.type);
    setFormEventId(entry.eventId || '');
    setEventSearch(events.find((e) => e.id === entry.eventId)?.name || '');
    setFormCategory(entry.category);
    setFormDescription(entry.description || '');
    setFormAmount(formatCurrency(String(Math.round(entry.amount * 100))));
    setFormDate(entry.date);
    setFormStatus(entry.status);
    setFormPaymentMethod(entry.paymentMethod || '');
    setFormInstallments('1');
    setFormRecurring(false);
    setShowForm(true);
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
      status: formStatus,
      paymentMethod: formPaymentMethod || undefined,
    };

    if (editingId) {
      await updateFinance(editingId, base);
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
          status: i === 0 ? formStatus : 'pending',
          installmentGroupId: groupId,
          installmentNumber: i + 1,
          installmentTotal: installments,
        });
      }
    } else if (formRecurring) {
      const recurrenceId = `rec-${Date.now()}`;
      const endDate = formRecurrenceEndDate || addMonths(formDate, 11);
      let current = formDate;
      let i = 0;
      while (current <= endDate && i < 60) {
        await addFinance({
          ...base,
          date: current,
          status: i === 0 ? formStatus : 'pending',
          recurrenceId,
          recurrenceFrequency: formRecurrenceFrequency,
          recurrenceEndDate: endDate,
        });
        i++;
        current = formRecurrenceFrequency === 'weekly' ? addDays(current, 7)
          : formRecurrenceFrequency === 'yearly' ? addMonths(current, 12)
          : addMonths(current, 1);
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
          <input ref={xmlInputRef} type="file" accept=".xml" style={{ display: 'none' }} onChange={handleXmlFile} />
          <button className={styles.btnXml} onClick={() => xmlInputRef.current?.click()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="12" y2="12"/><line x1="15" y1="15" x2="12" y2="12"/></svg>
            Importar XML
          </button>
          <Button onClick={() => { resetForm(); setShowForm(true); }}>+ Novo Lancamento</Button>
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

          {/* Carteira + Faturamento x Saldo em Aberto */}
          <div className={styles.walletGrid}>
            <div className={styles.agendamentosCard}>
              <div className={styles.agendamentosHeader}>
                <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Carteira</h3>
              </div>
              <div className={styles.summaryItem} style={{ padding: '4px 0' }}>
                <span className={styles.summaryItemLabel}>Saldo disponível</span>
                <span className={`${styles.summaryItemValue} ${walletBalance >= 0 ? styles.green : styles.red}`} style={{ fontSize: 28 }}>
                  {formatBRL(walletBalance)}
                </span>
              </div>
              <p className={styles.agendamentosEmpty} style={{ marginTop: 4 }}>
                Receitas já recebidas menos custos já pagos (todos os lançamentos, não só o mês filtrado).
              </p>
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
              const cats = costFilter === 'fixed' ? [...FIXED_CATEGORIES]
                : costFilter === 'variable' ? [...VARIABLE_CATEGORIES]
                  : [...FIXED_CATEGORIES, ...VARIABLE_CATEGORIES];
              const totals = cats
                .map((cat) => ({
                  cat,
                  total: pageMonthFinances.filter((f) => f.type === 'cost' && f.category === cat).reduce((a, f) => a + f.amount, 0),
                }))
                .filter(({ total }) => total > 0)
                .sort((a, b) => compareAlpha(categoryLabels[a.cat] || a.cat, categoryLabels[b.cat] || b.cat));
              const max = totals[0]?.total || 1;
              if (totals.length === 0) return <p className={styles.emptyState}>Nenhuma despesa registrada.</p>;
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

      {/* ===== TAB: PAINEL MENSAL ===== */}
      {activeTab === 'mensal' && (
        <div className={styles.tabContent}>
          {/* Month selector */}
          <div className={styles.monthSelector}>
            <label className={styles.monthSelectLabel} htmlFor="finance-month-select">Período</label>
            <select
              id="finance-month-select"
              className={styles.monthSelect}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={availableMonths.length === 0}
            >
              {availableMonths.length === 0 && <option value={selectedMonth}>Nenhum período disponível</option>}
              {availableMonths.map((m) => <option key={m} value={m}>{formatMonth(m)}</option>)}
            </select>
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
            <div className={styles.filterGroup}>
              <button
                className={`${styles.filterBtn} ${!useCustomRange ? styles.filterBtnActive : ''}`}
                onClick={() => setUseCustomRange(false)}
              >
                Mês
              </button>
              <button
                className={`${styles.filterBtn} ${useCustomRange ? styles.filterBtnActive : ''}`}
                onClick={() => setUseCustomRange(true)}
              >
                Período
              </button>
            </div>
            {!useCustomRange ? (
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
            ) : (
              <>
                <input
                  type="date"
                  className={styles.searchInput}
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  title="Data inicial"
                />
                <input
                  type="date"
                  className={styles.searchInput}
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  title="Data final"
                />
              </>
            )}
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
            <button className={styles.btnExport} onClick={exportDRE} title="Exportar no padrão DRE (mensal, por seção)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Exportar DRE
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
                          style={{ background: categoryColors[entry.category] || '#64748b' }}
                        />
                        {categoryLabels[entry.category] || entry.category}
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
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleEdit(entry)}
                          title={entry.automatic ? 'Altere pelo registro de origem' : 'Editar'}
                          disabled={entry.automatic}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          onClick={() => deleteFinance(entry.id)}
                          title={entry.automatic ? 'Altere pelo registro de origem' : 'Excluir'}
                          disabled={entry.automatic}
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
            <p className={styles.tableNote}>Mostrando 50 de {filtered.length} lancamentos</p>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title={editingId ? 'Editar Lancamento Financeiro' : 'Novo Lancamento Financeiro'} size="lg" onClose={() => { resetForm(); setShowForm(false); }}>
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

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Forma de pagamento</label>
                <select className={styles.formSelect} value={formPaymentMethod} onChange={(e) => setFormPaymentMethod(e.target.value)}>
                  <option value="">Nao informada</option>
                  <option value="pix">Pix</option>
                  <option value="money">Dinheiro</option>
                  <option value="debit">Cartao de debito</option>
                  <option value="credit">Cartao de credito</option>
                  <option value="transfer">Transferencia</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            </div>

            {!editingId && (
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
                    <label className={styles.formLabel}>
                      <span>
                        <input
                          type="checkbox"
                          checked={formRecurring}
                          onChange={(e) => { setFormRecurring(e.target.checked); if (e.target.checked) setFormInstallments('1'); }}
                          disabled={Number(formInstallments) > 1}
                          style={{ marginRight: 6 }}
                        />
                        Lançamento recorrente
                      </span>
                    </label>
                    {formRecurring && (
                      <div className={styles.formRow} style={{ marginTop: 6 }}>
                        <select
                          className={styles.formSelect}
                          value={formRecurrenceFrequency}
                          onChange={(e) => setFormRecurrenceFrequency(e.target.value as RecurrenceFrequency)}
                        >
                          <option value="monthly">Mensal</option>
                          <option value="weekly">Semanal</option>
                          <option value="yearly">Anual</option>
                        </select>
                        <input
                          type="date"
                          className={styles.formInput}
                          value={formRecurrenceEndDate}
                          onChange={(e) => setFormRecurrenceEndDate(e.target.value)}
                          title="Repetir até (opcional, padrão 12 ocorrências)"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className={styles.formActions}>
              <Button variant="secondary" type="button" onClick={() => { resetForm(); setShowForm(false); }}>
                Cancelar
              </Button>
              <Button type="submit">{editingId ? 'Salvar Alterações' : 'Salvar'}</Button>
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
