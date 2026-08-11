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

test('allows a migration preview to limit plans to selected actions', () => {
  const source = readFileSync(resolve(process.cwd(), 'server/scripts/migrate-finances.ts'), 'utf8');

  assert.equal(source.includes('--actions='), true);
  assert.equal(source.includes('requestedActions'), true);
});

test('finds every legacy received status when running only the status normalization', () => {
  const source = readFileSync(resolve(process.cwd(), 'server/scripts/migrate-finances.ts'), 'utf8');

  assert.equal(source.includes('isStatusOnlyMigration'), true);
  assert.equal(source.includes("{ status: 'received' }"), true);
});

test('does not restrict a status-only migration to the default reporting period', () => {
  const source = readFileSync(resolve(process.cwd(), 'server/scripts/migrate-finances.ts'), 'utf8');

  assert.equal(source.includes("const reconciliationStart = isGlobalMigration ? '' : start;"), true);
  assert.equal(source.includes("const reconciliationEnd = isGlobalMigration ? '\\uffff' : end;"), true);
});

test('finds pending automatic deposits across all dates only for main and franchise', () => {
  const source = readFileSync(resolve(process.cwd(), 'server/scripts/migrate-finances.ts'), 'utf8');

  assert.equal(source.includes('isAutomaticDepositOnlyMigration'), true);
  assert.equal(source.includes("const units: Unit[] = isAutomaticDepositOnlyMigration ? ['main', 'franchise'] : unitsOption();"), true);
  assert.equal(source.includes("const reconciliationStart = isGlobalMigration ? '' : start;"), true);
  assert.equal(source.includes("const reconciliationEnd = isGlobalMigration ? '\\uffff' : end;"), true);
  assert.equal(source.includes("{ kind: 'deposit', automatic: true, status: { $in: ['pending', 'paid'] }, settlementStatus: { $ne: 'cancelled' } }"), true);
});

test('reverts only through the generated artifact and an explicit confirmation', () => {
  const source = readFileSync(resolve(process.cwd(), 'server/scripts/revert-finance-migration.ts'), 'utf8');

  assert.equal(source.includes('--confirm=REVERTER_MIGRACAO_FINANCEIRA'), true);
  assert.equal(source.includes('readFile'), true);
  assert.equal(source.includes('updateOne'), true);
  assert.equal(source.includes('after'), true);
});
