import { Router } from 'express';
import mongoose from 'mongoose';
import { requirePermission } from '../../infrastructure/middleware/permissions';
import { createSupplyOrder } from './supply-orders.create';
import { dispatchSupplyOrder } from './supply-orders.dispatch';
import { SupplyOrderError } from './supply-orders.errors';
import { confirmSupplyOrderReceipt } from './supply-orders.receipt';
import {
  getLocalSupplyOptions,
  getSupplyOrderCatalog,
  listSupplyOrders,
  requireSupplyOrder,
} from './supply-orders.read';
import { cancelSupplyOrder, startSupplyOrderPreparation } from './supply-orders.transitions';

const router = Router();
router.use(requirePermission('pedidos-insumos', 'read'));

router.get(
  '/catalog',
  handle(async (req, res) => res.json(await getSupplyOrderCatalog(req))),
);
router.get(
  '/local-supplies',
  handle(async (req, res) => res.json(await getLocalSupplyOptions(req))),
);
router.get(
  '/',
  handle(async (req, res) => res.json(await listSupplyOrders(req))),
);
router.get(
  '/:id',
  handle(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new SupplyOrderError('Pedido de insumos não encontrado.', 404);
    const order = await requireSupplyOrder(req, req.params.id);
    if (!order) throw new SupplyOrderError('Pedido de insumos não encontrado.', 404);
    res.json(order);
  }),
);
router.post(
  '/',
  requirePermission('pedidos-insumos', 'write'),
  handle(async (req, res) => {
    res.status(201).json(await createSupplyOrder(req, req.body));
  }),
);
router.post(
  '/:id/preparing',
  requirePermission('pedidos-insumos', 'write'),
  handle(async (req, res) => {
    assertOrderId(req.params.id);
    res.json(await startSupplyOrderPreparation(req, req.params.id));
  }),
);
router.post(
  '/:id/dispatch',
  requirePermission('pedidos-insumos', 'write'),
  handle(async (req, res) => {
    assertOrderId(req.params.id);
    res.json(await dispatchSupplyOrder(req, req.params.id, req.body));
  }),
);
router.post(
  '/:id/receipt',
  requirePermission('pedidos-insumos', 'write'),
  handle(async (req, res) => {
    assertOrderId(req.params.id);
    res.json(await confirmSupplyOrderReceipt(req, req.params.id, req.body));
  }),
);
router.post(
  '/:id/cancel',
  requirePermission('pedidos-insumos', 'write'),
  handle(async (req, res) => {
    assertOrderId(req.params.id);
    res.json(await cancelSupplyOrder(req, req.params.id, req.body?.note));
  }),
);

function assertOrderId(id: string) {
  if (!mongoose.isValidObjectId(id)) throw new SupplyOrderError('Pedido de insumos não encontrado.', 404);
}

function handle(action: (req: any, res: any) => Promise<unknown>) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(action(req, res)).catch((error) => {
      if (error instanceof SupplyOrderError) return res.status(error.statusCode).json({ error: error.message });
      next(error);
    });
  };
}

export default router;
