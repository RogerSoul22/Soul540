import assert from 'node:assert/strict';
import test from 'node:test';
import { eventStatusPath, findEventStatusPage } from './event-status';

test('maps the closed-events card to its route and event group', () => {
  const page = findEventStatusPage('fechados');

  assert.equal(page?.key, 'confirmados');
  assert.equal(eventStatusPath('fechados'), '/eventos/fechados');
});

test('returns no page for an unknown status route', () => {
  assert.equal(findEventStatusPage('desconhecido'), undefined);
});
