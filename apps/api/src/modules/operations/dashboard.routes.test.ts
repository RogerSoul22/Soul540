import assert from 'node:assert/strict';
import test from 'node:test';
import { getDashboardEventUnits } from './dashboard.routes';

test('factory administrator dashboard includes all event sources', () => {
  assert.deepEqual(getDashboardEventUnits({ user: { unit: 'factory', isAdmin: true } }), [
    'main',
    'franchise',
    'factory',
  ]);
});

test('regular factory dashboard remains limited to factory events', () => {
  assert.deepEqual(getDashboardEventUnits({ user: { unit: 'factory', isAdmin: false } }), ['factory']);
});
