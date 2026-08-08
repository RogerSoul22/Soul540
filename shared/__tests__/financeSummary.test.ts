import assert from 'node:assert/strict';
import test from 'node:test';
import { buildFinanceSummary } from '../financeSummary';

test('summarizes cash from individual settlements and keeps partial forecasts separate', () => {
  const summary = buildFinanceSummary([
    {
      id: 'event-balance', type: 'revenue', amount: 100, amountCents: 10_000, date: '2026-06-20', eventId: 'event-1', source: 'main',
      settlements: [{ id: 'settlement-1', amountCents: 4_000, settledOn: '2026-07-10', settledAt: '2026-07-10T12:00:00.000Z', paymentMethod: 'pix', idempotencyKey: 'settlement-1' }],
    },
    {
      id: 'manual-open', type: 'revenue', amount: 60, amountCents: 6_000, date: '2026-07-15', source: 'main',
    },
    {
      id: 'expense', type: 'cost', amount: 50, amountCents: 5_000, date: '2026-07-01', source: 'main',
      settlements: [{ id: 'settlement-2', amountCents: 5_000, settledOn: '2026-07-12', settledAt: '2026-07-12T12:00:00.000Z', paymentMethod: 'card', idempotencyKey: 'settlement-2' }],
    },
    {
      id: 'cancelled', type: 'revenue', amount: 90, amountCents: 9_000, date: '2026-07-03', source: 'main', settlementStatus: 'cancelled',
    },
  ], { view: 'cash', start: '2026-07-01', end: '2026-07-31', reportingUnit: 'main' });

  assert.deepEqual(summary, {
    totalIncomeCents: 10_000,
    totalExpenseCents: 5_000,
    realizedIncomeCents: 4_000,
    projectedIncomeCents: 6_000,
    realizedExpenseCents: 5_000,
    projectedExpenseCents: 0,
    openReceivablesCents: 6_000,
    netRealizedCents: -1_000,
    byPaymentMethod: [
      { method: 'pix', amountCents: 4_000, count: 1 },
    ],
    byEvent: [
      { eventId: 'event-1', receivedCents: 4_000, receivableCents: 0, costsCents: 0 },
    ],
    excludedCancelled: 1,
  });
});

test('uses reporting unit by settlement date for Campinas cash consolidation', () => {
  const summary = buildFinanceSummary([{
    id: 'campinas', type: 'revenue', amount: 100, amountCents: 10_000, date: '2026-07-20', source: 'franchise',
    settlements: [{ id: 'settlement-1', amountCents: 10_000, settledOn: '2026-08-03', settledAt: '2026-08-03T12:00:00.000Z', idempotencyKey: 'settlement-1' }],
  }], { view: 'cash', start: '2026-08-01', end: '2026-08-31', reportingUnit: 'main' });

  assert.equal(summary.realizedIncomeCents, 10_000);
});
