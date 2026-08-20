import assert from 'node:assert/strict';
import test from 'node:test';
import * as productionOrders from '../production-orders';

test('creates a financial entry for a delivered order with production cost', () => {
  const getProductionOrderFinanceState = (productionOrders as any).getProductionOrderFinanceState as ((order: unknown) => string) | undefined;

  assert.equal(typeof getProductionOrderFinanceState, 'function');
  assert.equal(getProductionOrderFinanceState?.({
    status: 'entregue',
    totalCost: 1_000,
  }), 'open');
});

test('does not create a financial entry before the order is delivered', () => {
  const getProductionOrderFinanceState = (productionOrders as any).getProductionOrderFinanceState as ((order: unknown) => string) | undefined;

  assert.equal(getProductionOrderFinanceState?.({
    status: 'a_preparar',
    totalCost: 1_000,
    commercialValue: 1_000,
  }), 'none');
});

test('does not create a financial entry for a delivered order without production cost', () => {
  const getProductionOrderFinanceState = (productionOrders as any).getProductionOrderFinanceState as ((order: unknown) => string) | undefined;

  assert.equal(getProductionOrderFinanceState?.({
    status: 'entregue',
    totalCost: 0,
    commercialValue: 1_000,
  }), 'none');
});

test('uses production cost regardless of the previous accounting treatment', () => {
  const getProductionOrderFinanceState = (productionOrders as any).getProductionOrderFinanceState as ((order: unknown) => string) | undefined;

  assert.equal(getProductionOrderFinanceState?.({
    status: 'entregue',
    accountingTreatment: 'external_sale',
    totalCost: 1_000,
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
