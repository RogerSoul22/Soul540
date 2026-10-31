import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('carrega páginas do portal da franquia sob demanda', () => {
  const app = source('./App.tsx');

  assert.match(app, /import\s*\{\s*lazy\s*,\s*Suspense\s*\}\s*from ['"]react['"]/);
  assert.match(app, /const Financeiro = lazy\(\(\) => import\(/);
  assert.match(app, /const Contratos = lazy\(\(\) => import\(/);
  assert.match(app, /<Suspense fallback=\{<AppLoading \/>\}>/);
  assert.doesNotMatch(app, /import Financeiro from ['"]\.\/pages\/Financeiro\/Financeiro['"]/);
  assert.doesNotMatch(app, /import Contratos from ['"]\.\/pages\/Contratos\/Contratos['"]/);
});
