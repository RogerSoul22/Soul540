import assert from 'node:assert/strict';
import test from 'node:test';
import { buildManualFinancePayload } from '../../infrastructure/services/financePayloads';
import { createFinanceSchema } from '../../infrastructure/schemas/finances';
import { calculateSettlementStatus } from '../../../../../shared/finance/financePolicy';

const input = {
  type: 'cost' as const,
  category: 'aluguel',
  amount: 123.45,
  date: '2026-11-05',
  paymentMethod: 'pix',
};

test('manual finance marked paid is created with a full settlement', () => {
  const parsed = createFinanceSchema.parse({ ...input, status: 'paid' });
  const payload = buildManualFinancePayload(parsed, 'franchise', 'user-123');

  assert.equal(payload.status, 'paid');
  assert.equal(payload.settlementStatus, 'settled');
  assert.equal(payload.amountCents, 12345);
  assert.equal(payload.settledCents, 12345);
  assert.equal(payload.settlements.length, 1);
  assert.equal(payload.settlements[0].amountCents, 12345);
  assert.equal(payload.settlements[0].settledOn, input.date);
  assert.equal(payload.settlements[0].paymentMethod, 'pix');
  assert.equal(payload.settlements[0].settledBy, 'user-123');
  assert.equal(calculateSettlementStatus(payload), 'settled');
});

test('manual finance marked pending has no settlement', () => {
  const parsed = createFinanceSchema.parse({ ...input, status: 'pending' });
  const payload = buildManualFinancePayload(parsed, 'factory', 'user-123');

  assert.equal(payload.status, 'pending');
  assert.equal(payload.settlementStatus, 'open');
  assert.equal(payload.settledCents, 0);
  assert.equal(payload.settlements.length, 0);
  assert.equal(calculateSettlementStatus(payload), 'open');
});
