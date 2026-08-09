import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateSettlementStatus,
  canChangeForecast,
  getCashCentsForPeriod,
  getDerivedFinanceLabel,
  getFinanceAmountCents,
  getOutstandingCents,
} from '../financePolicy';

const entry = {
  id: 'finance-1',
  type: 'revenue' as const,
  amount: 100,
  amountCents: 10_000,
  date: '2026-06-15',
  settlements: [
    { id: 's-1', amountCents: 3_000, settledOn: '2026-06-30', settledAt: '2026-06-30T15:00:00.000Z', idempotencyKey: 'first' },
    { id: 's-2', amountCents: 7_000, settledOn: '2026-07-02', settledAt: '2026-07-02T15:00:00.000Z', idempotencyKey: 'second' },
  ],
};

test('derives settlement state and remaining balance from immutable settlements', () => {
  assert.equal(calculateSettlementStatus(entry), 'settled');
  assert.equal(getOutstandingCents(entry), 0);
  assert.equal(getDerivedFinanceLabel(entry), 'Liquidado');
});

test('counts each settlement in its own cash month', () => {
  assert.equal(getCashCentsForPeriod(entry, '2026-06-01', '2026-06-30'), 3_000);
  assert.equal(getCashCentsForPeriod(entry, '2026-07-01', '2026-07-31'), 7_000);
});

test('uses neutral labels before settlement and for cancelled entries', () => {
  assert.equal(getDerivedFinanceLabel({ ...entry, settlements: [] }), 'Pendente');
  assert.equal(getDerivedFinanceLabel({ ...entry, settlementStatus: 'cancelled' }), 'Cancelado');
});

test('allows synchronization only for an open forecast with no settlement', () => {
  assert.equal(canChangeForecast({ ...entry, settlements: [] }), true);
  assert.equal(canChangeForecast({ ...entry, settlements: entry.settlements.slice(0, 1) }), false);
  assert.equal(canChangeForecast({ ...entry, settlementStatus: 'cancelled' }), false);
});

test('reads legacy values with excess precision without allowing new writes to use them', () => {
  assert.equal(getFinanceAmountCents({ ...entry, amount: 10.235, amountCents: undefined }), 1024);
});
