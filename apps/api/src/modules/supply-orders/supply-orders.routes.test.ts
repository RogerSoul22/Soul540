import assert from 'node:assert/strict';
import test from 'node:test';
import { canAccessSupplyOrder, canRunSupplyOrderCommand, getSupplyOrderListFilter } from './supply-orders.scope';

test('franchise queries are restricted to its unit and franchise ID', () => {
  assert.deepEqual(getSupplyOrderListFilter({ unit: 'franchise', franchiseId: 'franchise-1' }), {
    unit: 'franchise',
    franchiseId: 'franchise-1',
    deletedAt: { $exists: false },
  });
});

test('factory sees requests from franchise and main units only', () => {
  assert.deepEqual(getSupplyOrderListFilter({ unit: 'factory' }), {
    unit: { $in: ['main', 'franchise'] },
    deletedAt: { $exists: false },
  });
});

test('franchise cannot read another franchise order', () => {
  const scope = { unit: 'franchise' as const, franchiseId: 'franchise-1' };
  assert.equal(canAccessSupplyOrder(scope, { unit: 'franchise', franchiseId: 'franchise-1' }), true);
  assert.equal(canAccessSupplyOrder(scope, { unit: 'franchise', franchiseId: 'franchise-2' }), false);
  assert.equal(canAccessSupplyOrder(scope, { unit: 'main' }), false);
});

test('only factory dispatches and only an order owner confirms receipt', () => {
  const order = { unit: 'franchise', franchiseId: 'franchise-1', status: 'dispatched' } as const;
  assert.equal(canRunSupplyOrderCommand({ unit: 'factory' }, order, 'dispatch'), true);
  assert.equal(
    canRunSupplyOrderCommand({ unit: 'franchise', franchiseId: 'franchise-2' }, order, 'confirm_receipt'),
    false,
  );
  assert.equal(
    canRunSupplyOrderCommand({ unit: 'franchise', franchiseId: 'franchise-1' }, order, 'confirm_receipt'),
    true,
  );
  assert.equal(canRunSupplyOrderCommand({ unit: 'franchise', franchiseId: 'franchise-1' }, order, 'dispatch'), false);
});
