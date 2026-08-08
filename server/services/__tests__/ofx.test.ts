import assert from 'node:assert/strict';
import test from 'node:test';
import { buildOfxSuggestions, parseOfxTransactions } from '../ofx';

const ofx = `
<BANKID>001
<ACCTID>12345
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20260715120000
<TRNAMT>150.50
<FITID>credit-1
<MEMO>Sinal evento Ana
</STMTTRN>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20260716120000
<TRNAMT>-20.00
<FITID>debit-1
<MEMO>Combustível
</STMTTRN>`;

test('parses OFX transactions on the server with stable external IDs', () => {
  const parsed = parseOfxTransactions(ofx);

  assert.equal(parsed.bankAccount, '001:12345');
  assert.deepEqual(parsed.transactions.map((transaction) => ({
    externalId: transaction.externalId,
    type: transaction.type,
    amount: transaction.amount,
    date: transaction.date,
  })), [
    { externalId: 'ofx:001:12345:credit-1', type: 'revenue', amount: 150.5, date: '2026-07-15' },
    { externalId: 'ofx:001:12345:debit-1', type: 'cost', amount: 20, date: '2026-07-16' },
  ]);
});

test('suggests duplicate, unique match and ambiguous OFX decisions without writing', () => {
  const parsed = parseOfxTransactions(ofx);
  const suggestions = buildOfxSuggestions(parsed.transactions, [
    {
      id: 'already-imported', type: 'revenue', amount: 150.5, amountCents: 15_050, date: '2026-07-15',
      externalId: 'ofx:001:12345:credit-1', settlementStatus: 'settled',
    },
    {
      id: 'open-fuel', type: 'cost', amount: 20, amountCents: 2_000, date: '2026-07-16', settlementStatus: 'open',
    },
  ]);

  assert.equal(suggestions[0].decision, 'duplicate');
  assert.equal(suggestions[1].decision, 'link');
  assert.equal(suggestions[1].financeId, 'open-fuel');
});

test('treats an OFX movement linked as a settlement as a duplicate on reimport', () => {
  const parsed = parseOfxTransactions(ofx);
  const suggestions = buildOfxSuggestions(parsed.transactions, [{
    id: 'event-deposit', type: 'revenue', amount: 150.5, amountCents: 15_050, date: '2026-07-10', settlementStatus: 'settled',
    settlements: [{
      id: 'settlement-1', externalId: 'ofx:001:12345:credit-1', amountCents: 15_050,
      settledOn: '2026-07-15', settledAt: '2026-07-15T12:00:00.000Z', idempotencyKey: 'ofx:001:12345:credit-1',
    }],
  }]);

  assert.equal(suggestions[0].decision, 'duplicate');
  assert.equal(suggestions[0].financeId, 'event-deposit');
});
