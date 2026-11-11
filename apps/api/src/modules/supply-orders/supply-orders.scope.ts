import type { SupplyOrderStatus } from '@soul540/contracts';
import { hasPermission, type PermissionMode } from '../../infrastructure/middleware/permissions';

export type SupplyOrderScope = { unit: 'main' | 'franchise' | 'factory'; franchiseId?: string };
export type SupplyOrderOwner = { unit: 'main' | 'franchise'; franchiseId?: string };
export type SupplyOrderAction =
  | 'start_preparing'
  | 'return_to_submitted'
  | 'dispatch'
  | 'confirm_receipt'
  | 'cancel';

export function canAccessSupplyOrders(
  unit: string,
  user: { isAdmin?: boolean; permissions?: string[] } | null | undefined,
  mode: PermissionMode,
) {
  return (
    hasPermission(user, 'pedidos-insumos', mode) ||
    (unit === 'factory' && hasPermission(user, 'tarefas', mode))
  );
}

export function getFactorySupplyOrderFilter(filter: Record<string, unknown> = {}) {
  return { ...filter, deletedAt: { $exists: false } };
}

export function getSupplyOrderListFilter(scope: SupplyOrderScope) {
  if (scope.unit === 'factory') return { unit: { $in: ['main', 'franchise'] }, deletedAt: { $exists: false } };
  if (scope.unit === 'franchise' && !scope.franchiseId) throw new Error('Franchise scope required');
  return {
    unit: scope.unit,
    ...(scope.unit === 'franchise' && { franchiseId: scope.franchiseId }),
    deletedAt: { $exists: false },
  };
}

export function canAccessSupplyOrder(scope: SupplyOrderScope, owner: SupplyOrderOwner): boolean {
  if (scope.unit === 'factory') return true;
  return scope.unit === owner.unit && (scope.unit !== 'franchise' || scope.franchiseId === owner.franchiseId);
}

export function canRunSupplyOrderCommand(
  scope: SupplyOrderScope,
  order: SupplyOrderOwner & { status: SupplyOrderStatus },
  command: SupplyOrderAction,
): boolean {
  if (command === 'start_preparing' || command === 'return_to_submitted' || command === 'dispatch')
    return scope.unit === 'factory';
  if (command === 'confirm_receipt') return scope.unit !== 'factory' && canAccessSupplyOrder(scope, order);
  if (command === 'cancel')
    return order.status === 'submitted' || order.status === 'preparing'
      ? scope.unit === 'factory' || canAccessSupplyOrder(scope, order)
      : false;
  return false;
}
export type SupplyOrderListStatus = SupplyOrderStatus;
