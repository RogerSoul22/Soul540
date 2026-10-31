import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('renders active franchise cards without accessing the franchise system', () => {
  const card = source('./components/PortalCard.tsx');
  const page = source('./Franquias.tsx');

  assert.doesNotMatch(card, /usePortalController|createPortalClient/);
  assert.doesNotMatch(card, /Sistema inacessível|controller\.online|controller\.stats/);
  assert.match(card, /status: FranchiseStatus/);
  assert.match(card, /Status da franquia/);
  assert.match(page, /status=\{franchise\.status\}/);
});
