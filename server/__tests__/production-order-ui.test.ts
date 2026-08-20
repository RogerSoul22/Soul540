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
const routeSource = readFileSync(
  resolve(process.cwd(), 'server/routes/production-orders.ts'),
  'utf8',
);

test('keeps the appointment link separate from sales price', () => {
  assert.equal(pageSource.includes('Valor de venda (R$)'), false);
  assert.equal(pageSource.includes('Informar valor de venda'), false);
  assert.equal(pageSource.includes('Agendamento vinculado'), true);
  assert.equal(pageSource.includes('/api/production-orders/available-events'), true);
  assert.equal(routeSource.includes("router.get('/available-events'"), true);
  assert.equal(routeSource.includes('commercialValue'), false);
  assert.equal(routeSource.includes('eventSource'), true);
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

test('keeps finalized orders in a bounded scrollable list', () => {
  assert.equal(styleSource.includes('max-height: 480px;'), true);
  assert.equal(styleSource.includes('overflow-y: auto;'), true);
});

test('keeps the finalized list focused on the production cost', () => {
  assert.equal(pageSource.includes('Custo: R$'), true);
  assert.equal(pageSource.includes('Venda: R$'), false);
});
