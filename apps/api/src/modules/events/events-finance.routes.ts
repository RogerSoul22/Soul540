import { Router } from 'express';
import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import { getFranchiseFilter } from '../../infrastructure/franchise-scope';
import { logAudit } from '../../infrastructure/audit-log';
import { requirePermission } from '../../infrastructure/middleware/permissions';
import { calculateEventFinanceAmounts, findEventForRequest, syncEventFinances } from './events.finance';
import { cancelMutableAutomaticFinances, syncEventCommissions } from './events.commissions';

function isFromFactory(req: any): boolean {
  return getTenantUnit(req) === 'factory';
}

const router = Router();
router.use(requirePermission('eventos', 'write'));
router.post('/:id/financial-close', async (req, res) => {
  if (isFromFactory(req)) return res.status(403).json({ error: 'Factory cannot close event finances' });
  const found = await findEventForRequest(req, req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });

  await syncEventFinances(found.doc, found.financeModel, found.financeSource);
  await syncEventCommissions(found.doc, found.financeModel, found.financeSource);
  const closedAt = new Date().toISOString();
  const event = await found.model.findOneAndUpdate(
    getFranchiseFilter(req, { _id: req.params.id }),
    {
      financialStatus: 'closed',
      financialCloseStatus: 'closed',
      financiallyClosedAt: closedAt,
      financiallyClosedBy: (req as any).user?._id?.toString() || (req as any).user?.id || 'system',
    },
    { new: true },
  );
  await logAudit({
    req,
    action: 'update',
    resource: 'events',
    resourceId: req.params.id,
    description: `Fechou financeiro do evento: ${found.doc.name}`,
  });
  res.json(event);
});

router.post('/:id/financial-reopen', async (req, res) => {
  if (isFromFactory(req)) return res.status(403).json({ error: 'Factory cannot reopen event finances' });
  const found = await findEventForRequest(req, req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });

  const { targetRevenue: target, balance } = calculateEventFinanceAmounts(found.doc);
  const financialStatus =
    target > 0 && balance === 0 ? 'settled' : Number(found.doc.depositValue) > 0 ? 'partial' : 'open';
  const event = await found.model.findOneAndUpdate(
    getFranchiseFilter(req, { _id: req.params.id }),
    {
      $set: { financialStatus, financialCloseStatus: 'open' },
      $unset: { financiallyClosedAt: 1, financiallyClosedBy: 1 },
    },
    { new: true },
  );
  await cancelMutableAutomaticFinances(
    found.financeModel,
    getFranchiseFilter(req, {
      eventId: found.doc.id,
      kind: 'commission',
      automatic: true,
      reversedAt: { $exists: false },
    }),
    'Financeiro do evento reaberto',
  );
  await logAudit({
    req,
    action: 'update',
    resource: 'events',
    resourceId: req.params.id,
    description: `Reabriu financeiro do evento: ${found.doc.name}`,
  });
  res.json(event);
});

export { router as eventFinanceRouter };
