import assert from 'node:assert/strict';
import test from 'node:test';
import { buildManualFinancePayload } from '../../infrastructure/services/financePayloads';
import { createFinanceSchema } from '../../infrastructure/schemas/finances';

const financeInput = {
  type: 'revenue' as const,
  category: 'contrato',
  amount: 100,
  date: '2026-10-25',
  modality: 'feirinha' as const,
};

test('accepts and persists Feirinha modality on manual finance', () => {
  const parsed = createFinanceSchema.parse(financeInput);
  const payload = buildManualFinancePayload(parsed, 'franchise');
  assert.equal(parsed.modality, 'feirinha');
  assert.equal(payload.modality, 'feirinha');
});

test('defaults legacy manual finance to Evento avulso', () => {
  const payload = buildManualFinancePayload({ ...financeInput, modality: undefined }, 'franchise');
  assert.equal(payload.modality, 'evento_avulso');
});
