import assert from 'node:assert/strict';
import test from 'node:test';
import type { PizzaEvent } from '../../types/Event';
import { getEventsForDay } from './calendar-utils';

const template: PizzaEvent = {
  id: 'template',
  name: 'Feirinha de quinta',
  date: '2026-11-12',
  location: 'Praça',
  guestCount: 0,
  status: 'confirmed',
  budget: 0,
  menu: [],
  notes: '',
  createdAt: '2026-11-01T00:00:00.000Z',
  modality: 'feirinha',
  isRecurringTemplate: true,
  recurrenceEndDate: '2026-12-03',
};

const occurrence: PizzaEvent = {
  ...template,
  id: 'occurrence-1',
  isRecurringTemplate: false,
  recurrenceId: template.id,
};

test('projects a weekly Feirinha on each configured Thursday', () => {
  const events = getEventsForDay([template], new Date(2026, 10, 19, 12));

  assert.equal(events.length, 1);
  assert.equal(events[0].date, '2026-11-19');
  assert.equal(events[0].isProjectedOccurrence, true);
});

test('uses an existing occurrence instead of duplicating the recurring template', () => {
  const events = getEventsForDay([template, occurrence], new Date(2026, 10, 12, 12));

  assert.equal(events.length, 1);
  assert.equal(events[0].id, occurrence.id);
  assert.equal(events[0].isProjectedOccurrence, undefined);
});

test('does not project the weekly Feirinha on other weekdays', () => {
  assert.deepEqual(getEventsForDay([template], new Date(2026, 10, 18, 12)), []);
});
