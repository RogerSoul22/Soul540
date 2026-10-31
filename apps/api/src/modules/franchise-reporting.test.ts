import assert from 'node:assert/strict';
import test from 'node:test';
import { getEventUnitsForRequest } from '../infrastructure/event-tenant';
import { getFranchiseFilter } from '../infrastructure/franchise-scope';
import { getFinanceFilter } from './finance/finance-tenant';
import { FranchiseFinance } from './finance/finance.model';

test('global administrator can select franchise events from the main system', () => {
  const req = { user: { unit: 'main', isAdmin: true }, query: { scope: 'franchise' }, headers: {} };
  assert.deepEqual(getEventUnitsForRequest(req, 'franchise'), ['franchise']);
});

test('regular users cannot expand event reporting scope', () => {
  const req = { user: { unit: 'main', isAdmin: false }, query: { scope: 'franchise' }, headers: {} };
  assert.deepEqual(getEventUnitsForRequest(req, 'franchise'), ['main']);
});

test('global administrator can report every franchise without a selected franchise id', () => {
  const req = { user: { unit: 'main', isAdmin: true }, query: { scope: 'franchise' }, headers: {} };
  assert.deepEqual(getFranchiseFilter(req, { reversedAt: { $exists: false } }), {
    reversedAt: { $exists: false },
  });
  assert.deepEqual(getFinanceFilter(req, FranchiseFinance, { status: 'open' }), { status: 'open' });
});
