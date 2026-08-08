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

test('excludes cancelled financial entries from DRE values', () => {
  const values = buildDreTemplateValues([
    finance({ amount: 1_000, settlementStatus: 'cancelled' }),
  ]);

  assert.equal(values.size, 0);
});

test('excludes unclassified OFX movements from DRE values until they are categorized', () => {
  const values = buildDreTemplateValues([
    finance({ amount: 1_000, category: 'nao-classificado', classificationStatus: 'unclassified' }),
  ]);

  assert.equal(values.size, 0);
});

test('uses each settlement date in the default cash view', () => {
  const values = buildDreTemplateValues([
    finance({
      amount: 100,
      status: 'pending',
      settlements: [
        { id: 's-1', amountCents: 3_000, settledOn: '2026-07-31', settledAt: '2026-07-31T15:00:00.000Z', idempotencyKey: 'first' },
        { id: 's-2', amountCents: 7_000, settledOn: '2026-08-01', settledAt: '2026-08-01T15:00:00.000Z', idempotencyKey: 'second' },
      ],
    }),
  ]);

  assert.equal(values.get('B4'), 30);
  assert.equal(values.get('D4'), 70);
});

test('filters DRE by the reporting unit calculated for the selected view', () => {
  const entry = finance({
    amount: 100,
    amountCents: 10_000,
    source: 'franchise',
    date: '2026-07-20',
    status: 'pending',
    settlements: [{
      id: 'settlement-1', amountCents: 10_000, settledOn: '2026-08-03',
      settledAt: '2026-08-03T12:00:00.000Z', idempotencyKey: 'settlement-1',
    }],
  });

  assert.equal(buildDreTemplateValues([entry], [], { view: 'competence', reportingUnit: 'main' }).size, 0);
  assert.equal(buildDreTemplateValues([entry], [], { view: 'cash', reportingUnit: 'main' }).get('D4'), 100);
});
