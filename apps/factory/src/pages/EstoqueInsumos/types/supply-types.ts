export type SupplyStatus = 'em_estoque' | 'estoque_baixo' | 'sem_estoque' | 'vencido';

export type Supply = {
  id: string;
  name: string;
  category: string;
  measureUnit: string;
  quantity: number;
  minStock: number;
  costPerUnit: number;
  supplier: string;
  expirationDate?: string;
  status: SupplyStatus;
  createdAt?: string;
};

export type SupplyForm = {
  name: string;
  category: string;
  measureUnit: string;
  quantity: string;
  minStock: string;
  costPerUnit: string;
  supplier: string;
  expirationDate: string;
};

export type XmlImportItem = {
  id: string;
  name: string;
  quantity: number;
  measureUnit: string;
  costPerUnit: number;
  supplier: string;
  expirationDate: string;
  category: string;
  selected: boolean;
};

export const emptySupplyForm: SupplyForm = {
  name: '',
  category: '',
  measureUnit: 'kg',
  quantity: '',
  minStock: '',
  costPerUnit: '',
  supplier: '',
  expirationDate: '',
};

export const statusConfig: Record<SupplyStatus, { label: string; color: 'green' | 'amber' | 'red' | 'gray' }> = {
  em_estoque: { label: 'Em estoque', color: 'green' },
  estoque_baixo: { label: 'Estoque baixo', color: 'amber' },
  sem_estoque: { label: 'Sem estoque', color: 'red' },
  vencido: { label: 'Vencido', color: 'gray' },
};

export function formatCurrency(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const cents = Number.parseInt(digits, 10);
  return 'R$ ' + Math.floor(cents / 100).toLocaleString('pt-BR') + ',' + String(cents % 100).padStart(2, '0');
}

export function parseCurrency(value: string): number {
  return Number(value.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
}

export function calcStatus(qty: number, min: number, expirationDate?: string): SupplyStatus {
  if (expirationDate && new Date(expirationDate) < new Date()) return 'vencido';
  if (qty === 0) return 'sem_estoque';
  if (qty <= min) return 'estoque_baixo';
  return 'em_estoque';
}

function normalizeUnit(unit: string): string {
  const units: Record<string, string> = {
    KG: 'kg',
    G: 'g',
    L: 'L',
    LT: 'L',
    ML: 'ml',
    UN: 'un',
    UNID: 'un',
    CX: 'cx',
    PCT: 'un',
    FD: 'un',
    SC: 'un',
  };
  return units[unit.toUpperCase()] || 'un';
}

function normalizeNfeDate(raw: string): string {
  const value = raw.replace(/-/g, '');
  return value.length === 8 ? value.slice(0, 4) + '-' + value.slice(4, 6) + '-' + value.slice(6, 8) : raw;
}

export function parseNFeXml(xmlText: string) {
  const document = new DOMParser().parseFromString(xmlText, 'application/xml');
  const get = (element: Element | Document, tag: string) => element.querySelector(tag)?.textContent?.trim() || '';
  const supplier = get(document, 'xNome');
  const items = Array.from(document.querySelectorAll('det prod'))
    .map((product) => ({
      name: get(product, 'xProd'),
      quantity: Number.parseFloat(get(product, 'qCom')) || 0,
      measureUnit: normalizeUnit(get(product, 'uCom')),
      costPerUnit: Number.parseFloat(get(product, 'vUnCom')) || 0,
      supplier,
      expirationDate: normalizeNfeDate(get(product, 'dVal')),
    }))
    .filter((item) => item.name);
  return { supplier, items };
}

export function isExpiringSoon(expirationDate?: string): boolean {
  if (!expirationDate) return false;
  const remaining = new Date(expirationDate).getTime() - Date.now();
  return remaining > 0 && remaining < 7 * 24 * 60 * 60 * 1000;
}
