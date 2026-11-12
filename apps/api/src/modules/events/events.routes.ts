import { Router } from 'express';
import { getFranchiseFilter, injectFranchiseScope } from '../../infrastructure/franchise-scope';
import { getEventUnitsForRequest, type EventUnit } from '../../infrastructure/event-tenant';
import { logAudit } from '../../infrastructure/audit-log';
import { Finance, FranchiseFinance, FactoryFinance } from '../finance/finance-tenant';
import { Event, FranchiseEvent } from './events.model';
import {
  calculateEventFinanceAmounts,
  findEventForRequest,
  getEventStoreForUnit,
  syncEventFinances,
} from './events.finance';
import {
  confirmRecurringOccurrence,
  normalizeEventPayload,
  normalizeEventUpdatePayload,
  shouldSyncEventFinances,
} from './events.modalities';
import { cancelMutableAutomaticFinances, syncEventCommissions } from './events.commissions';
import { requirePermission } from '../../infrastructure/middleware/permissions';
import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import { isFromFactory, isFromFranchise, pickFactoryOperationalUpdate } from './events.policy';
import { getFactoryFranchiseFilter } from './factory-event-scope';

const router = Router();
router.use(requirePermission('eventos', 'read'));
const SLIM = '-locationImageData -paymentProofData -contractPdfData';

// Lightweight count endpoint — used by portal cards
router.get('/count', async (req, res) => {
  const scope = String(req.query.scope || getTenantUnit(req));
  if (isFromFactory(req) || scope === 'combined') {
    const stores = getEventUnitsForRequest(req, scope).map(getEventStoreForUnit);
    const counts = await Promise.all(
      stores.map((store) => store.model.countDocuments({ deletedAt: { $exists: false } })),
    );
    return res.json({ count: counts.reduce((sum, count) => sum + count, 0) });
  }
  if (isFromFranchise(req)) {
    const count = await FranchiseEvent.countDocuments(getFranchiseFilter(req, { deletedAt: { $exists: false } }));
    return res.json({ count });
  }
  const count = await Event.countDocuments({ deletedAt: { $exists: false } });
  res.json({ count });
});

router.get('/', async (req, res) => {
  const scope = String(req.query.scope || getTenantUnit(req));
  if (isFromFactory(req) || scope === 'combined') {
    const stores = getEventUnitsForRequest(req, scope).map(getEventStoreForUnit);
    const groups = await Promise.all(
      stores.map((store) =>
        store.model
          .find(getFranchiseFilter(req, { deletedAt: { $exists: false } }))
          .select(SLIM)
          .sort({ date: 1 }),
      ),
    );
    const events = groups.flat().sort((a, b) => (a.date > b.date ? 1 : -1));
    return res.json(events);
  }
  const stores = getEventUnitsForRequest(req, scope).map(getEventStoreForUnit);
  const groups = await Promise.all(
    stores.map((store) =>
      store.model
        .find(getFranchiseFilter(req, { deletedAt: { $exists: false } }))
        .select(SLIM)
        .sort({ date: 1 }),
    ),
  );
  const events = groups.flat().sort((a, b) => (a.date > b.date ? 1 : -1));
  res.json(events);
});

router.post('/', requirePermission('eventos', 'write'), async (req, res) => {
  if (isFromFactory(req)) {
    return res.status(403).json({ error: 'Factory can only update operational production fields' });
  }
  if (isFromFranchise(req)) {
    const event = await FranchiseEvent.create({
      ...injectFranchiseScope(req, normalizeEventPayload(req.body)),
      source: 'franchise',
    });
    if (shouldSyncEventFinances(event)) await syncEventFinances(event, FranchiseFinance, 'franchise');
    await logAudit({
      req,
      action: 'create',
      resource: 'events',
      resourceId: event.id,
      description: `Criou evento: ${event.name} (${event.date})`,
    });
    return res.status(201).json(event);
  }
  const event = await Event.create({ ...injectFranchiseScope(req, normalizeEventPayload(req.body)), source: 'main' });
  if (shouldSyncEventFinances(event)) await syncEventFinances(event, Finance, 'main');
  await logAudit({
    req,
    action: 'create',
    resource: 'events',
    resourceId: event.id,
    description: `Criou evento: ${event.name} (${event.date})`,
  });
  res.status(201).json(event);
});

router.post('/:id/recurring-occurrence', requirePermission('eventos', 'write'), confirmRecurringOccurrence);

import { eventFinanceRouter } from './events-finance.routes';

router.put('/:id', requirePermission('eventos', 'write'), async (req, res) => {
  const requestedSource = typeof req.body?.source === 'string' ? req.body.source : undefined;
  const found = await findEventForRequest(req, req.params.id, requestedSource);
  if (!found) return res.status(404).json({ error: 'Not found' });
  // Cancelar um evento sempre exclui as previsões financeiras automáticas vinculadas
  // (ver syncEventFinances), mesmo que já tenham baixa registrada — não exige decisão prévia.
  const updateData = isFromFactory(req)
    ? pickFactoryOperationalUpdate(req.body)
    : injectFranchiseScope(req, normalizeEventUpdatePayload(req.body, found.doc));
  if (isFromFactory(req) && Object.keys(updateData).length === 0) {
    return res.status(403).json({ error: 'Factory can only update operational production fields' });
  }
  const event = await found.model.findByIdAndUpdate(req.params.id, updateData, { new: true });
  if (!event) return res.status(404).json({ error: 'Not found' });
  const syncResult =
    isFromFactory(req) || !shouldSyncEventFinances(event)
      ? undefined
      : await syncEventFinances(event, found.financeModel, found.financeSource);
  await logAudit({
    req,
    action: 'update',
    resource: 'events',
    resourceId: req.params.id,
    description: `Atualizou evento: ${event.name}`,
  });
  if (syncResult && syncResult.cancelledCount > 0) {
    await logAudit({
      req,
      action: 'update',
      resource: 'finances',
      resourceId: req.params.id,
      description: `Excluiu ${syncResult.cancelledCount} previsoes automaticas do evento cancelado: ${event.name}`,
    });
  }
  res.json(event);
});

router.delete('/:id', requirePermission('eventos', 'write'), async (req, res) => {
  if (isFromFactory(req)) {
    return res.status(403).json({ error: 'Factory cannot delete events' });
  }
  const found = await findEventForRequest(req, req.params.id);
  if (!found) return res.status(204).end();
  const eventName = found.doc?.name || req.params.id;
  await found.model.findByIdAndUpdate(req.params.id, {
    $set: { deletedAt: new Date(), status: 'cancelled' },
  });
  await found.financeModel.updateMany(
    getFranchiseFilter(req, { eventId: req.params.id, $or: [{ automatic: true }, { autoEventBudget: true }] }),
    { $set: { reversedAt: new Date().toISOString(), reversalReason: 'Evento excluído' } },
  );
  await logAudit({
    req,
    action: 'delete',
    resource: 'events',
    resourceId: req.params.id,
    description: `Excluiu evento: ${eventName}`,
  });
  res.status(204).end();
});

router.use(eventFinanceRouter);

export default router;
