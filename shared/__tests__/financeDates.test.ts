import assert from 'node:assert/strict';
import test from 'node:test';
import { getSaoPauloDate, isDateOnly } from '../financeDates';

test('keeps the settlement month in America/Sao_Paulo', () => {
  assert.equal(getSaoPauloDate('2026-08-01T02:30:00.000Z'), '2026-07-31');
  assert.equal(getSaoPauloDate('2026-08-01T03:30:00.000Z'), '2026-08-01');
});

test('accepts only real ISO calendar dates', () => {
  assert.equal(isDateOnly('2026-02-28'), true);
  assert.equal(isDateOnly('2026-02-30'), false);
  assert.equal(isDateOnly('2026/02/28'), false);
});
