import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const accountPages = [
  'src/frontend/pages/Usuario/Usuario.tsx',
  'franchise/src/pages/MinhaConta/MinhaConta.tsx',
  'factory/src/pages/MinhaConta/MinhaConta.tsx',
  'franchise/src/pages/Permissoes/Permissoes.tsx',
];

test('does not keep plaintext password fields in account pages', () => {
  for (const page of accountPages) {
    const source = readFileSync(resolve(process.cwd(), page), 'utf8');
    assert.equal(source.includes('passwordPlain'), false, page);
  }
});

