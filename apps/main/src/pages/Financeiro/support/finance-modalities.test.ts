import assert from 'node:assert/strict';
import test from 'node:test';
import type { FinanceEntry } from '@soul540/contracts';
import { filterFinanceByModality } from './finance-modalities';

const entries: FinanceEntry[] = [
  {
    id: 'legacy',
    eventId: '',
    type: 'revenue',
    category: 'faturamento',
    description: 'Legado',
    amount: 10,
    date: '2026-01-01',
    status: 'paid',
  },
  {
    id: 'feirinha',
    eventId: '',
    type: 'revenue',
    category: 'faturamento',
    description: 'Feira',
    amount: 20,
    date: '2026-01-02',
    status: 'paid',
    modality: 'feirinha',
  },
];

test('main finance modality filter preserves legacy as avulso', () => {
  assert.deepEqual(
    filterFinanceByModality(entries, 'evento_avulso').map((entry) => entry.id),
    ['legacy'],
  );
  assert.deepEqual(
    filterFinanceByModality(entries, 'feirinha').map((entry) => entry.id),
    ['feirinha'],
  );
});
