import assert from 'node:assert/strict';
import test from 'node:test';
import { getEventUnitsForLookup } from './events.finance';

test('factory users resolve the main and franchise event sources', () => {
  assert.deepEqual(getEventUnitsForLookup({ user: { isAdmin: true, unit: 'factory' } }), ['main', 'franchise']);
  assert.deepEqual(getEventUnitsForLookup({ user: { isAdmin: true, unit: 'factory' } }, 'franchise'), ['franchise']);
});

test('regular users can only resolve their own event source', () => {
  assert.deepEqual(getEventUnitsForLookup({ user: { isAdmin: false, unit: 'factory' } }), ['main', 'franchise']);
  assert.deepEqual(getEventUnitsForLookup({ user: { isAdmin: false, unit: 'franchise' } }), ['franchise']);
});
