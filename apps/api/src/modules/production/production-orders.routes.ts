import { Router } from 'express';
import { FactoryFinance } from '../finance/finance-tenant';
import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import { getFranchiseFilter, injectFranchiseScope } from '../../infrastructure/franchise-scope';
import { logAudit } from '../../infrastructure/audit-log';
import { requirePermission } from '../../infrastructure/middleware/permissions';
import { ProductionOrderModel } from './production-orders.model';
import {
  findProductionEvent,
  getProductionOrderFinanceEventId,
  listAvailableProductionEvents,
  syncFinanceForProductionOrder,
  type ProductionOrderFinanceSyncResult,
} from './production-orders.finance';
import { getFactoryProductionOrderFilter } from './production-orders.scope';

const router = Router();
router.use(requirePermission('tarefas', 'read'));
router.get('/', async (req, res) => {
  const unit = getTenantUnit(req);
  const filter =
    unit === 'factory'
      ? getFactoryProductionOrderFilter({ deletedAt: { $exists: false } })
      : getFranchiseFilter(req, { unit, deletedAt: { $exists: false } });
  const docs = await ProductionOrderModel.find(filter).sort({ createdAt: -1 });
  res.json(docs);
});

router.get('/available-events', async (req, res) => {
  if (getTenantUnit(req) !== 'factory') {
    return res.status(403).json({ error: 'Apenas a fábrica pode consultar eventos de produção' });
  }
  res.json(await listAvailableProductionEvents());
});

router.post('/reconcile-finances', requirePermission('tarefas', 'write'), async (req, res) => {
  const unit = getTenantUnit(req);
  if (unit !== 'factory') {
    return res.status(403).json({ error: 'Apenas a fábrica pode reconciliar receitas de pedidos' });
  }

  const orders = await ProductionOrderModel.find(getFranchiseFilter(req, { unit, deletedAt: { $exists: false } })).sort(
    { createdAt: -1 },
  );
  const results = await Promise.all(orders.map((order) => syncFinanceForProductionOrder(order)));
  const summary = results.reduce<Record<ProductionOrderFinanceSyncResult, number>>(
    (counts, result) => {
      counts[result] += 1;
      return counts;
    },
    { created: 0, updated: 0, preserved: 0, cancelled: 0, not_eligible: 0 },
  );

  await logAudit({
    req,
    action: 'update',
    resource: 'finances',
    resourceId: 'factory-order-reconciliation',
    description:
      `Reconciliação de pedidos da fábrica: ${summary.created} receitas criadas e ` +
      `${summary.updated} previsões atualizadas`,
  });

  res.json({ orders: orders.length, ...summary });
});

router.post('/', requirePermission('tarefas', 'write'), async (req, res) => {
  const unit = getTenantUnit(req);
  const last = await ProductionOrderModel.findOne(getFranchiseFilter(req, { unit })).sort({ orderNumber: -1 });
  const orderNumber = (last?.orderNumber || 0) + 1;
  const linkedEvent = req.body.eventId ? await findProductionEvent(req.body.eventId, req.body.eventSource, req) : null;
  if (req.body.eventId && !linkedEvent) {
    return res.status(400).json({ error: 'Evento informado não está disponível para produção' });
  }
  const doc = await ProductionOrderModel.create({
    ...injectFranchiseScope(req, req.body),
    unit,
    ...(linkedEvent?.franchiseId && { franchiseId: linkedEvent.franchiseId }),
    accountingTreatment: req.body.accountingTreatment || 'internal_transfer',
    orderNumber,
    ...(linkedEvent
      ? {
          eventId: linkedEvent.id,
          eventSource: linkedEvent.source,
          eventName: linkedEvent.name,
          eventDate: linkedEvent.date,
          filial: linkedEvent.city || req.body.filial,
        }
      : {}),
    status: req.body.status || 'a_preparar',
    createdAt: req.body.createdAt || new Date().toISOString(),
  });
  await syncFinanceForProductionOrder(doc, req);
  res.status(201).json(doc);
});

router.put('/:id', requirePermission('tarefas', 'write'), async (req, res) => {
  const unit = getTenantUnit(req);
  const filter =
    unit === 'factory'
      ? getFactoryProductionOrderFilter(
          { id: req.params.id, deletedAt: { $exists: false } },
          req.body.unit,
        )
      : getFranchiseFilter(req, { unit, id: req.params.id, deletedAt: { $exists: false } });
  const { unit: _orderUnit, id: _orderId, franchiseId: _franchiseId, ...update } = req.body;
  const doc = await ProductionOrderModel.findOneAndUpdate(
    filter,
    injectFranchiseScope(req, update),
    { new: true },
  );

  if (!doc) return res.status(404).json({ error: 'Pedido não encontrado' });
  await syncFinanceForProductionOrder(doc, req);
  res.json(doc);
});

router.delete('/:id', requirePermission('tarefas', 'write'), async (req, res) => {
  const unit = getTenantUnit(req);
  const filter =
    unit === 'factory'
      ? getFactoryProductionOrderFilter(
          { id: req.params.id, deletedAt: { $exists: false } },
          req.query.unit,
        )
      : getFranchiseFilter(req, { unit, id: req.params.id, deletedAt: { $exists: false } });
  const doc = await ProductionOrderModel.findOneAndUpdate(
    filter,
    { $set: { deletedAt: new Date(), status: 'cancelled' } },
    { new: true },
  );

  if (!doc) return res.status(404).json({ error: 'Pedido não encontrado' });
  await FactoryFinance.updateMany(
    { eventId: getProductionOrderFinanceEventId(unit, doc.id), source: 'factory', reversedAt: { $exists: false } },
    {
      $set: {
        reversedAt: new Date().toISOString(),
        reversalReason: 'Pedido excluído',
        settlementStatus: 'cancelled',
      },
    },
  );
  res.status(204).end();
});

export default router;
