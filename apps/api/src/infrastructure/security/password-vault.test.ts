import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { decryptPassword, encryptPassword } from './password-vault';

process.env.JWT_SECRET = 'a'.repeat(40);

test('encrypts a password so it is not readable and decrypts it back', () => {
  const stored = encryptPassword('Soul@2026#');
  assert.equal(stored.includes('Soul'), false);
  assert.equal(decryptPassword(stored), 'Soul@2026#');
});

test('each encryption is different, even for the same password', () => {
  assert.notEqual(encryptPassword('abc12345'), encryptPassword('abc12345'));
});

test('returns null for missing, tampered or foreign values instead of throwing', () => {
  assert.equal(decryptPassword(undefined), null);
  assert.equal(decryptPassword(''), null);
  assert.equal(decryptPassword('lixo.sem.formato'), null);
  const stored = encryptPassword('abc12345');
  const [iv, tag, data] = stored.split('.');
  assert.equal(decryptPassword([iv, tag, Buffer.from('adulterado').toString('base64')].join('.')), null);
  process.env.PASSWORD_VAULT_KEY = 'outra-chave-totalmente-diferente-123456';
  assert.equal(decryptPassword(stored), null);
  assert.equal(data.length > 0, true);
  delete process.env.PASSWORD_VAULT_KEY;
});

test('the vault field never comes out of user queries by default and is audited on view', () => {
  const model = readFileSync(new URL('../../modules/identity/auth.routes.ts', import.meta.url), 'utf8');
  assert.match(model, /passwordVault: \{ type: String, select: false \}/);
  const account = readFileSync(new URL('../../modules/identity/account-password.routes.ts', import.meta.url), 'utf8');
  assert.match(account, /Visualizou a própria senha/);
  assert.match(account, /Cache-Control', 'no-store'/);
});
