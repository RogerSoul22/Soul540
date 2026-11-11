import assert from 'node:assert/strict';
import test from 'node:test';
import {
  transitionSupplyOrder,
  validateDispatchQuantities,
  validateReceiptQuantities,
  validateSupplyOrderItems,
} from './supply-orders';

test('allows only the supply order lifecycle transitions', () => {
  assert.equal(transitionSupplyOrder('submitted', 'start_preparing'), 'preparing');
  assert.equal(transitionSupplyOrder('preparing', 'dispatch'), 'dispatched');
  assert.equal(transitionSupplyOrder('dispatched', 'confirm_receipt'), 'received');
  assert.equal(transitionSupplyOrder('submitted', 'cancel'), 'cancelled');
  assert.equal(transitionSupplyOrder('preparing', 'cancel'), 'cancelled');
});

test('dispatch cannot exceed requested quantity or omit an item', () => {
  const requested = [{ factorySupplyId: 'supply-1', quantityRequested: 4 }];
  assert.equal(validateDispatchQuantities([{ factorySupplyId: 'supply-1', quantityToDispatch: 3 }], requested), null);
  assert.equal(
    validateDispatchQuantities([{ factorySupplyId: 'supply-1', quantityToDispatch: 5 }], requested),
    'A quantidade enviada excede a solicitada.',
  );
  assert.equal(validateDispatchQuantities([], requested), 'Informe as quantidades enviadas para todos os insumos.');
});

test('receipt cannot exceed dispatched quantity and allows zero received', () => {
  const dispatched = [{ factorySupplyId: 'supply-1', quantityToDispatch: 4 }];
  assert.equal(validateReceiptQuantities([{ factorySupplyId: 'supply-1', quantityReceived: 0 }], dispatched), null);
  assert.equal(
    validateReceiptQuantities([{ factorySupplyId: 'supply-1', quantityReceived: 5 }], dispatched),
    'A quantidade recebida excede a enviada.',
  );
  assert.equal(validateReceiptQuantities([], dispatched), 'Informe a conferência de todos os insumos.');
});

test('rejects transitions from an incompatible state', () => {
  assert.equal(transitionSupplyOrder('submitted', 'dispatch'), null);
  assert.equal(transitionSupplyOrder('dispatched', 'cancel'), null);
  assert.equal(transitionSupplyOrder('received', 'confirm_receipt'), null);
  assert.equal(transitionSupplyOrder('cancelled', 'start_preparing'), null);
});

test('marks a receipt with any quantity difference', () => {
  assert.equal(transitionSupplyOrder('dispatched', 'confirm_receipt', true), 'received_with_difference');
});

test('requires a nonempty list of unique positive finite quantities', () => {
  assert.equal(validateSupplyOrderItems([]), 'Adicione pelo menos um insumo.');
  assert.equal(
    validateSupplyOrderItems([
      { factorySupplyId: 'supply-1', quantity: 2 },
      { factorySupplyId: 'supply-1', quantity: 1 },
    ]),
    'Não repita o mesmo insumo no pedido.',
  );
  assert.equal(
    validateSupplyOrderItems([{ factorySupplyId: 'supply-1', quantity: 0 }]),
    'Informe uma quantidade válida.',
  );
  assert.equal(
    validateSupplyOrderItems([{ factorySupplyId: 'supply-1', quantity: Number.NaN }]),
    'Informe uma quantidade válida.',
  );
  assert.equal(validateSupplyOrderItems([{ factorySupplyId: 'supply-1', quantity: 1.5 }]), null);
});
