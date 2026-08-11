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

test('plans normalization of a legacy received status without changing settlement data', () => {
  const plan = buildFinanceMigrationPlan(
    legacyFinance({ amountCents: 10_000, settlements: [{ id: 'settlement-1', amountCents: 10_000, settledOn: '2026-07-12', settledAt: '2026-07-12T14:00:00.000Z', idempotencyKey: 'settlement-1' }] }),
    ['normalize_legacy_status'],
    '2026-08-09T12:00:00.000Z',
  );

  assert.ok(plan);
  assert.deepEqual(plan.actions, ['normalize_legacy_status']);
  assert.deepEqual(plan.filter, { _id: 'finance-1', status: 'received' });
  assert.deepEqual(plan.update.$set, { status: 'paid' });
  assert.equal(plan.before.status, 'received');
});

test('plans settlement only for a pending automatic event deposit without a prior settlement', () => {
  const plan = buildFinanceMigrationPlan(
    legacyFinance({
      amountCents: 10_000,
      status: 'pending',
      settlementStatus: 'open',
      settledAt: undefined,
      settledCents: 0,
      settlements: [],
      kind: 'deposit',
      automatic: true,
    }),
    ['settle_automatic_deposit'],
    '2026-08-11T12:00:00.000Z',
  );

  assert.ok(plan);
  assert.deepEqual(plan.actions, ['settle_automatic_deposit']);
  assert.deepEqual(plan.filter, {
    _id: 'finance-1',
    kind: 'deposit',
    automatic: true,
    status: 'pending',
    amount: 100,
    'settlements.0': { $exists: false },
  });
  assert.deepEqual(plan.update.$set, {
    status: 'paid',
    settlementStatus: 'settled',
    settledCents: 10_000,
    settledAt: '2026-08-11T12:00:00.000Z',
    settlements: [{
      id: 'migration-v1:finance-1:automatic-deposit',
      amountCents: 10_000,
      settledOn: '2026-07-10',
      settledAt: '2026-08-11T12:00:00.000Z',
      idempotencyKey: 'migration-v1:finance-1:automatic-deposit',
      reason: 'Migra\u00e7\u00e3o de sinal autom\u00e1tico',
    }],
  });
});

test('plans a canonical settlement for a paid automatic event deposit without legacy settlement data', () => {
  const plan = buildFinanceMigrationPlan(
    legacyFinance({
      amountCents: 10_000,
      status: 'paid',
      settlementStatus: 'settled',
      settledAt: '2026-07-12T14:00:00.000Z',
      settlements: undefined,
      kind: 'deposit',
      automatic: true,
    }),
    ['settle_automatic_deposit'],
    '2026-08-11T12:00:00.000Z',
  );

  assert.ok(plan);
  assert.deepEqual(plan.filter, {
    _id: 'finance-1',
    kind: 'deposit',
    automatic: true,
    status: 'paid',
    amount: 100,
    'settlements.0': { $exists: false },
  });
  assert.equal(plan.update.$set.status, 'paid');
  assert.equal(plan.update.$set.settlementStatus, 'settled');
  assert.equal(plan.update.$set.settledCents, 10_000);
  assert.equal(plan.update.$set.settledAt, '2026-07-12T14:00:00.000Z');
  assert.equal((plan.update.$set.settlements as Array<{ settledAt: string }>)[0].settledAt, '2026-07-12T14:00:00.000Z');
});

test('plans only amount cents for a settled automatic deposit that already has a canonical settlement', () => {
  const plan = buildFinanceMigrationPlan(
    legacyFinance({
      amountCents: undefined,
      settledCents: 10_000,
      status: 'paid',
      settlementStatus: 'settled',
      kind: 'deposit',
      automatic: true,
      settlements: [{ id: 'settlement-1', amountCents: 10_000, settledOn: '2026-07-10', settledAt: '2026-07-12T14:00:00.000Z', idempotencyKey: 'settlement-1' }],
    }),
    ['settle_automatic_deposit'],
    '2026-08-11T12:00:00.000Z',
  );

  assert.ok(plan);
  assert.deepEqual(plan.actions, ['settle_automatic_deposit']);
  assert.deepEqual(plan.filter, {
    _id: 'finance-1',
    kind: 'deposit',
    automatic: true,
    status: 'paid',
    amount: 100,
    amountCents: { $exists: false },
  });
  assert.deepEqual(plan.update.$set, { amountCents: 10_000 });
});

test('corrects incorrect amount cents for a settled automatic deposit', () => {
  const plan = buildFinanceMigrationPlan(
    legacyFinance({
      amountCents: 9_999,
      settledCents: 10_000,
      status: 'paid',
      settlementStatus: 'settled',
      kind: 'deposit',
      automatic: true,
      settlements: [{ id: 'settlement-1', amountCents: 10_000, settledOn: '2026-07-10', settledAt: '2026-07-12T14:00:00.000Z', idempotencyKey: 'settlement-1' }],
    }),
    ['settle_automatic_deposit'],
    '2026-08-11T12:00:00.000Z',
  );

  assert.ok(plan);
  assert.deepEqual(plan.filter, {
    _id: 'finance-1',
    kind: 'deposit',
    automatic: true,
    status: 'paid',
    amount: 100,
    amountCents: 9_999,
  });
  assert.deepEqual(plan.update.$set, { amountCents: 10_000 });
});

test('does not settle an automatic deposit with a fraction of a cent', () => {
  const plan = buildFinanceMigrationPlan(
    legacyFinance({
      amount: 10.235,
      amountCents: 1_024,
      status: 'pending',
      settlementStatus: 'open',
      settledAt: undefined,
      kind: 'deposit',
      automatic: true,
      settlements: [],
    }),
    ['settle_automatic_deposit', 'review_amount_precision'],
    '2026-08-11T12:00:00.000Z',
  );

  assert.equal(plan, null);
});

test('does not plan a migration for a manual deposit', () => {
  const plan = buildFinanceMigrationPlan(
    legacyFinance({
      amountCents: 10_000,
      status: 'pending',
      settlementStatus: 'open',
      kind: 'deposit',
      automatic: false,
      settlements: [],
    }),
    ['settle_automatic_deposit'],
    '2026-08-11T12:00:00.000Z',
  );

  assert.equal(plan, null);
});
