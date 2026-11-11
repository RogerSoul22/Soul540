import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canAccessSupplyOrder,
  canAccessSupplyOrders,
  canRunSupplyOrderCommand,
  getFactorySupplyOrderFilter,
  getSupplyOrderListFilter,
} from './supply-orders.scope';

test('factory task permissions include supply orders while franchise permission remains scoped', () => {
  assert.equal(canAccessSupplyOrders('factory', { permissions: ['tarefas'] }, 'read'), true);
  assert.equal(canAccessSupplyOrders('factory', { permissions: ['tarefas'] }, 'write'), true);
  assert.equal(canAccessSupplyOrders('franchise', { permissions: ['tarefas'] }, 'read'), false);
  assert.equal(canAccessSupplyOrders('franchise', { permissions: ['pedidos-insumos'] }, 'read'), true);
});

test('factory supply order catalog includes positive stock regardless of status', () => {
  assert.deepEqual(getFactorySupplyOrderFilter(), { deletedAt: { $exists: false } });
  assert.deepEqual(getFactorySupplyOrderFilter({ _id: { $in: ['supply-1'] } }), {
    _id: { $in: ['supply-1'] },
    deletedAt: { $exists: false },
  });
});

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
