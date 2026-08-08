import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCommissionAmount, calculateEventFinanceAmounts, eventCancellationRequiresDecision, syncEventFinances } from '../events';

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

test('creates an event deposit as an open receivable until it is explicitly settled', async () => {
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
    budget: 1_000,
    depositValue: 300,
    constructor: { findByIdAndUpdate: async () => undefined },
  };

  await syncEventFinances(event, financeModel as any, 'main');

  const deposit = created.find((entry) => entry.kind === 'deposit');
  assert.equal(deposit.status, 'pending');
  assert.equal(deposit.settlementStatus, 'open');
  assert.equal(deposit.settledAt, undefined);
  assert.equal(deposit.dueDate, undefined);
});

test('deletes never-settled automatic finances when an event is cancelled', async () => {
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

  await syncEventFinances({
    _id: 'event-2',
    id: 'event-2',
    status: 'cancelled',
    constructor: { findByIdAndUpdate: async () => undefined },
  }, financeModel as any, 'main');

  assert.equal(deletedQueries.length, 1);
  assert.deepEqual(deletedQueries[0], { _id: { $in: ['f-1'] }, settledCents: { $not: { $gt: 0 } } });
});

test('soft-cancels a legacy settled finance entry that predates the settledCents field', async () => {
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

  await syncEventFinances({
    _id: 'event-2',
    id: 'event-2',
    status: 'cancelled',
    constructor: { findByIdAndUpdate: async () => undefined },
  }, financeModel as any, 'main');

  assert.equal(deletedQueries.length, 0);
  assert.equal(updatedQueries.length, 1);
  assert.deepEqual(updatedQueries[0].query, { _id: { $in: ['f-legacy'] } });
  assert.deepEqual(updatedQueries[0].update, {
    $set: { settlementStatus: 'cancelled', reversalReason: 'Evento cancelado' },
  });
});

test('keeps already-settled automatic finances marked as cancelled instead of deleting them', async () => {
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

  await syncEventFinances({
    _id: 'event-2',
    id: 'event-2',
    status: 'cancelled',
    constructor: { findByIdAndUpdate: async () => undefined },
  }, financeModel as any, 'main');

  assert.equal(deletedQueries.length, 0);
  assert.equal(updatedQueries.length, 1);
  assert.deepEqual(updatedQueries[0].query, { _id: { $in: ['f-2'] } });
  assert.deepEqual(updatedQueries[0].update, {
    $set: { settlementStatus: 'cancelled', reversalReason: 'Evento cancelado' },
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
