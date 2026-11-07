import assert from 'node:assert/strict';
import test from 'node:test';
import { getModalityLabel, getUpcomingFeirinhaOccurrences } from './event-modalities';

test('labels missing modality as Evento avulso', () => {
  assert.equal(getModalityLabel(undefined), 'Evento avulso');
  assert.equal(getModalityLabel('feirinha'), 'Feirinha');
});

test('lists upcoming weekly occurrences of a Feirinha', () => {
  assert.deepEqual(
    getUpcomingFeirinhaOccurrences(
      { modality: 'feirinha', date: '2026-10-25', recurrenceEndDate: '2026-11-15' },
      '2026-10-25',
      10,
    ),
    ['2026-10-25', '2026-11-01', '2026-11-08', '2026-11-15'],
  );
});
