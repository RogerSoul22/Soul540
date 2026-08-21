import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { resolve } from 'node:path';
import { calculateCommissionAmount, calculateEventFinanceAmounts, canSyncAutomaticCommission, eventCancellationRequiresDecision, hasMaterialFinancialChange, syncEventCommissions, syncEventFinances } from '../events';

const eventRouteSource = readFileSync(
  resolve(process.cwd(), 'server/routes/events.ts'),
  'utf8',
);

test('separates deposit, balance and travel without double counting revenue', () => {
  const result = calculateEventFinanceAmounts({
    budget: 9500,
    depositValue: 2000,
    travelCost: 500,
  });

  assert.equal(result.targetRevenue, 9500);
  assert.equal(result.deposit, 2000);
  assert.equal(result.balance, 7500);
  assert.equal(result.travel, 500);
  assert.equal(result.deposit + result.balance, result.targetRevenue);
});

test('uses final value as the receivable target when it exists', () => {
  const result = calculateEventFinanceAmounts({
    budget: 9500,
    finalValue: 10000,
    depositValue: 3000,
  });

  assert.equal(result.targetRevenue, 10000);
  assert.equal(result.balance, 7000);
});

test('does not elevate the contracted revenue when deposit exceeds the estimate', () => {
  const result = calculateEventFinanceAmounts({ budget: 1000, depositValue: 1500 });
  assert.equal(result.targetRevenue, 1000);
  assert.equal(result.balance, 0);
});

test('calculates employee commission with currency rounding and safe limits', () => {
  assert.equal(calculateCommissionAmount(9500, 10), 950);
  assert.equal(calculateCommissionAmount(3333.33, 7.5), 250);
  assert.equal(calculateCommissionAmount(1000, -5), 0);
});

test('creates an event deposit as paid with a settlement on its recorded date', async () => {
  const created: any[] = [];
  const financeModel = {
    findOne: async () => null,
    create: async (payload: any) => {
      created.push(payload);
      return payload;
    },
    find: () => ({ sort: async () => [] }),
  };
  const event = {
    _id: 'event-1',
    id: 'event-1',
    name: 'Evento teste',
    date: '2026-07-10',
    depositDate: '2026-07-02',
    budget: 1_000,
    depositValue: 300,
    constructor: { findByIdAndUpdate: async () => undefined },
  };

  await syncEventFinances(event, financeModel as any, 'main');

  const deposit = created.find((entry) => entry.kind === 'deposit');
  assert.equal(deposit.status, 'paid');
  assert.equal(deposit.settlementStatus, 'settled');
  assert.equal(deposit.settledCents, 30_000);
  assert.equal(deposit.settlements.length, 1);
  assert.equal(deposit.settlements[0].amountCents, 30_000);
  assert.equal(deposit.settlements[0].settledOn, '2026-07-02');
  assert.equal(deposit.settlements[0].idempotencyKey, 'event-deposit:event-1');
  assert.equal(typeof deposit.settledAt, 'string');
  assert.equal(deposit.dueDate, undefined);

  const balance = created.find((entry) => entry.kind === 'balance');
  assert.equal(balance.status, 'pending');
  assert.equal(balance.settlementStatus, 'open');
  assert.deepEqual(balance.settlements, []);
});

test('does not rewrite an already settled event deposit during synchronization', async () => {
  const created: any[] = [];
  const updated: Array<{ id: string; payload: unknown }> = [];
  const settledDeposit = {
    _id: 'deposit-1',
    amount: 300,
    toJSON: () => ({
      type: 'revenue' as const,
      amount: 300,
      amountCents: 30_000,
      date: '2026-07-02',
      settlements: [{ id: 'settlement-1', amountCents: 30_000, settledOn: '2026-07-02', settledAt: '2026-07-02T12:00:00.000Z', idempotencyKey: 'event-deposit:event-1' }],
    }),
  };
  const financeModel = {
    findOne: async (query: { kind?: string }) => query.kind === 'deposit' ? settledDeposit : null,
    create: async (payload: any) => { created.push(payload); return payload; },
    findByIdAndUpdate: async (id: string, payload: unknown) => { updated.push({ id, payload }); },
    find: () => ({ sort: async () => [] }),
  };
  const event = {
    _id: 'event-1',
    id: 'event-1',
    name: 'Evento teste',
    date: '2026-07-10',
    depositDate: '2026-07-02',
    budget: 1_000,
    depositValue: 300,
    constructor: { findByIdAndUpdate: async () => undefined },
  };

  await syncEventFinances(event, financeModel as any, 'main');

  assert.equal(created.some((entry) => entry.kind === 'deposit'), false);
  assert.equal(updated.some((entry) => entry.id === 'deposit-1'), false);
});

