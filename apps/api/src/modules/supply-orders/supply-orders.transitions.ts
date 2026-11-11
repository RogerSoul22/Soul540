import { getFranchiseScope } from '../../infrastructure/franchise-context';
import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import { logAudit } from '../../infrastructure/audit-log';
import { transitionSupplyOrder } from '@soul540/domain';
import { SupplyOrderError } from './supply-orders.errors';
import { SupplyOrderModel } from './supply-orders.model';
import { canRunSupplyOrderCommand } from './supply-orders.scope';
import { requireSupplyOrder } from './supply-orders.read';

export async function startSupplyOrderPreparation(req: any, id: string) {
  if (getTenantUnit(req) !== 'factory') throw new SupplyOrderError('Somente a Fábrica pode separar pedidos.', 403);
  const order = await requireSupplyOrder(req, id);
  if (!order) throw new SupplyOrderError('Pedido de insumos não encontrado.', 404);
  if (order.status === 'preparing') return order;
  const nextStatus = transitionSupplyOrder(order.status, 'start_preparing');
  if (!nextStatus) throw new SupplyOrderError('Este pedido não pode entrar em separação.', 409);
  return updateStatus(req, order, nextStatus, 'start_preparing');
}

export async function returnSupplyOrderToSubmitted(req: any, id: string) {
  if (getTenantUnit(req) !== 'factory') throw new SupplyOrderError('Somente a Fábrica pode alterar esta etapa.', 403);
  const order = await requireSupplyOrder(req, id);
  if (!order) throw new SupplyOrderError('Pedido de insumos não encontrado.', 404);
  const nextStatus = transitionSupplyOrder(order.status, 'return_to_submitted');
  if (!nextStatus) throw new SupplyOrderError('Este pedido não pode voltar para a etapa anterior.', 409);
  return updateStatus(req, order, nextStatus, 'return_to_submitted');
}

export async function cancelSupplyOrder(req: any, id: string, note?: string) {
  const order = await requireSupplyOrder(req, id);
  if (!order) throw new SupplyOrderError('Pedido de insumos não encontrado.', 404);
  const scope = getFranchiseScope(req);
  if (!canRunSupplyOrderCommand(scope, order, 'cancel'))
    throw new SupplyOrderError('Este pedido não pode ser cancelado.', 403);
  const nextStatus = transitionSupplyOrder(order.status, 'cancel');
  if (!nextStatus) throw new SupplyOrderError('Pedido já despachado não pode ser cancelado.', 409);
  const updated = await updateStatus(req, order, nextStatus, 'cancel', note);
  return updated;
}

async function updateStatus(req: any, order: any, status: string, action: string, note?: string) {
  const actorUnit = getTenantUnit(req);
  const entry = {
    status,
    actorName: String(req.user?.name || req.user?.email || 'Usuário'),
    actorUnit,
    at: new Date().toISOString(),
    ...(note?.trim() && { note: note.trim().slice(0, 1000) }),
  };
  const updated = await SupplyOrderModel.findOneAndUpdate(
    { _id: order._id, status: order.status, unit: order.unit, franchiseId: order.franchiseId },
    { $set: { status, updatedAt: entry.at }, $push: { history: entry } },
    { new: true },
  );
  if (!updated)
    throw new SupplyOrderError('O pedido mudou em outra operação. Atualize a lista e tente novamente.', 409);
  await logAudit({
    req,
    action: 'update',
    resource: 'supply-orders',
    resourceId: String(order._id),
    description: `Pedido de insumos ${action}: ${status}`,
  });
  return updated;
}
