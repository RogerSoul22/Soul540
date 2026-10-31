import assert from 'node:assert/strict';
import test from 'node:test';
import { SecretCipher } from './secret-cipher';

const KEY = 'a'.repeat(64);

test('encrypts and decrypts a secret with authenticated context', () => {
  process.env.ENCRYPTION_KEY = KEY;
  const cipher = new SecretCipher();
  const payload = cipher.encrypt('senha-segura', 'main:pfx');

  assert.equal(cipher.decrypt(payload, 'main:pfx'), 'senha-segura');
  assert.match(payload, /^v1:[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/);
});

test('uses a different IV for each encryption', () => {
  process.env.ENCRYPTION_KEY = KEY;
  const cipher = new SecretCipher();

  assert.notEqual(cipher.encrypt('mesmo-valor', 'main:pfx'), cipher.encrypt('mesmo-valor', 'main:pfx'));
});

test('rejects a payload opened with another context', () => {
  process.env.ENCRYPTION_KEY = KEY;
  const cipher = new SecretCipher();
  const payload = cipher.encrypt('segredo', 'main:pfx');

  assert.throws(() => cipher.decrypt(payload, 'franchise:pfx'), /não foi possível descriptografar/);
});

test('rejects malformed payloads', () => {
  process.env.ENCRYPTION_KEY = KEY;
  const cipher = new SecretCipher();

  assert.throws(() => cipher.decrypt('v1:invalid', 'main:pfx'), /formato inválido/);
});

test('rejects an invalid encryption key', () => {
  process.env.ENCRYPTION_KEY = 'short-key';

  assert.throws(() => new SecretCipher(), /ENCRYPTION_KEY deve ter 64 caracteres hexadecimais/);
});