test('deletes automatic finances when an event is cancelled', async () => {
  const deletedQueries: unknown[] = [];
  const updatedQueries: Array<{ query: unknown; update: unknown }> = [];
  const openEntries = [
    { _id: 'f-1', eventId: 'event-2', automatic: true, settlements: [], settledCents: 0 },
  ];
  const financeModel = {
    find: () => ({ lean: async () => openEntries }),
    deleteMany: async (query: unknown) => { deletedQueries.push(query); },
    updateMany: async (query: unknown, update: unknown) => { updatedQueries.push({ query, update }); },
    findOne: async () => null,
    create: async () => undefined,
  };

  const result = await syncEventFinances({
    _id: 'event-2',
    id: 'event-2',
    status: 'cancelled',
    constructor: { findByIdAndUpdate: async () => undefined },
  }, financeModel as any, 'main');

  assert.equal(updatedQueries.length, 0);
  assert.equal(deletedQueries.length, 1);
  assert.deepEqual(deletedQueries[0], { _id: { $in: ['f-1'] } });
  assert.deepEqual(result, { cancelledCount: 1, requiresDecision: false });
});

test('also deletes a legacy finance entry when the event is cancelled', async () => {
  const deletedQueries: unknown[] = [];
  const updatedQueries: Array<{ query: unknown; update: unknown }> = [];
  const legacyEntries = [
    {
      _id: 'f-legacy',
      eventId: 'event-2',
      automatic: true,
      type: 'revenue',
      amount: 100,
      date: '2026-07-01',
      status: 'received',
    },
  ];
  const financeModel = {
    find: () => ({ lean: async () => legacyEntries }),
    deleteMany: async (query: unknown) => { deletedQueries.push(query); },
    updateMany: async (query: unknown, update: unknown) => { updatedQueries.push({ query, update }); },
    findOne: async () => null,
    create: async () => undefined,
  };

  const result = await syncEventFinances({
    _id: 'event-2',
    id: 'event-2',
    status: 'cancelled',
    constructor: { findByIdAndUpdate: async () => undefined },
  }, financeModel as any, 'main');

  assert.equal(updatedQueries.length, 0);
  assert.equal(deletedQueries.length, 1);
  assert.deepEqual(deletedQueries[0], { _id: { $in: ['f-legacy'] } });
  assert.deepEqual(result, { cancelledCount: 1, requiresDecision: false });
});

test('deletes an already-settled automatic finance entry when the event is cancelled', async () => {
  const deletedQueries: unknown[] = [];
  const updatedQueries: Array<{ query: unknown; update: unknown }> = [];
  const settledEntries = [
    { _id: 'f-2', eventId: 'event-2', automatic: true, settlements: [{ id: 's-1', amountCents: 5_000 }], settledCents: 5_000 },
  ];
  const financeModel = {
    find: () => ({ lean: async () => settledEntries }),
    deleteMany: async (query: unknown) => { deletedQueries.push(query); },
    updateMany: async (query: unknown, update: unknown) => { updatedQueries.push({ query, update }); },
    findOne: async () => null,
    create: async () => undefined,
  };

  const result = await syncEventFinances({
    _id: 'event-2',
    id: 'event-2',
    status: 'cancelled',
    constructor: { findByIdAndUpdate: async () => undefined },
  }, financeModel as any, 'main');

  assert.equal(updatedQueries.length, 0);
  assert.equal(deletedQueries.length, 1);
  assert.deepEqual(deletedQueries[0], { _id: { $in: ['f-2'] } });
  assert.deepEqual(result, { cancelledCount: 1, requiresDecision: false });
});

test('cancels only mutable automatic commissions when employees are removed', async () => {
  const updates: Array<{ query: unknown; update: unknown }> = [];
  const commissions = [
    { _id: 'commission-open', amount: 100, amountCents: 10_000, settlements: [] },
    {
      _id: 'commission-settled',
      amount: 100,
      amountCents: 10_000,
      settlements: [{ id: 'settlement-1', amountCents: 10_000, settledOn: '2026-07-01', settledAt: '2026-07-01T12:00:00.000Z', idempotencyKey: 'settlement-1' }],
    },
  ];
  const financeModel = {
    find: () => ({ lean: async () => commissions }),
    updateMany: async (query: unknown, update: unknown) => { updates.push({ query, update }); },
  };

  await syncEventCommissions({ _id: 'event-commission', id: 'event-commission' }, financeModel as any, 'main');

  assert.equal(updates.length, 1);
  assert.deepEqual(updates[0].query, { _id: { $in: ['commission-open'] } });
  const update = updates[0].update as { $set: Record<string, unknown> };
  assert.equal(update.$set.settlementStatus, 'cancelled');
  assert.equal(update.$set.reversalReason, 'Equipe removida do evento');
});

test('does not overwrite a settled automatic commission during synchronization', () => {
  assert.equal(canSyncAutomaticCommission(null), true);
  assert.equal(canSyncAutomaticCommission({ amount: 100, amountCents: 10_000, settlements: [] }), true);
  assert.equal(canSyncAutomaticCommission({
    amount: 100,
    amountCents: 10_000,
    settlements: [{ id: 'settlement-1', amountCents: 10_000, settledOn: '2026-07-01', settledAt: '2026-07-01T12:00:00.000Z', idempotencyKey: 'settlement-1' }],
  }), false);
});

