import mongoose from 'mongoose';
import { getFranchiseScope } from '../../infrastructure/franchise-context';
import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import { logAudit } from '../../infrastructure/audit-log';
import type { ConfirmSupplyOrderReceiptInput } from '@soul540/contracts';
import { transitionSupplyOrder, validateReceiptQuantities } from '@soul540/domain';
import { supplyModels } from '../operations/supply-model';
import { normalizeSupplyOrderMutationError, SupplyOrderError } from './supply-orders.errors';
import { SupplyOrderModel } from './supply-orders.model';
import { requireSupplyOrder } from './supply-orders.read';

export async function confirmSupplyOrderReceipt(req: any, id: string, input: ConfirmSupplyOrderReceiptInput) {
  const scope = getFranchiseScope(req);
  if (scope.unit === 'factory')
    throw new SupplyOrderError('A confirmação do recebimento pertence à unidade solicitante.', 403);
  const session = await mongoose.startSession();
  let result: any;
  let changed = false;
  try {
    await session.withTransaction(async () => {
      const order = await requireSupplyOrder(req, id, session);
      if (!order) throw new SupplyOrderError('Pedido de insumos não encontrado.', 404);
      if (['received', 'received_with_difference'].includes(order.status)) {
        result = order;
        return;
      }
      if (order.status !== 'dispatched') throw new SupplyOrderError('O pedido ainda não foi despachado.', 409);
      const validation = validateReceiptQuantities(input.items || [], order.items);
      if (validation) throw new SupplyOrderError(validation, 400);
      const receivedById = new Map(input.items.map((item) => [item.factorySupplyId, item]));
      let hasDifference = false;
      const items = [];
      for (const line of order.items) {
        const receipt = receivedById.get(line.factorySupplyId)!;
        if (receipt.quantityReceived !== line.quantityToDispatch) hasDifference = true;
        const franchiseSupplyId =
          receipt.quantityReceived > 0
            ? await addFranchiseStock(req, line, receipt.quantityReceived, receipt.franchiseSupplyId, session)
            : undefined;
        items.push({ ...line.toObject(), quantityReceived: receipt.quantityReceived, franchiseSupplyId });
      }
      const status = transitionSupplyOrder(order.status, 'confirm_receipt', hasDifference);
      if (!status) throw new SupplyOrderError('Este pedido não pode ser confirmado.', 409);
      const now = new Date().toISOString();
      result = await SupplyOrderModel.findOneAndUpdate(
        { _id: order._id, status: 'dispatched' },
        {
          $set: { status, items, receiptKey: String(input.idempotencyKey || order._id), updatedAt: now },
          $push: {
            history: {
              status,
              actorName: req.user?.name || req.user?.email || 'Usuário',
              actorUnit: getTenantUnit(req),
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
      description: 'Recebimento de pedido de insumos confirmado',
    });
  return result;
}

async function addFranchiseStock(
  req: any,
  line: any,
  quantity: number,
  localId: string | undefined,
  session: mongoose.ClientSession,
) {
  const model = supplyModels.getModel(req);
  const scope = supplyModels.getFilter(req, { deletedAt: { $exists: false } });
  const existing = localId
    ? await model.findOne({ ...scope, _id: localId }).session(session)
    : await model.findOne({ ...scope, factorySupplyId: line.factorySupplyId }).session(session);
  if (existing) {
    if (existing.name !== line.factorySupplyName || existing.measureUnit !== line.measureUnit) {
      throw new SupplyOrderError('Vincule um item com o mesmo nome e unidade de medida.', 422);
    }
    if (existing.factorySupplyId && existing.factorySupplyId !== line.factorySupplyId) {
      throw new SupplyOrderError('Este item já está vinculado a outro insumo da Fábrica.', 409);
    }
    existing.factorySupplyId = line.factorySupplyId;
    existing.quantity += quantity;
    existing.status = existing.quantity <= existing.minStock ? 'estoque_baixo' : 'em_estoque';
    await existing.save({ session });
    return String(existing._id);
  }
  const [created] = await model.create(
    [
      {
        ...supplyModels.withScope(req, {
          factorySupplyId: line.factorySupplyId,
          name: line.factorySupplyName,
          category: '',
          measureUnit: line.measureUnit,
          quantity,
          minStock: 0,
          costPerUnit: 0,
          supplier: '',
          status: 'em_estoque',
        }),
        source: supplyModels.getSource(req),
      },
    ],
    { session },
  );
  return String(created._id);
}
