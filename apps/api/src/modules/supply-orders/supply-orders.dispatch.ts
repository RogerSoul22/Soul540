import mongoose from 'mongoose';
import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import { logAudit } from '../../infrastructure/audit-log';
import type { DispatchSupplyOrderInput } from '@soul540/contracts';
import { validateDispatchQuantities } from '@soul540/domain';
import { supplyModels } from '../operations/supply-model';
import { normalizeSupplyOrderMutationError, SupplyOrderError } from './supply-orders.errors';
import { SupplyOrderModel } from './supply-orders.model';
import { requireSupplyOrder } from './supply-orders.read';

export async function dispatchSupplyOrder(req: any, id: string, input: DispatchSupplyOrderInput) {
  if (getTenantUnit(req) !== 'factory') throw new SupplyOrderError('Somente a Fábrica pode despachar pedidos.', 403);
  const session = await mongoose.startSession();
  let result: any;
  let changed = false;
  try {
    await session.withTransaction(async () => {
      const order = await requireSupplyOrder(req, id, session);
      if (!order) throw new SupplyOrderError('Pedido de insumos não encontrado.', 404);
      if (order.status === 'dispatched' || order.status === 'received' || order.status === 'received_with_difference') {
        result = order;
        return;
      }
      if (order.status !== 'preparing')
        throw new SupplyOrderError('Coloque o pedido em separação antes de despachar.', 409);
      const validation = validateDispatchQuantities(input.items || [], order.items);
      if (validation) throw new SupplyOrderError(validation, 400);
      for (const line of input.items)
        await decrementFactoryStock(line.factorySupplyId, line.quantityToDispatch, session);
      const now = new Date().toISOString();
      const items = order.items.map((line: any) => ({
        ...line.toObject(),
        quantityToDispatch: input.items.find((item) => item.factorySupplyId === line.factorySupplyId)!
          .quantityToDispatch,
      }));
      result = await SupplyOrderModel.findOneAndUpdate(
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
        { new: true, session },
      );
      if (!result) throw new SupplyOrderError('O pedido mudou em outra operação. Atualize e tente novamente.', 409);
      changed = true;
    });
  } catch (error) {
    throw normalizeSupplyOrderMutationError(error);
  } finally {
    await session.endSession();
  }
  if (changed)
    await logAudit({
      req,
      action: 'update',
      resource: 'supply-orders',
      resourceId: id,
      description: 'Pedido de insumos despachado',
    });
  return result;
}

async function decrementFactoryStock(id: string, quantity: number, session: mongoose.ClientSession) {
  if (quantity === 0) return;
  const updated = await supplyModels.Factory.findOneAndUpdate(
    { _id: id, deletedAt: { $exists: false }, quantity: { $gte: quantity } },
    { $inc: { quantity: -quantity } },
    { new: true, session },
  );
  if (!updated) throw new SupplyOrderError('Estoque insuficiente ou insumo indisponível na Fábrica.', 409);
  const status =
    updated.quantity <= 0 ? 'sem_estoque' : updated.quantity <= updated.minStock ? 'estoque_baixo' : 'em_estoque';
  await supplyModels.Factory.updateOne({ _id: updated._id }, { $set: { status } }, { session });
}
