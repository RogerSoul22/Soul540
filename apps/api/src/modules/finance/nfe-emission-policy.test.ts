import assert from 'node:assert/strict';
import test from 'node:test';
import { assertMainNfeScope } from './nfe-emission-policy';

test('allows NF-e emission only in the main system', () => {
  assert.doesNotThrow(() =>
    assertMainNfeScope({
      user: { unit: 'main', isAdmin: true },
      headers: { 'x-system': 'main' },
    }),
  );
});

test('rejects NF-e emission from franchise or factory scope', () => {
  assert.throws(
    () =>
      assertMainNfeScope({
        user: { unit: 'main', isAdmin: true },
        headers: { 'x-system': 'franchise', 'x-franchise-id': '507f1f77bcf86cd799439011' },
      }),
    /somente no sistema principal/,
  );
});
