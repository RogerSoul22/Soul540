import { calculateSettlementStatus, getFinanceAmountCents, type FinancePolicyEntry } from '../../shared/financePolicy';
import { toCents } from '../../shared/money';

export type OfxTransaction = {
  externalId: string;
  type: 'revenue' | 'cost';
  amount: number;
  date: string;
  description: string;
};

export type OfxParseResult = {
  bankAccount: string;
  statementBalance?: number;
  transactions: OfxTransaction[];
};

export type OfxSuggestion = OfxTransaction & {
  decision: 'duplicate' | 'link' | 'ambiguous' | 'create_unclassified';
  financeId?: string;
};

type FinanceCandidate = FinancePolicyEntry & {
  id?: string;
  _id?: { toString(): string } | string;
  externalId?: string;
};

function readTag(source: string, tag: string): string {
  const match = source.match(new RegExp(`<${tag}[^>]*>\\s*([^<\\r\\n]+)`, 'i'));
  return match?.[1]?.trim() || '';
}

function parseAmount(value: string): number | undefined {
  const amount = Number(value.replace(',', '.'));
  if (!Number.isFinite(amount) || amount === 0) return undefined;
  try {
    toCents(Math.abs(amount));
    return Math.abs(amount);
  } catch {
    return undefined;
  }
}

function parseDate(value: string): string | undefined {
  if (!/^\d{8}/.test(value)) return undefined;
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function getCandidateId(candidate: FinanceCandidate): string | undefined {
  if (candidate.id) return candidate.id;
  if (typeof candidate._id === 'string') return candidate._id;
  return candidate._id?.toString();
}

function daysBetween(left: string, right: string): number {
  const leftTime = Date.parse(`${left}T00:00:00.000Z`);
  const rightTime = Date.parse(`${right}T00:00:00.000Z`);
  return Math.abs(leftTime - rightTime) / 86_400_000;
}

export function parseOfxTransactions(ofxText: string): OfxParseResult {
  const bankId = readTag(ofxText, 'BANKID') || readTag(ofxText, 'ORG') || 'banco';
  const accountId = readTag(ofxText, 'ACCTID') || 'conta';
  const balance = parseAmount(readTag(ofxText, 'BALAMT'));
  const bankAccount = `${bankId}:${accountId}`;
  const blocks = ofxText.match(/<STMTTRN\b[^>]*>[\s\S]*?(?=<\/STMTTRN>|<STMTTRN\b|<LEDGERBAL\b|<BANKTRANLIST\b|$)/gi) || [];
  const transactions = blocks.flatMap((block, index) => {
    const rawAmount = readTag(block, 'TRNAMT');
    const amount = parseAmount(rawAmount);
    const date = parseDate(readTag(block, 'DTPOSTED'));
    if (!amount || !date) return [];

    const fitId = readTag(block, 'FITID') || `${date}-${rawAmount}-${index}`;
    const description = readTag(block, 'MEMO') || readTag(block, 'NAME') || readTag(block, 'TRNTYPE') || 'Movimento bancário';
    return [{
      externalId: `ofx:${bankId}:${accountId}:${fitId}`.slice(0, 300),
      type: Number(rawAmount.replace(',', '.')) >= 0 ? 'revenue' as const : 'cost' as const,
      amount,
      date,
      description,
    }];
  });

  if (!transactions.length) throw new Error('Nenhum movimento bancário válido foi encontrado no OFX');
  return { bankAccount, statementBalance: balance, transactions };
}

export function buildOfxSuggestions(transactions: OfxTransaction[], finances: FinanceCandidate[]): OfxSuggestion[] {
  return transactions.map((transaction) => {
    const duplicate = finances.find((finance) => (
      finance.externalId === transaction.externalId
      || finance.settlements?.some((settlement) => settlement.externalId === transaction.externalId)
    ));
    if (duplicate) return { ...transaction, decision: 'duplicate', financeId: getCandidateId(duplicate) };

    const amountCents = toCents(transaction.amount);
    const matches = finances.filter((finance) => (
      finance.type === transaction.type
      && calculateSettlementStatus(finance) === 'open'
      && getFinanceAmountCents(finance) === amountCents
      && daysBetween(finance.date, transaction.date) <= 7
    ));
    if (matches.length === 1) return { ...transaction, decision: 'link', financeId: getCandidateId(matches[0]) };
    if (matches.length > 1) return { ...transaction, decision: 'ambiguous' };
    return { ...transaction, decision: 'create_unclassified' };
  });
}
