import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./auth-repository.ts', import.meta.url), 'utf8');

test('the main portal always asks the server who may enter, and never trusts the stored user alone', () => {
  const body = source.slice(source.indexOf('async getCurrentUser'));
  // O servidor é consultado antes de qualquer uso do usuário guardado.
  assert.ok(body.indexOf("apiFetch('/api/auth/me')") < body.indexOf('tokenStorage.getUser'));
  // O usuário guardado só vale sem conexão (status 0); recusa do servidor limpa e volta ao login.
  assert.match(body, /error\.status === 0\) return tokenStorage\.getUser/);
  assert.match(body, /tokenStorage\.clear\(\);\s*return null;/);
});
