import assert from 'node:assert/strict';
import test from 'node:test';
import { buildBankImportPayload, buildManualFinancePayload, buildSettlementRecord, getClassificationStatusForCategory } from '../../services/financeCommands';
import { resolveFinanceStatusChange } from '../../services/financeCommands';

test('forces generic finance creation to be a manual open forecast', () => {
  const payload = buildManualFinancePayload({
    type: 'revenue',
    category: 'contrato',
    description: 'Tentativa de origem falsa',
    amount: 10.23,
    date: '2026-08-01',
    status: 'received',
    settlementStatus: 'settled',
    origin: 'event',
    kind: 'deposit',
    automatic: true,
    source: 'factory',
  }, 'franchise');

  assert.equal(payload.amountCents, 1023);
  assert.equal(payload.status, 'pending');
  assert.equal(payload.settlementStatus, 'open');
  assert.equal(payload.origin, 'manual');
  assert.equal(payload.kind, 'manual');
  assert.equal(payload.automatic, false);
  assert.equal(payload.source, 'franchise');
  assert.deepEqual(payload.settlements, []);
});

test('builds an immutable settlement with local date and idempotency key', () => {
  const settlement = buildSettlementRecord({
    amount: 25.5,
    settledOn: '2026-07-31',
    paymentMethod: 'pix',
    reason: 'Sinal confirmado no extrato',
    idempotencyKey: 'settlement-123',
  }, 'user-1', '2026-08-01T02:30:00.000Z', 'settlement-id');

  assert.deepEqual(settlement, {
    id: 'settlement-id',
    amountCents: 2550,
    settledOn: '2026-07-31',
    settledAt: '2026-08-01T02:30:00.000Z',
    paymentMethod: 'pix',
    settledBy: 'user-1',
    reason: 'Sinal confirmado no extrato',
    idempotencyKey: 'settlement-123',
  });
});

test('builds unmatched OFX movement as a settled but unclassified bank import', () => {
  const payload = buildBankImportPayload({
    externalId: 'ofx:001:12345:credit-1',
    type: 'revenue',
    amount: 150.5,
    date: '2026-07-15',
    description: 'Sinal evento Ana',
  }, {
    source: 'main',
    bankAccount: '001:12345',
    importBatchId: 'ofx-batch-1',
    settledBy: 'user-1',
    settledAt: '2026-07-15T15:00:00.000Z',
  });

  assert.equal(payload.origin, 'bank_import');
  assert.equal(payload.classificationStatus, 'unclassified');
  assert.equal(payload.settlementStatus, 'settled');
  assert.equal(payload.settlements[0].externalId, 'ofx:001:12345:credit-1');
  assert.equal(payload.settlements[0].settledOn, '2026-07-15');
});

test('preserves an explicit category when importing an unmatched OFX movement', () => {
  const payload = buildBankImportPayload({
    externalId: 'ofx:001:12345:credit-2',
    type: 'revenue',
    amount: 250,
    date: '2026-07-16',
    description: 'Receita identificada',
  }, {
    source: 'main',
    bankAccount: '001:12345',
    importBatchId: 'ofx-batch-1',
    settledBy: 'user-1',
    category: 'contrato',
  });

  assert.equal(payload.category, 'contrato');
  assert.equal(payload.classificationStatus, 'classified');
});

test('derives classification from the server-owned category rule', () => {
  assert.equal(getClassificationStatusForCategory('nao-classificado'), 'unclassified');
  assert.equal(getClassificationStatusForCategory('contrato'), 'classified');
});

test('rejects a settlement with an invalid local date', () => {
  assert.throws(() => buildSettlementRecord({
    amount: 10,
    settledOn: '2026-02-30',
    idempotencyKey: 'settlement-123',
  }, 'user-1'), /Data efetiva inválida/);
});

test('turns a pending-to-received status change into a settlement for the full open amount', () => {
  const command = resolveFinanceStatusChange(
    { type: 'revenue', date: '2026-08-01', amount: 100, amountCents: 10_000, settledCents: 0, settlementStatus: 'open' },
    'received',
    { settledOn: '2026-08-05', paymentMethod: 'pix' },
    'user-1',
  );

  assert.equal(command.kind, 'settle');
  if (command.kind === 'settle') {
    assert.equal(command.settlement.amountCents, 10_000);
    assert.equal(command.settlement.settledOn, '2026-08-05');
    assert.equal(command.settlement.paymentMethod, 'pix');
    assert.equal(command.settlement.settledBy, 'user-1');
  }
});

test('falls back to the entry date when no settlement date is given', () => {
  const command = resolveFinanceStatusChange(
    { type: 'cost', date: '2026-08-02', amount: 50, amountCents: 5_000, settledCents: 0, settlementStatus: 'open' },
    'paid',
    {},
    'user-1',
  );

  assert.equal(command.kind, 'settle');
  if (command.kind === 'settle') assert.equal(command.settlement.settledOn, '2026-08-02');
});

test('reopens a fully settled entry back to pending', () => {
  const command = resolveFinanceStatusChange(
    { type: 'revenue', date: '2026-08-01', amount: 100, amountCents: 10_000, settledCents: 10_000, settlementStatus: 'settled' },
    'pending',
    {},
    'user-1',
  );
  assert.deepEqual(command, { kind: 'reopen' });
});

test('is a no-op when the requested status matches the current one', () => {
  const settled = resolveFinanceStatusChange(
    { type: 'revenue', date: '2026-08-01', amount: 100, amountCents: 10_000, settledCents: 10_000, settlementStatus: 'settled' },
    'received',
    {},
    'user-1',
  );
  assert.deepEqual(settled, { kind: 'noop' });

  const open = resolveFinanceStatusChange(
    { type: 'cost', date: '2026-08-01', amount: 100, amountCents: 10_000, settledCents: 0, settlementStatus: 'open' },
    'pending',
    {},
    'user-1',
  );
  assert.deepEqual(open, { kind: 'noop' });
});

test('rejects a status change on a cancelled entry', () => {
  assert.throws(() => resolveFinanceStatusChange(
    { type: 'revenue', date: '2026-08-01', amount: 100, amountCents: 10_000, settledCents: 0, settlementStatus: 'cancelled' },
    'received',
    {},
    'user-1',
  ), /cancelado/);
});
