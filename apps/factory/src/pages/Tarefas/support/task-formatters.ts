import type { Pedido, PedidoStatus } from '../types/task-types';

export const MEASURES = ['kg', 'g', 'L', 'ml', 'un', 'cx'];

export const ALL_STATUSES: { id: PedidoStatus; label: string }[] = [
  { id: 'a_preparar', label: 'A preparar' },
  { id: 'a_enviar', label: 'A enviar' },
  { id: 'entregue', label: 'Entregue' },
];

export const KANBAN_COLUMNS = ALL_STATUSES.slice(0, 2);

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function getOrderKey(order: Pedido) {
  return `${order.unit || 'factory'}:${order.id}`;
}

export function formatR$(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatQty(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function sortOrdersByNumber(firstOrder: Pedido, secondOrder: Pedido) {
  const firstNumber = Number(firstOrder.orderNumber);
  const secondNumber = Number(secondOrder.orderNumber);
  if (Number.isFinite(firstNumber) && Number.isFinite(secondNumber) && firstNumber !== secondNumber) {
    return secondNumber - firstNumber;
  }
  if (Number.isFinite(firstNumber)) return -1;
  if (Number.isFinite(secondNumber)) return 1;
  return (secondOrder.createdAt || '').localeCompare(firstOrder.createdAt || '');
}

export function sortOrdersAlphabetically(firstOrder: Pedido, secondOrder: Pedido) {
  const filialComparison = firstOrder.filial.localeCompare(secondOrder.filial, 'pt-BR');
  return filialComparison || sortOrdersByNumber(firstOrder, secondOrder);
}
