import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('keeps a visible recovery state when the frontend bundle fails before React mounts', () => {
  const mainIndex = source('../index.html');
  const franchiseIndex = source('../../franchise/index.html');

  for (const index of [mainIndex, franchiseIndex]) {
    assert.match(index, /id="boot-status"/);
    assert.match(index, /unhandledrejection/);
    assert.match(index, /location\.reload\(\)/);
    assert.match(index, /Não foi possível iniciar o sistema/);
  }
});
