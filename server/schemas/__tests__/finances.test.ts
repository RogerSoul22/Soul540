import assert from 'node:assert/strict';
import test from 'node:test';
import { updateFinanceSchema } from '../finances';

test('omitting eventId from an update does not reintroduce it via schema defaults', () => {
  const result = updateFinanceSchema.safeParse({ status: 'received' });
  assert.equal(result.success, true);
  assert.equal(Object.prototype.hasOwnProperty.call(result.data, 'eventId'), false);
});

test('omitting autoEventBudget from an update does not reintroduce it via schema defaults', () => {
  const result = updateFinanceSchema.safeParse({ description: 'x' });
  assert.equal(result.success, true);
  assert.equal(Object.prototype.hasOwnProperty.call(result.data, 'autoEventBudget'), false);
});

test('omitting status from an update does not silently default it to pending', () => {
  const result = updateFinanceSchema.safeParse({ description: 'x' });
  assert.equal(result.success, true);
  assert.equal(Object.prototype.hasOwnProperty.call(result.data, 'status'), false);
});

test('an explicit status is still accepted and preserved on update', () => {
  const result = updateFinanceSchema.safeParse({ status: 'paid' });
  assert.equal(result.success, true);
  assert.equal(result.data.status, 'paid');
});

test('a full-looking update payload still does not get eventId/status/autoEventBudget defaulted in', () => {
  const result = updateFinanceSchema.safeParse({ type: 'revenue', category: 'contrato', amount: 10, date: '2026-08-08' });
  assert.equal(result.success, true);
  assert.equal(Object.prototype.hasOwnProperty.call(result.data, 'eventId'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result.data, 'status'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result.data, 'autoEventBudget'), false);
});
