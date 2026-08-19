import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pageSource = readFileSync(
  resolve(process.cwd(), 'factory/src/pages/Tarefas/Tarefas/Tarefas.tsx'),
  'utf8',
);

test('requires a commercial value when creating a production order', () => {
  assert.equal(pageSource.includes('Valor de venda (R$)'), true);
  assert.equal(pageSource.includes('commercialValue <= 0'), true);
});

test('allows commercial value to be supplied for delivered legacy orders', () => {
  assert.equal(pageSource.includes('Informar valor de venda'), true);
  assert.equal(pageSource.includes('/api/production-orders/${pricingOrder.id}'), true);
});

test('offers an order selector and sorts order lists by their number', () => {
  assert.equal(pageSource.includes('Localizar pedido'), true);
  assert.equal(pageSource.includes('Todos os pedidos'), true);
  assert.equal(pageSource.includes('selectedOrderId'), true);
  assert.equal(pageSource.includes('sortOrdersByNumber'), true);
});
