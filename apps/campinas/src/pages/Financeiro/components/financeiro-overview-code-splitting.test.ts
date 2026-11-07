import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('carrega os gráficos financeiros somente quando a aba geral é renderizada', () => {
  const overview = source('./FinanceiroOverviewTab.tsx');

  assert.match(overview, /import\s*\{\s*lazy\s*,\s*Suspense\s*\}\s*from ['"]react['"]/);
  assert.match(overview, /lazy\(\(\) => import\(['"]\.\/FinanceiroOverviewCharts['"]\)\)/);
  assert.match(overview, /<Suspense fallback=\{null\}>/);
  assert.doesNotMatch(overview, /import FinanceiroOverviewCharts from/);
});
