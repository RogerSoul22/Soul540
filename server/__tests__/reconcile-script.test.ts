import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('keeps the reconciliation CLI read-only', () => {
  const source = readFileSync(resolve(process.cwd(), 'server/scripts/reconcile-finances.ts'), 'utf8');

  assert.equal(source.includes('reconcileFinances'), true);
  assert.equal(/\.(create|save|update|delete|remove|insert)/.test(source), false);
});

test('requires an explicit confirmation, backup reference and rollback artifact for migration writes', () => {
  const source = readFileSync(resolve(process.cwd(), 'server/scripts/migrate-finances.ts'), 'utf8');

  assert.equal(source.includes('--confirm=APLICAR_MIGRACAO_FINANCEIRA'), true);
  assert.equal(source.includes('--backup='), true);
  assert.equal(source.includes('--rollback='), true);
  assert.equal(source.includes('updateOne'), true);
});

test('reverts only through the generated artifact and an explicit confirmation', () => {
  const source = readFileSync(resolve(process.cwd(), 'server/scripts/revert-finance-migration.ts'), 'utf8');

  assert.equal(source.includes('--confirm=REVERTER_MIGRACAO_FINANCEIRA'), true);
  assert.equal(source.includes('readFile'), true);
  assert.equal(source.includes('updateOne'), true);
  assert.equal(source.includes('after'), true);
});
