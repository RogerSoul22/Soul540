import assert from 'node:assert/strict';
import test from 'node:test';
import { buildFinanceMigrationPlan } from '../financeMigration';

const legacyFinance = (overrides: Record<string, unknown> = {}) => ({
  id: 'finance-1',
  type: 'revenue' as const,
  amount: 100,
  date: '2026-07-10',
  status: 'received' as const,
  settlementStatus: 'settled' as const,
  settledAt: '2026-07-12T14:00:00.000Z',
  ...overrides,
});

test('plans a canonical cents and legacy-settlement migration without writing', () => {
  const plan = buildFinanceMigrationPlan(
    legacyFinance(),
    ['add_amount_cents', 'migrate_legacy_settlement'],
    '2026-08-09T12:00:00.000Z',
  );

  assert.ok(plan);
  assert.deepEqual(plan.actions, ['add_amount_cents', 'migrate_legacy_settlement']);
  assert.equal(plan.update.$set.amountCents, 10_000);
  assert.equal(plan.update.$set.settledCents, 10_000);
  assert.equal(plan.update.$set.settlementStatus, 'settled');
  assert.deepEqual(plan.filter, { _id: 'finance-1', settlements: { $exists: false } });
  assert.deepEqual(plan.update.$set.settlements, [{
    id: 'migration-v1:finance-1:legacy-settlement',
    amountCents: 10_000,
    settledOn: '2026-07-12',
    settledAt: '2026-07-12T14:00:00.000Z',
    idempotencyKey: 'migration-v1:finance-1:legacy-settlement',
    reason: 'Migração de baixa legada',
  }]);
  assert.equal(plan.before.amountCents, undefined);
  assert.equal(plan.before.settlements, undefined);
});

test('does not plan an automatic migration for values with a fraction of a cent', () => {
  const plan = buildFinanceMigrationPlan(
    legacyFinance({ amount: 10.235, status: 'pending', settlementStatus: 'open', settledAt: undefined }),
    ['add_amount_cents', 'review_amount_precision'],
    '2026-08-09T12:00:00.000Z',
  );

  assert.equal(plan, null);
});

test('does not overwrite an existing settlement while backfilling cents', () => {
  const plan = buildFinanceMigrationPlan(
    legacyFinance({ settlements: [{ id: 'settlement-1', amountCents: 10_000, settledOn: '2026-07-12', settledAt: '2026-07-12T14:00:00.000Z', idempotencyKey: 'settlement-1' }] }),
    ['add_amount_cents'],
    '2026-08-09T12:00:00.000Z',
  );

  assert.ok(plan);
  assert.deepEqual(plan.filter, { _id: 'finance-1' });
  assert.deepEqual(plan.update.$set, { amountCents: 10_000 });
});
