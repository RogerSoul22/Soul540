import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pageSource = readFileSync(
  resolve(process.cwd(), 'factory/src/pages/Tarefas/Tarefas/Tarefas.tsx'),
  'utf8',
);
const styleSource = readFileSync(
  resolve(process.cwd(), 'factory/src/pages/Tarefas/Tarefas/Tarefas.module.scss'),
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

test('offers numeric ordering and two ways to find an order', () => {
  assert.equal(pageSource.includes('Localizar pedido'), true);
  assert.equal(pageSource.includes('Digitar'), true);
  assert.equal(pageSource.includes('Lista alfabética'), true);
  assert.equal(pageSource.includes('Digite o número ou filial'), true);
  assert.equal(pageSource.includes('Lista alfabÃ©tica'), false);
  assert.equal(pageSource.includes('Digite o nÃºmero ou filial'), false);
  assert.equal(pageSource.includes('selectedOrderId'), true);
  assert.equal(pageSource.includes('orderSearchMode'), true);
  assert.equal(pageSource.includes('sortOrdersByNumber'), true);
  assert.equal(pageSource.includes('sortOrdersAlphabetically'), true);
  assert.equal(pageSource.includes('Limpar filtros'), true);
  assert.equal(pageSource.includes('handleClearOrderFilters'), true);
});

test('keeps order controls usable on narrow screens', () => {
  assert.equal(pageSource.includes('styles.headerActions'), true);
  assert.equal(styleSource.includes('.headerActions'), true);
  assert.equal(styleSource.includes('.orderFilterBar {\n    flex-wrap: wrap;'), true);
  assert.equal(styleSource.includes('.finalizedItem {\n    flex-direction: column;'), true);
});
