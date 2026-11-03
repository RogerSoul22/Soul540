import assert from 'node:assert/strict';
import test from 'node:test';
import { getDashboardEventUnits } from './dashboard.routes';

test('factory dashboard includes main and franchise event sources', () => {
  assert.deepEqual(getDashboardEventUnits({ user: { unit: 'factory', isAdmin: true } }), ['main', 'franchise']);
  assert.deepEqual(getDashboardEventUnits({ user: { unit: 'factory', isAdmin: false } }), ['main', 'franchise']);
});
