import assert from 'node:assert/strict';
import test from 'node:test';
import { getJwtSecret } from './jwt-secret';

const originalSecret = process.env.JWT_SECRET;

test.afterEach(() => {
  if (originalSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalSecret;
});

test('rejects a missing JWT_SECRET', () => {
  delete process.env.JWT_SECRET;
  assert.throws(() => getJwtSecret(), /JWT_SECRET/);
});

test('rejects a weak JWT_SECRET', () => {
  process.env.JWT_SECRET = 'short-secret';
  assert.throws(() => getJwtSecret(), /32/);
});

test('returns a configured JWT_SECRET', () => {
  process.env.JWT_SECRET = 'a'.repeat(32);
  assert.equal(getJwtSecret(), 'a'.repeat(32));
});
