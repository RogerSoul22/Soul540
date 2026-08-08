import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const financeRoute = readFileSync(new URL('../finances.ts', import.meta.url), 'utf8');

test('builds API summaries through the shared cash and reporting-unit policy', () => {
  assert.match(financeRoute, /buildFinanceSummary/);
  assert.match(financeRoute, /req\.query\.view/);
  assert.match(financeRoute, /reportingUnit/);
});
