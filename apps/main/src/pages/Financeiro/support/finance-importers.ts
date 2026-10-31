import type { FinanceType } from '../../../../../../packages/contracts/src/index';
import { getNfeEmissionDate as formatNFeDate } from '../../../../../../packages/domain/src/index';

export type FinanceXmlItem = {
  id: string;
  name: string;
  totalValue: number;
  quantity: number;
  measureUnit: string;
  unitValue: number;
  category: string;
  selected: boolean;
};

export type FinanceOfxItem = {
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

type ParsedOfxItem = Omit<FinanceOfxItem, 'id' | 'category' | 'selected' | 'decision' | 'financeId'>;
type ParsedXmlItem = Omit<FinanceXmlItem, 'id' | 'selected' | 'category'>;

export function parseLegacyOfxText(ofxText: string): {
  bankAccount: string;
  balance?: number;
  items: ParsedOfxItem[];
} {
  const value = (source: string, tag: string) => {
    const match = source.match(new RegExp(`<${tag}[^>]*>\\s*([^<\\r\\n]+)`, 'i'));
    return match?.[1]?.trim() ?? '';
  };
  const bankId = value(ofxText, 'BANKID') || value(ofxText, 'ORG') || 'banco';
  const accountId = value(ofxText, 'ACCTID') || 'conta';
  const bankAccount = `${bankId} - ${accountId}`;
  const balanceRaw = value(ofxText, 'BALAMT');
  const transactionBlocks =
    ofxText.match(/<STMTTRN\b[^>]*>[\s\S]*?(?=<\/STMTTRN>|<STMTTRN\b|<LEDGERBAL\b|<BANKTRANLIST\b|$)/gi) ?? [];
  const items = transactionBlocks
    .map((block, index) => {
      const amount = Number(value(block, 'TRNAMT').replace(',', '.'));
      const rawDate = value(block, 'DTPOSTED');
      const fitId = value(block, 'FITID') || `${rawDate}-${amount}-${index}`;
      const description =
        value(block, 'MEMO') || value(block, 'NAME') || value(block, 'TRNTYPE') || 'Movimento bancário';
      return {
        externalId: `ofx:${bankId}:${accountId}:${fitId}`.slice(0, 300),
        description,
        date: /^\d{8}/.test(rawDate) ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}` : '',
        amount: Math.abs(amount),
        type: amount >= 0 ? ('revenue' as const) : ('cost' as const),
      };
    })
    .filter((item) => item.date && Number.isFinite(item.amount) && item.amount > 0);
  if (!items.length) throw new Error('Nenhum movimento bancário encontrado');
  return {
    bankAccount,
    balance: balanceRaw ? Number(balanceRaw.replace(',', '.')) : undefined,
    items,
  };
}

export function parseNFeXmlForFinance(xmlText: string): {
  supplier: string;
  date: string;
  items: ParsedXmlItem[];
} {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  const get = (el: Element | Document, tag: string) => el.querySelector(tag)?.textContent?.trim() ?? '';
  const supplier = get(doc, 'emit xNome') || get(doc, 'xNome');
  const rawDate = get(doc, 'dhEmi') || get(doc, 'dEmi');
  const date = formatNFeDate(rawDate);
  const items = Array.from(doc.querySelectorAll('det prod'))
    .map((prod) => {
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
    })
    .filter((item) => item.name && item.totalValue > 0);
  return { supplier, date, items };
}
