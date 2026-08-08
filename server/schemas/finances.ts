import { z } from 'zod';
import { isDateOnly } from '../../shared/financeDates';
import { toCents } from '../../shared/money';

const moneyAmount = z.number().positive('Valor deve ser positivo').refine((value) => {
  try {
    toCents(value);
    return true;
  } catch {
    return false;
  }
}, 'Valor deve ter no máximo duas casas decimais');

export const createFinanceSchema = z.object({
  eventId: z.string().optional().default(''),
  type: z.enum(['revenue', 'cost']),
  category: z.string().min(1, 'Categoria obrigatória').trim(),
  description: z.string().optional().default(''),
  amount: moneyAmount,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve ser YYYY-MM-DD'),
  status: z.enum(['pending', 'paid', 'received']).optional().default('pending'),
  autoEventBudget: z.boolean().optional().default(false),
  origin: z.enum(['event', 'manual', 'factory_order', 'bank_import']).optional(),
  kind: z.enum(['balance', 'deposit', 'travel', 'commission', 'expense', 'manual']).optional(),
  employeeId: z.string().optional(),
  paymentMethod: z.string().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  settledAt: z.string().optional(),
  settledOn: z.string().refine(isDateOnly, 'Data efetiva deve ser YYYY-MM-DD').optional(),
  reason: z.string().max(500).optional(),
  settlementStatus: z.enum(['open', 'partial', 'settled', 'cancelled']).optional(),
  automatic: z.boolean().optional(),
  reversedAt: z.string().optional(),
  reversedBy: z.string().optional(),
  reversalReason: z.string().optional(),
  installmentGroupId: z.string().optional(),
  installmentNumber: z.number().optional(),
  installmentTotal: z.number().optional(),
  recurrenceId: z.string().optional(),
  recurrenceFrequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  recurrenceEndDate: z.string().optional(),
  recurrenceInterval: z.number().int().min(1).max(365).optional(),
  recurrenceTotal: z.number().int().min(1).max(366).optional(),
  externalId: z.string().max(300).optional(),
  importBatchId: z.string().max(100).optional(),
  bankAccount: z.string().max(200).optional(),
  bankStatementBalance: z.number().finite().optional(),
});

// A edição não pode reintroduzir valores default para campos omitidos pelo
// cliente — Zod aplica `.default()` a qualquer campo ausente mesmo dentro de
// `.partial()`, o que faria `eventId`/`autoEventBudget` sempre "aparecerem"
// no corpo (disparando o bloqueio de commandFields em qualquer PUT) e faria
// `status` sempre virar "pending" (reabrindo silenciosamente um lançamento já
// liquidado sempre que só a descrição/valor fosse editado). Removendo o
// default desses campos na edição, "ausente" volta a significar "não alterar".
export const updateFinanceSchema = createFinanceSchema.partial().extend({
  eventId: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'paid', 'received']).optional(),
  autoEventBudget: z.boolean().optional(),
});

export const createSettlementSchema = z.object({
  amount: moneyAmount,
  settledOn: z.string().refine(isDateOnly, 'Data efetiva deve ser YYYY-MM-DD'),
  paymentMethod: z.string().max(100).optional(),
  reason: z.string().max(500).optional(),
  idempotencyKey: z.string().trim().min(8).max(200),
});

const ofxTextSchema = z.string().trim().min(1, 'Arquivo OFX vazio').max(5_000_000, 'Arquivo OFX excede 5 MB');

export const previewOfxSchema = z.object({
  ofxText: ofxTextSchema,
});

export const importOfxSchema = z.object({
  ofxText: ofxTextSchema,
  selections: z.array(z.object({
    externalId: z.string().trim().min(8).max(300),
    category: z.string().trim().min(1).max(100).optional(),
    financeId: z.string().trim().min(1).max(100).optional(),
  })).min(1).max(500),
});
