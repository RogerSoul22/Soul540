import assert from 'node:assert/strict';
import test from 'node:test';
import type { FinanceEntry } from '../../../shared/types';
import { buildDreTemplateValues } from '../../../shared/dreTemplate';

const finance = (overrides: Partial<FinanceEntry>): FinanceEntry => ({
  id: 'finance-1',
  eventId: '',
  type: 'revenue',
  category: 'contrato',
  description: 'Evento',
  amount: 0,
  date: '2026-07-01',
  status: 'received',
  ...overrides,
});

test('maps financial entries to the official DRE 2026 month and category cells', () => {
  const values = buildDreTemplateValues([
    finance({ amount: 1_000, category: 'contrato', date: '2026-07-10' }),
    finance({ id: 'finance-2', amount: 250, category: 'sinal-evento', date: '2026-07-12' }),
    finance({ id: 'finance-3', type: 'cost', amount: 90, category: 'combustivel', date: '2026-08-02' }),
  ]);

  assert.equal(values.get('B4'), 1_250);
  assert.equal(values.get('D29'), 90);
});

test('ignores entries outside the Jul-Dec 2026 period represented by the template', () => {
  const values = buildDreTemplateValues([
    finance({ amount: 500, date: '2026-06-30' }),
    finance({ id: 'finance-2', amount: 700, date: '2027-01-01' }),
  ]);

  assert.equal(values.size, 0);
});

test('uses the DRE section fallback for custom categories', () => {
  const values = buildDreTemplateValues(
    [finance({ type: 'cost', category: 'frete-especial', amount: 75, date: '2026-09-15' })],
    [{ id: 'category-1', key: 'frete-especial', label: 'Frete especial', type: 'cost', section: 'despesas-logistica' }],
  );

  assert.equal(values.get('F34'), 75);
});
