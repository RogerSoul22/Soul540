import type { SupplyOrderStatus } from '@soul540/contracts';

export type SupplyOrderCommand = 'start_preparing' | 'dispatch' | 'confirm_receipt' | 'cancel';
export type SupplyOrderItemInput = { factorySupplyId: string; quantity: number };

const transitions: Record<SupplyOrderCommand, Partial<Record<SupplyOrderStatus, SupplyOrderStatus>>> = {
  start_preparing: { submitted: 'preparing' },
  dispatch: { preparing: 'dispatched' },
  confirm_receipt: { dispatched: 'received' },
  cancel: { submitted: 'cancelled', preparing: 'cancelled' },
};

export function transitionSupplyOrder(
  status: SupplyOrderStatus,
  command: SupplyOrderCommand,
  hasReceiptDifference = false,
): SupplyOrderStatus | null {
  if (command === 'confirm_receipt' && status === 'dispatched' && hasReceiptDifference) {
    return 'received_with_difference';
  }
  return transitions[command][status] || null;
}

export function validateSupplyOrderItems(items: SupplyOrderItemInput[]): string | null {
  if (items.length === 0) return 'Adicione pelo menos um insumo.';
  const ids = items.map((item) => item.factorySupplyId.trim());
  if (ids.some((id) => !id) || new Set(ids).size !== ids.length) {
    return 'Não repita o mesmo insumo no pedido.';
  }
  if (items.some((item) => !Number.isFinite(item.quantity) || item.quantity <= 0)) {
    return 'Informe uma quantidade válida.';
  }
  return null;
}

export function validateSupplyAvailability(supplies: Array<{ quantity: number }>): string | null {
  return supplies.some((supply) => !(supply.quantity > 0))
    ? 'Não é possível pedir insumos sem estoque na Fábrica.'
    : null;
}

export function validateDispatchQuantities(
  dispatch: Array<{ factorySupplyId: string; quantityToDispatch: number }>,
  requested: Array<{ factorySupplyId: string; quantityRequested: number }>,
): string | null {
  if (
    dispatch.length !== requested.length ||
    new Set(dispatch.map((item) => item.factorySupplyId)).size !== requested.length
  ) {
    return 'Informe as quantidades enviadas para todos os insumos.';
  }
  const requestedById = new Map(requested.map((item) => [item.factorySupplyId, item.quantityRequested]));
  if (
    dispatch.some(
      (item) =>
        !requestedById.has(item.factorySupplyId) ||
        !Number.isFinite(item.quantityToDispatch) ||
        item.quantityToDispatch < 0 ||
        item.quantityToDispatch > (requestedById.get(item.factorySupplyId) || 0),
    )
  ) {
    return 'A quantidade enviada excede a solicitada.';
  }
  return dispatch.some((item) => item.quantityToDispatch > 0) ? null : 'Informe ao menos uma quantidade para envio.';
}

export function validateReceiptQuantities(
  receipt: Array<{ factorySupplyId: string; quantityReceived: number }>,
  dispatched: Array<{ factorySupplyId: string; quantityToDispatch: number }>,
): string | null {
  if (
    receipt.length !== dispatched.length ||
    new Set(receipt.map((item) => item.factorySupplyId)).size !== dispatched.length
  ) {
    return 'Informe a conferência de todos os insumos.';
  }
  const dispatchedById = new Map(dispatched.map((item) => [item.factorySupplyId, item.quantityToDispatch]));
  const invalid = receipt.some(
    (item) =>
      !dispatchedById.has(item.factorySupplyId) ||
      !Number.isFinite(item.quantityReceived) ||
      item.quantityReceived < 0 ||
      item.quantityReceived > (dispatchedById.get(item.factorySupplyId) || 0),
  );
  return invalid ? 'A quantidade recebida excede a enviada.' : null;
}
