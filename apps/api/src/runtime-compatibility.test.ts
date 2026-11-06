import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('serves only the canonical Campinas franchise runtime path', () => {
  const app = source('./app.ts');

  assert.match(app, /app\.use\((['"])\/campinas\1/);
  assert.match(app, /app\.get\(\[(['"])\/campinas\1, \1\/campinas\/\*\1\]/);
  assert.doesNotMatch(app, /\/itu/);
});

test('derives the franchise checklist storage scope from the current slug instead of a fixed tenant', () => {
  const checklist = source('../../franchise/src/pages/ChecklistEnvio/ChecklistEnvio.tsx');

  assert.match(checklist, /storageScope=\{slug\}/);
  assert.doesNotMatch(checklist, /storageScope="campinas"/);
  assert.doesNotMatch(checklist, /storageScope="itu"/);
});
