import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('serves only the canonical Itu franchise runtime path', () => {
  const app = source('./app.ts');

  assert.match(app, /app\.use\((['"])\/itu\1/);
  assert.match(app, /app\.get\(\[(['"])\/itu\1, \1\/itu\/\*\1\]/);
  assert.doesNotMatch(app, /\/campinas/);
});

test('uses the canonical Itu storage scope in franchise checklist delivery', () => {
  const checklist = source('../../franchise/src/pages/ChecklistEnvio/ChecklistEnvio.tsx');

  assert.match(checklist, /storageScope="itu"/);
  assert.doesNotMatch(checklist, /storageScope="campinas"/);
});
