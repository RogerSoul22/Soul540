import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('does not settle an event balance through the operational close endpoint', () => {
  const source = readFileSync(resolve(process.cwd(), 'server/routes/events.ts'), 'utf8');
  assert.equal(source.includes('markBalanceReceived'), false);
  assert.equal(source.includes('financialCloseStatus'), true);
});

test('reopening the financial workflow only cancels mutable commission forecasts', () => {
  const source = readFileSync(resolve(process.cwd(), 'server/routes/events.ts'), 'utf8');
  assert.equal(source.includes("await cancelMutableAutomaticFinances(found.financeModel, {"), true);
  assert.equal(source.includes("reversalReason: 'Financeiro do evento reaberto'"), false);
});
