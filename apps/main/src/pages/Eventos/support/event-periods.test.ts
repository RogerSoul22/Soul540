import assert from 'node:assert/strict';
import test from 'node:test';
import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';
import { formatCompactBRL, groupEventsByPeriod, upcomingEvents } from './event-periods';
import { EVENT_STATUS_PAGES, groupEventsByStatus } from './event-status';

// Quarta-feira, 4 de novembro de 2026.
const NOW = new Date(2026, 10, 4, 10, 0, 0);

const event = (id: string, date: string, status: PizzaEvent['status'] = 'planning', budget = 1000) =>
  ({
    id,
    name: id,
    date,
    status,
    budget,
    guestCount: 10,
    location: 'Local',
    menu: [],
    notes: '',
    createdAt: '',
  }) as PizzaEvent;

test('upcoming events are grouped as late, today, this week, next week and then by month', () => {
  const groups = groupEventsByPeriod(
    [
      event('mes-que-vem', '2026-12-10'),
      event('hoje', '2026-11-04'),
      event('atrasado', '2026-10-20'),
      event('semana', '2026-11-06'),
      event('proxima', '2026-11-12'),
      event('fim-do-mes', '2026-11-27'),
    ],
    true,
    NOW,
  );

  assert.deepEqual(
    groups.map((group) => group.label),
    ['Atrasados', 'Hoje', 'Esta semana', 'Próxima semana', 'Novembro de 2026', 'Dezembro de 2026'],
  );
  assert.deepEqual(
    groups[4].events.map((item) => item.id),
    ['fim-do-mes'],
  );
  assert.equal(groups[0].total, 1000);
});

test('past events are grouped by month, most recent first', () => {
  const groups = groupEventsByPeriod(
    [
      event('a', '2026-08-10', 'completed'),
      event('b', '2026-10-02', 'completed'),
      event('c', '2026-10-20', 'completed'),
    ],
    false,
    NOW,
  );

  assert.deepEqual(
    groups.map((group) => group.key),
    ['2026-10', '2026-08'],
  );
  assert.deepEqual(
    groups[0].events.map((item) => item.id),
    ['c', 'b'],
  );
});

test('upcoming events only include open events from today on, nearest first', () => {
  const list = upcomingEvents(
    [
      event('futuro', '2026-12-01', 'confirmed'),
      event('passado', '2026-10-01', 'confirmed'),
      event('finalizado', '2026-11-10', 'completed'),
      event('amanha', '2026-11-05', 'planning'),
    ],
    NOW,
  );

  assert.deepEqual(
    list.map((item) => item.id),
    ['amanha', 'futuro'],
  );
});

test('status pages map to the four groups and compact values are readable', () => {
  assert.deepEqual(
    EVENT_STATUS_PAGES.map((page) => page.slug),
    ['orcamentos', 'fechados', 'finalizados', 'cancelados'],
  );
  const groups = groupEventsByStatus([
    event('1', '2026-11-05', 'planning'),
    event('2', '2026-11-05', 'in_progress'),
    event('3', '2026-11-05', 'cancelled'),
  ]);
  assert.deepEqual(
    [groups.orcamentos.length, groups.confirmados.length, groups.finalizados.length, groups.cancelados.length],
    [1, 1, 0, 1],
  );
  assert.equal(formatCompactBRL(850), 'R$ 850');
  assert.equal(formatCompactBRL(91740.4), 'R$ 91,7 mil');
  assert.equal(formatCompactBRL(1_250_000), 'R$ 1,3 mi');
});
