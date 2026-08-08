import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const financeRoute = readFileSync(new URL('../finances.ts', import.meta.url), 'utf8');

test('exposes server-side OFX preview and import routes', () => {
  assert.match(financeRoute, /router\.post\('\/ofx\/preview'/);
  assert.match(financeRoute, /router\.post\('\/ofx\/import'/);
  assert.match(financeRoute, /parseOfxTransactions/);
  assert.match(financeRoute, /buildOfxSuggestions/);
});
