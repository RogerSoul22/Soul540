import assert from 'node:assert/strict';
import test from 'node:test';
import { canConfirmWeeklyOccurrence, getWeeklyOccurrenceDates, normalizeEventModality } from './event-modalities';

test('normalizes missing or unknown modality as evento avulso', () => {
  assert.equal(normalizeEventModality('feirinha'), 'feirinha');
  assert.equal(normalizeEventModality('evento_avulso'), 'evento_avulso');
  assert.equal(normalizeEventModality(undefined), 'evento_avulso');
  assert.equal(normalizeEventModality('evento'), 'evento_avulso');
});

test('generates weekly occurrences until the end date', () => {
  assert.deepEqual(getWeeklyOccurrenceDates('2026-10-25', '2026-11-15', '2026-10-25', 10), [
    '2026-10-25',
    '2026-11-01',
    '2026-11-08',
    '2026-11-15',
  ]);
});

test('limits open-ended weekly occurrences', () => {
  assert.deepEqual(getWeeklyOccurrenceDates('2026-10-25', undefined, '2026-11-01', 3), [
    '2026-11-01',
    '2026-11-08',
    '2026-11-15',
  ]);
});

test('only confirms a weekly occurrence on the configured weekday and range', () => {
  const template = { modality: 'feirinha' as const, date: '2026-10-25', recurrenceEndDate: '2026-11-15' };
  assert.equal(canConfirmWeeklyOccurrence(template, '2026-11-01'), true);
  assert.equal(canConfirmWeeklyOccurrence(template, '2026-11-02'), false);
  assert.equal(canConfirmWeeklyOccurrence(template, '2026-10-18'), false);
  assert.equal(canConfirmWeeklyOccurrence(template, '2026-11-22'), false);
  assert.equal(canConfirmWeeklyOccurrence({ modality: 'evento_avulso', date: '2026-10-25' }, '2026-11-01'), false);
});
