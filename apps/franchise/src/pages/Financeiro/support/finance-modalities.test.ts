import assert from 'node:assert/strict';
import test from 'node:test';
import type { FinanceEntry } from '@soul540/contracts';
import { filterFinanceByModality, getFinanceModalityLabel } from './finance-modalities';

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
  {
    id: 'evento',
    eventId: '',
    type: 'cost',
    category: 'insumo',
    description: 'Evento',
    amount: 30,
    date: '2026-01-03',
    status: 'pending',
    modality: 'evento_avulso',
  },
];

test('finance modality filter treats legacy entries as avulso', () => {
  assert.deepEqual(
    filterFinanceByModality(entries, 'evento_avulso').map((entry) => entry.id),
    ['legacy', 'evento'],
  );
  assert.deepEqual(
    filterFinanceByModality(entries, 'feirinha').map((entry) => entry.id),
    ['feirinha'],
  );
  assert.equal(getFinanceModalityLabel(undefined), 'Evento avulso');
});
