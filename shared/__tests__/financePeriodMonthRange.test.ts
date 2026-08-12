import assert from 'node:assert/strict';
import test from 'node:test';
import { createMonthRangePeriod } from '../financePeriod';

test('builds a custom period from complete start and end months', () => {
  assert.deepEqual(
    createMonthRangePeriod('2026-06', '2027-02'),
    { preset: 'custom', start: '2026-06-01', end: '2027-02-28' },
  );
});

test('rejects an inverted custom month range', () => {
  assert.throws(() => createMonthRangePeriod('2026-08', '2026-07'));
});
