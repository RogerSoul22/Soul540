import type { SupplyOrderStatus } from '@soul540/contracts';

export type SupplyOrderMode = 'franchise' | 'factory';
export type SupplyOrderViewAction = 'start_preparing' | 'dispatch' | 'confirm_receipt' | 'cancel';

const statusLabels: Record<SupplyOrderStatus, string> = {
  submitted: 'Solicitado',
  preparing: 'Em separação',
  dispatched: 'Enviado',
  received: 'Recebido',
  received_with_difference: 'Recebido com divergência',
  cancelled: 'Cancelado',
};

export function getSupplyOrderStatusLabel(status: SupplyOrderStatus): string {
  return statusLabels[status];
}

export function getSupplyOrderActions(mode: SupplyOrderMode, status: SupplyOrderStatus): SupplyOrderViewAction[] {
  if (mode === 'factory') {
    if (status === 'submitted') return ['start_preparing', 'cancel'];
    if (status === 'preparing') return ['dispatch', 'cancel'];
    return [];
  }
  if (status === 'submitted') return ['cancel'];
  return status === 'dispatched' ? ['confirm_receipt'] : [];
}

export function hasSupplyOrderReceiptDifference(
  items: Array<{ quantityToDispatch: number; quantityReceived?: number }>,
): boolean {
  return items.some((item) => item.quantityReceived !== item.quantityToDispatch);
}
