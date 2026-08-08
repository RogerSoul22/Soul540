import assert from 'node:assert/strict';
import test from 'node:test';
import { getFinanceReportingAllocations, getReportingUnit } from '../reportingUnitPolicy';

test('keeps Campinas in its origin unit before the consolidation cutoff', () => {
  assert.equal(getReportingUnit('franchise', '2026-07-31'), 'franchise');
});

test('consolidates Campinas in Sorocaba from August by the date used in each view', () => {
  const entry = {
    type: 'revenue' as const,
    amount: 100,
    amountCents: 10_000,
    date: '2026-07-20',
    source: 'franchise',
    settlements: [{
      id: 'settlement-1', amountCents: 10_000, settledOn: '2026-08-03',
      settledAt: '2026-08-03T12:00:00.000Z', idempotencyKey: 'settlement-1',
    }],
  };

  assert.deepEqual(getFinanceReportingAllocations(entry, 'competence'), [
    { source: 'franchise', reportingUnit: 'franchise', date: '2026-07-20', amountCents: 10_000 },
  ]);
  assert.deepEqual(getFinanceReportingAllocations(entry, 'cash'), [
    { source: 'franchise', reportingUnit: 'main', date: '2026-08-03', amountCents: 10_000 },
  ]);
});

test('does not reassign factory allocations or cancelled finances', () => {
  assert.equal(getReportingUnit('factory', '2026-08-03'), 'factory');
  assert.deepEqual(getFinanceReportingAllocations({
    type: 'cost', amount: 10, date: '2026-08-03', source: 'franchise', settlementStatus: 'cancelled',
  }, 'cash'), []);
});
