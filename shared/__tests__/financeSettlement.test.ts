import assert from 'node:assert/strict';
import test from 'node:test';
import { isRealizedRevenue } from '../financeSettlement';

test('does not treat a pending event deposit as realized revenue', () => {
  assert.equal(isRealizedRevenue({
    id: 'deposit-1',
    eventId: 'event-1',
    type: 'revenue',
    category: 'sinal-evento',
    description: 'Sinal',
    amount: 500,
    date: '2026-07-10',
    status: 'pending',
    settlementStatus: 'open',
  }), false);
});

