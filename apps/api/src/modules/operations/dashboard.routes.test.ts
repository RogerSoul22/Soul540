import assert from 'node:assert/strict';
import test from 'node:test';
import { getDashboardEventUnits } from './dashboard.routes';

test('factory administrator dashboard uses the franchise event source', () => {
  assert.deepEqual(getDashboardEventUnits({ user: { unit: 'factory', isAdmin: true } }), ['franchise']);
});

test('regular factory dashboard uses the franchise event source', () => {
  assert.deepEqual(getDashboardEventUnits({ user: { unit: 'factory', isAdmin: false } }), ['franchise']);
});
