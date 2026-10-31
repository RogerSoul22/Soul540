import assert from 'node:assert/strict';
import test from 'node:test';
import { getEventUnitsForLookup } from './events.finance';

test('factory administrator can resolve combined event sources', () => {
  assert.deepEqual(getEventUnitsForLookup({ user: { isAdmin: true, unit: 'factory' } }), [
    'factory',
    'franchise',
    'main',
  ]);
  assert.deepEqual(getEventUnitsForLookup({ user: { isAdmin: true, unit: 'factory' } }, 'franchise'), ['franchise']);
});

test('regular users can only resolve their own event source', () => {
  assert.deepEqual(getEventUnitsForLookup({ user: { isAdmin: false, unit: 'factory' } }), ['factory']);
  assert.deepEqual(getEventUnitsForLookup({ user: { isAdmin: false, unit: 'franchise' } }), ['franchise']);
});
