import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeEventUpdatePayload, shouldSyncEventFinances } from './events.modalities';

test('does not create automatic finance for a recurring Feirinha template', () => {
  assert.equal(shouldSyncEventFinances({ isRecurringTemplate: true }), false);
  assert.equal(shouldSyncEventFinances({ isRecurringTemplate: false }), true);
  assert.equal(shouldSyncEventFinances({}), true);
});

test('keeps an individual Feirinha occurrence out of the recurring template when cancelling it', () => {
  const updated = normalizeEventUpdatePayload(
    { status: 'cancelled', modality: 'feirinha', isRecurringTemplate: true },
    { recurrenceId: 'template-123' },
  );

  assert.equal(updated.status, 'cancelled');
  assert.equal(updated.isRecurringTemplate, false);
  assert.equal(updated.recurrenceId, 'template-123');
});
