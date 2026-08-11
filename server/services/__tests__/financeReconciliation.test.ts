import assert from 'node:assert/strict';
import test from 'node:test';
import { reconcileFinances, reconciliationFindingsToCsv } from '../financeReconciliation';

const finance = (overrides: Record<string, unknown> = {}) => ({
  id: 'finance-1',
  eventId: 'event-1',
  source: 'main',
  type: 'revenue' as const,
  amount: 100,
  date: '2026-07-10',
  status: 'pending' as const,
  settlementStatus: 'open' as const,
  ...overrides,
});

test('suggests cancelling an open forecast linked to a cancelled event', () => {
  const findings = reconcileFinances([finance()], [{ id: 'event-1', status: 'cancelled' }], '2026-07-01', '2026-07-31');

  assert.deepEqual(findings.map((item) => item.action), ['cancel_open_forecast', 'add_amount_cents']);
});

test('requires human review for cancelled events with money already settled', () => {
  const findings = reconcileFinances([
    finance({
      amountCents: 10_000,
      settlements: [{ id: 's-1', amountCents: 10_000, settledOn: '2026-07-10', settledAt: '2026-07-10T12:00:00.000Z', idempotencyKey: 'one' }],
    }),
  ], [{ id: 'event-1', status: 'cancelled' }], '2026-07-01', '2026-07-31');

  assert.deepEqual(findings.map((item) => item.action), ['review_cancelled_event_settled']);
});

test('normalizes the legacy received status before migrating its settlement', () => {
  const findings = reconcileFinances([
    finance({
      amountCents: 10_000,
      eventId: '',
      status: 'received',
      settlementStatus: 'settled',
      settledAt: '2026-08-02T02:30:00.000Z',
    }),
  ], [], '2026-07-01', '2026-07-31');

  assert.deepEqual(findings.map((item) => item.action), ['normalize_legacy_status', 'migrate_legacy_settlement']);
});

test('proposes settling an automatic event deposit that remains pending', () => {
  const findings = reconcileFinances([
    finance({
      amountCents: 10_000,
      kind: 'deposit',
      automatic: true,
    }),
  ], [], '2026-07-01', '2026-07-31');

  assert.deepEqual(findings.map((item) => item.action), ['settle_automatic_deposit']);
  assert.equal(findings[0].proposedChange, 'Registrar o sinal autom\u00e1tico como pago na data do lan\u00e7amento');
});

test('does not propose settlement for a manual deposit', () => {
  const findings = reconcileFinances([
    finance({
      amountCents: 10_000,
      kind: 'deposit',
      automatic: false,
    }),
  ], [], '2026-07-01', '2026-07-31');

  assert.deepEqual(findings, []);
});

test('proposes a canonical settlement for a paid automatic deposit without settlement data', () => {
  const findings = reconcileFinances([
    finance({
      amountCents: 10_000,
      kind: 'deposit',
      automatic: true,
      status: 'paid',
      settlementStatus: 'settled',
    }),
  ], [], '2026-07-01', '2026-07-31');

  assert.deepEqual(findings.map((item) => item.action), ['settle_automatic_deposit']);
});

test('proposes canonicalizing an automatic deposit that has a settlement but lacks amount cents', () => {
  const findings = reconcileFinances([
    finance({
      kind: 'deposit',
      automatic: true,
      status: 'paid',
      settlementStatus: 'settled',
      settlements: [{ id: 'settlement-1', amountCents: 10_000, settledOn: '2026-07-10', settledAt: '2026-07-10T12:00:00.000Z', idempotencyKey: 'settlement-1' }],
    }),
  ], [], '2026-07-01', '2026-07-31');

  assert.equal(findings.some((item) => item.action === 'settle_automatic_deposit'), true);
});

test('proposes canonicalizing an automatic deposit with incorrect amount cents', () => {
  const findings = reconcileFinances([
    finance({
      amountCents: 9_999,
      kind: 'deposit',
      automatic: true,
      status: 'paid',
      settlementStatus: 'settled',
      settlements: [{ id: 'settlement-1', amountCents: 10_000, settledOn: '2026-07-10', settledAt: '2026-07-10T12:00:00.000Z', idempotencyKey: 'settlement-1' }],
    }),
  ], [], '2026-07-01', '2026-07-31');

  assert.equal(findings.some((item) => item.action === 'settle_automatic_deposit'), true);
});

test('does not propose automatic settlement for a deposit with a fraction of a cent', () => {
  const findings = reconcileFinances([
    finance({
      amount: 10.235,
      amountCents: 1_024,
      kind: 'deposit',
      automatic: true,
      settlements: [],
    }),
  ], [], '2026-07-01', '2026-07-31');

  assert.deepEqual(findings.map((item) => item.action), ['review_amount_precision']);
});

test('adds a proposed read-only impact to every reconciliation finding', () => {
  const [finding] = reconcileFinances([finance()], [{ id: 'event-1', status: 'cancelled' }], '2026-07-01', '2026-07-31');

  assert.equal(finding.proposedChange, 'Cancelar a previsão sem baixa e preservar o histórico');
  assert.equal(finding.affectedAmountCents, 10_000);
  assert.equal(finding.estimatedCashImpactCents, 0);
  assert.equal(finding.requiresApproval, true);
});

test('exports reconciliation findings as an escaped CSV report', () => {
  const csv = reconciliationFindingsToCsv([{
    financeId: 'finance-1',
    eventId: 'event-1',
    source: 'main',
    action: 'cancel_open_forecast',
    reason: 'Previsão, aberta',
    proposedChange: 'Cancelar a previsão sem baixa e preservar o histórico',
    affectedAmountCents: 10_000,
    estimatedCashImpactCents: 0,
    requiresApproval: true,
  }]);

  assert.equal(csv.split('\n')[0], 'financeId,eventId,source,action,reason,proposedChange,affectedAmountCents,estimatedCashImpactCents,requiresApproval');
  assert.equal(csv.includes('"Previsão, aberta"'), true);
});
