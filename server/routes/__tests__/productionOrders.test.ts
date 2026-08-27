import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import * as productionOrders from '../production-orders';

const productionOrdersRouteSource = readFileSync(
  resolve(process.cwd(), 'server/routes/production-orders.ts'),
  'utf8',
);

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

test('builds a pending revenue forecast for a delivered factory order', () => {
  const buildProductionOrderFinanceForecast = (productionOrders as any).buildProductionOrderFinanceForecast as ((order: unknown) => Record<string, unknown>) | undefined;

  assert.equal(typeof buildProductionOrderFinanceForecast, 'function');
  assert.deepEqual(buildProductionOrderFinanceForecast?.({
    id: 'order-1',
    orderNumber: 101,
    filial: 'Sorocaba',
    totalCost: 1_250.5,
    createdAt: '2026-08-25T15:00:00.000Z',
  }), {
    eventId: 'production-order:factory:order-1',
    type: 'revenue',
    category: 'ingredientes',
    description: 'Pedido #101 - Sorocaba',
    amount: 1_250.5,
    amountCents: 125_050,
    date: '2026-08-25',
    status: 'pending',
    settlementStatus: 'open',
    settledCents: 0,
    settlements: [],
    autoEventBudget: false,
    automatic: true,
    origin: 'factory_order',
    kind: 'manual',
    source: 'factory',
  });
});

test('rounds production costs with fractions of a cent for the financial forecast', () => {
  const buildProductionOrderFinanceForecast = (productionOrders as any).buildProductionOrderFinanceForecast as ((order: unknown) => Record<string, unknown>) | undefined;

  assert.deepEqual(buildProductionOrderFinanceForecast?.({
    id: 'order-fraction',
    orderNumber: 102,
    filial: 'Sorocaba',
    totalCost: 69.9992,
    createdAt: '2026-08-25T15:00:00.000Z',
  }), {
    eventId: 'production-order:factory:order-fraction',
    type: 'revenue',
    category: 'ingredientes',
    description: 'Pedido #102 - Sorocaba',
    amount: 70,
    amountCents: 7_000,
    date: '2026-08-25',
    status: 'pending',
    settlementStatus: 'open',
    settledCents: 0,
    settlements: [],
    autoEventBudget: false,
    automatic: true,
    origin: 'factory_order',
    kind: 'manual',
    source: 'factory',
  });
});

test('exposes an endpoint to reconcile factory order forecasts', () => {
  assert.equal(productionOrdersRouteSource.includes("router.post('/reconcile-finances'"), true);
});
