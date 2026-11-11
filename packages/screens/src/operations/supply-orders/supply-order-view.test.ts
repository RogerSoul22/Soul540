import assert from 'node:assert/strict';
import test from 'node:test';
import { getSupplyOrderActions, getSupplyOrderStatusLabel, hasSupplyOrderReceiptDifference } from './supply-order-view';

test('shows translated supply order statuses', () => {
  assert.equal(getSupplyOrderStatusLabel('submitted'), 'Solicitado');
  assert.equal(getSupplyOrderStatusLabel('preparing'), 'Em separação');
  assert.equal(getSupplyOrderStatusLabel('dispatched'), 'Enviado');
  assert.equal(getSupplyOrderStatusLabel('received_with_difference'), 'Recebido com divergência');
});

test('exposes actions according to portal and status', () => {
  assert.deepEqual(getSupplyOrderActions('factory', 'submitted'), ['start_preparing', 'cancel']);
  assert.deepEqual(getSupplyOrderActions('factory', 'preparing'), ['dispatch', 'cancel']);
  assert.deepEqual(getSupplyOrderActions('franchise', 'dispatched'), ['confirm_receipt']);
  assert.deepEqual(getSupplyOrderActions('franchise', 'received'), []);
});

test('detects receipt quantity differences', () => {
  assert.equal(hasSupplyOrderReceiptDifference([{ quantityToDispatch: 3, quantityReceived: 2 }]), true);
  assert.equal(hasSupplyOrderReceiptDifference([{ quantityToDispatch: 3, quantityReceived: 3 }]), false);
});
