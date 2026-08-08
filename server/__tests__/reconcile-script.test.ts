import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('keeps the reconciliation CLI read-only', () => {
  const source = readFileSync(resolve(process.cwd(), 'server/scripts/reconcile-finances.ts'), 'utf8');

  assert.equal(source.includes('reconcileFinances'), true);
  assert.equal(/\.(create|save|update|delete|remove|insert)/.test(source), false);
});
