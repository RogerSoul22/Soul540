import assert from 'node:assert/strict';
import test from 'node:test';
import * as productionOrders from '../production-orders';

test('creates a pending revenue for a delivered order with commercial value', () => {
  const getProductionOrderFinanceState = (productionOrders as any).getProductionOrderFinanceState as ((order: unknown) => string) | undefined;

  assert.equal(typeof getProductionOrderFinanceState, 'function');
  assert.equal(getProductionOrderFinanceState?.({
    status: 'entregue',
    accountingTreatment: 'internal_transfer',
    commercialValue: 1_000,
  }), 'open');
});

test('does not create financial revenue for a delivered order without commercial value', () => {
  const getProductionOrderFinanceState = (productionOrders as any).getProductionOrderFinanceState as ((order: unknown) => string) | undefined;

  assert.equal(getProductionOrderFinanceState?.({
    status: 'entregue',
    accountingTreatment: 'internal_transfer',
    commercialValue: 0,
  }), 'none');
});

test('creates only an open receivable for an external sale after delivery', () => {
  const getProductionOrderFinanceState = (productionOrders as any).getProductionOrderFinanceState as ((order: unknown) => string) | undefined;

  assert.equal(getProductionOrderFinanceState?.({
    status: 'entregue',
    accountingTreatment: 'external_sale',
    commercialValue: 1_000,
  }), 'open');
});

test('does not synchronize an order forecast that already has a settlement', () => {
  const canSynchronizeOrderForecast = (productionOrders as any).canSynchronizeOrderForecast as ((finance: unknown) => boolean) | undefined;

  assert.equal(typeof canSynchronizeOrderForecast, 'function');
  assert.equal(canSynchronizeOrderForecast?.({
    type: 'revenue',
    amount: 100,
    amountCents: 10_000,
    date: '2026-08-01',
    settlements: [{ id: 's-1', amountCents: 10_000, settledOn: '2026-08-01', settledAt: '2026-08-01T12:00:00.000Z', idempotencyKey: 'one' }],
  }), false);
});
