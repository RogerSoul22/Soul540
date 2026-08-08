import assert from 'node:assert/strict';
import test from 'node:test';
import { fromCents, toCents } from '../money';

test('converts monetary values to exact integer cents', () => {
  assert.equal(toCents(10.23), 1023);
  assert.equal(toCents('0.1'), 10);
  assert.equal(fromCents(1023), 10.23);
});

test('rejects monetary values with more than two decimal places', () => {
  assert.throws(() => toCents(10.235), /duas casas decimais/);
});
