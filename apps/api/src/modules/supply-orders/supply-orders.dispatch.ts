import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import { logAudit } from '../../infrastructure/audit-log';
import type { DispatchSupplyOrderInput } from '@soul540/contracts';
import { validateDispatchQuantities } from '@soul540/domain';
import { SupplyOrderError } from './supply-orders.errors';
import { SupplyOrderModel } from './supply-orders.model';
import { requireSupplyOrder } from './supply-orders.read';

export async function dispatchSupplyOrder(req: any, id: string, input: DispatchSupplyOrderInput) {
  if (getTenantUnit(req) !== 'factory') throw new SupplyOrderError('Somente a Fábrica pode despachar pedidos.', 403);
  const order = await requireSupplyOrder(req, id);
  if (!order) throw new SupplyOrderError('Pedido de insumos não encontrado.', 404);
  if (order.status === 'dispatched' || order.status === 'received' || order.status === 'received_with_difference') {
    return order;
  }
  if (order.status !== 'preparing')
    throw new SupplyOrderError('Coloque o pedido em separação antes de despachar.', 409);
  const validation = validateDispatchQuantities(input.items || [], order.items);
  if (validation) throw new SupplyOrderError(validation, 400);
  const now = new Date().toISOString();
  const items = order.items.map((line: any) => ({
    ...line.toObject(),
    quantityToDispatch: input.items.find((item) => item.factorySupplyId === line.factorySupplyId)!.quantityToDispatch,
  }));
  const result = await SupplyOrderModel.findOneAndUpdate(
    { _id: order._id, status: 'preparing' },
    {
      $set: { status: 'dispatched', items, dispatchKey: String(input.idempotencyKey || order._id), updatedAt: now },
      $push: {
        history: {
          status: 'dispatched',
          actorName: req.user?.name || req.user?.email || 'Usuário',
          actorUnit: 'factory',
          at: now,
          note: input.note?.trim().slice(0, 1000),
        },
      },
    },
    { new: true },
  );
  if (!result) throw new SupplyOrderError('O pedido mudou em outra operação. Atualize e tente novamente.', 409);
  await logAudit({
    req,
    action: 'update',
    resource: 'supply-orders',
    resourceId: id,
    description: 'Pedido de insumos despachado',
  });
  return result;
}