test('requires an adjustment flow only when an event financial value truly changes', () => {
  const event = { budget: 1_000, depositValue: 300, paymentMethod: 'pix' };
  assert.equal(hasMaterialFinancialChange(event, { budget: 1_000 }, ['budget', 'depositValue']), false);
  assert.equal(hasMaterialFinancialChange(event, { budget: 1_100 }, ['budget', 'depositValue']), true);
  assert.equal(hasMaterialFinancialChange(event, { paymentMethod: 'card' }, ['paymentMethod']), true);
});

test('allows changing the final value when only the event deposit is settled', () => {
  const settledDeposit = {
    kind: 'deposit',
    type: 'revenue',
    amount: 300,
    amountCents: 30_000,
    date: '2026-07-01',
    settlements: [{ id: 'settlement-1', amountCents: 30_000, settledOn: '2026-07-01', settledAt: '2026-07-01T12:00:00.000Z', idempotencyKey: 'deposit-1' }],
  };

  assert.equal(eventCancellationRequiresDecision([settledDeposit], ['finalValue']), false);
});

test('identifies a settled balance affected by a final-value change', () => {
  const settledBalance = {
    kind: 'balance',
    type: 'revenue',
    amount: 700,
    amountCents: 70_000,
    date: '2026-07-10',
    settlements: [{ id: 'settlement-2', amountCents: 70_000, settledOn: '2026-07-10', settledAt: '2026-07-10T12:00:00.000Z', idempotencyKey: 'balance-1' }],
  };

  assert.equal(eventCancellationRequiresDecision([settledBalance], ['finalValue']), true);
});

test('allows direct editing of event values after a financial settlement', () => {
  assert.equal(eventRouteSource.includes('Registre um ajuste financeiro aprovado antes de alterar valores de um evento com baixa financeira'), false);
});

test('excludes already-cancelled linked entries from the cancelled-event cleanup query', async () => {
  const findQueries: unknown[] = [];
  const financeModel = {
    find: (query: unknown) => { findQueries.push(query); return { lean: async () => [] }; },
    deleteMany: async () => undefined,
    updateMany: async () => undefined,
    findOne: async () => null,
    create: async () => undefined,
  };

  await syncEventFinances({
    _id: 'event-2',
    id: 'event-2',
    status: 'cancelled',
    constructor: { findByIdAndUpdate: async () => undefined },
  }, financeModel as any, 'main');

  assert.equal(findQueries.length, 1);
  assert.deepEqual(findQueries[0], {
    eventId: 'event-2',
    $or: [{ automatic: true }, { autoEventBudget: true }],
    settlementStatus: { $ne: 'cancelled' },
  });
});

test('uses the deposit date field as the deposit finance entry date when set', async () => {
  const created: any[] = [];
  const financeModel = {
    findOne: async () => null,
    create: async (payload: any) => { created.push(payload); return payload; },
    find: () => ({ sort: async () => [] }),
  };
  const event = {
    _id: 'event-3',
    id: 'event-3',
    name: 'Evento com data de sinal',
    date: '2026-07-10',
    depositDate: '2026-06-20',
    budget: 1_000,
    depositValue: 300,
    constructor: { findByIdAndUpdate: async () => undefined },
  };

  await syncEventFinances(event, financeModel as any, 'main');

  const deposit = created.find((entry) => entry.kind === 'deposit');
  assert.equal(deposit.date, '2026-06-20');
});

test('falls back to the event date when no deposit date is set', async () => {
  const created: any[] = [];
  const financeModel = {
    findOne: async () => null,
    create: async (payload: any) => { created.push(payload); return payload; },
    find: () => ({ sort: async () => [] }),
  };
  const event = {
    _id: 'event-4',
    id: 'event-4',
    name: 'Evento sem data de sinal',
    date: '2026-07-10',
    budget: 1_000,
    depositValue: 300,
    constructor: { findByIdAndUpdate: async () => undefined },
  };

  await syncEventFinances(event, financeModel as any, 'main');

  const deposit = created.find((entry) => entry.kind === 'deposit');
  assert.equal(deposit.date, '2026-07-10');
});

test('requires a refund, fee or approved adjustment decision before cancelling a settled event', () => {
  assert.equal(eventCancellationRequiresDecision([
    { type: 'revenue', amount: 100, amountCents: 10_000, date: '2026-07-01', settlements: [] },
  ]), false);
  assert.equal(eventCancellationRequiresDecision([
    {
      type: 'revenue',
      amount: 100,
      amountCents: 10_000,
      date: '2026-07-01',
      settlements: [{ id: 's-1', amountCents: 10_000, settledOn: '2026-07-01', settledAt: '2026-07-01T12:00:00.000Z', idempotencyKey: 'one' }],
    },
  ]), true);
});
