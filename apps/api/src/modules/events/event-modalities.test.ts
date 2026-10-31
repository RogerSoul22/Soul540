import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldSyncEventFinances } from './events.modalities';

test('does not create automatic finance for a recurring Feirinha template', () => {
  assert.equal(shouldSyncEventFinances({ isRecurringTemplate: true }), false);
  assert.equal(shouldSyncEventFinances({ isRecurringTemplate: false }), true);
  assert.equal(shouldSyncEventFinances({}), true);
});
