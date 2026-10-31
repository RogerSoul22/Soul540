import { Router } from 'express';
import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import { validate } from '../../infrastructure/middleware/validate';
import { createSettlementSchema } from '../../infrastructure/schemas/finances';
import { logAudit } from '../../infrastructure/audit-log';
import { buildSettlementRecord } from '../../infrastructure/services/financeCommands';
import { getFinanceAmountCents, getSettledCents } from '../../../../../shared/finance/financePolicy';
import { findFinanceForRequest, getFinanceReverseError } from './finance-tenant';
import { appendSettlementToFinance, serializeFinanceEntry } from './finance-settlements';
import { requirePermission } from '../../infrastructure/middleware/permissions';

const router = Router();
router.use(requirePermission('financeiro', 'write'));
router.post('/:id/settlements', validate(createSettlementSchema), async (req, res) => {
  const found = await findFinanceForRequest(req, req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });

  const entry = found.doc.toJSON();
  const existing = Array.isArray(entry.settlements)
    ? entry.settlements.find((settlement: any) => settlement.idempotencyKey === req.body.idempotencyKey)
    : undefined;
  if (existing) return res.json(serializeFinanceEntry(found.doc));
  const amountCents = getFinanceAmountCents(entry);
  const settledCents = getSettledCents(entry);
  const settlement = buildSettlementRecord(
    req.body,
    (req as any).user?._id?.toString() || (req as any).user?.id || 'system',
  );
  if (settlement.amountCents + settledCents > amountCents) {
    return res.status(422).json({ error: 'A baixa excede o valor em aberto do lançamento' });
  }

  if (!Number.isSafeInteger(entry.amountCents)) {
    await found.model.findByIdAndUpdate(entry._id, { $set: { amountCents, settledCents } });
  }

  const updated = await (found.model as any).findOneAndUpdate(
    {
      _id: entry._id,
      'settlements.idempotencyKey': { $ne: settlement.idempotencyKey },
      $expr: {
        $lte: [{ $add: [{ $ifNull: ['$settledCents', 0] }, settlement.amountCents] }, '$amountCents'],
      },
    },
    [
      {
        $set: {
          settlements: { $concatArrays: [{ $ifNull: ['$settlements', []] }, [settlement]] },
          settledCents: { $add: [{ $ifNull: ['$settledCents', 0] }, settlement.amountCents] },
          settledAt: settlement.settledAt,
        },
      },
      {
        $set: {
          settlementStatus: { $cond: [{ $gte: ['$settledCents', '$amountCents'] }, 'settled', 'partial'] },
          status: { $cond: [{ $gte: ['$settledCents', '$amountCents'] }, 'paid', 'pending'] },
        },
      },
    ],
    { new: true },
  );

  if (!updated) {
    const latest = await found.model.findById(entry._id);
    const duplicated = latest
      ?.toJSON?.()
      .settlements?.some((item: any) => item.idempotencyKey === settlement.idempotencyKey);
    if (duplicated) return res.json(serializeFinanceEntry(latest));
    return res.status(409).json({ error: 'Não foi possível registrar a baixa; atualize e tente novamente' });
  }

  await logAudit({
    req,
    action: 'update',
    resource: 'finances',
    resourceId: req.params.id,
    description: `Liquidou ${updated.description} em ${settlement.settledOn}`,
  });
  res.status(201).json(serializeFinanceEntry(updated));
});

router.post('/:id/reverse', async (req, res) => {
  const found = await findFinanceForRequest(req, req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  const reverseError = getFinanceReverseError(found.doc as any);
  if (reverseError) return res.status(409).json({ error: reverseError });
  if ((found.doc as any).reversedAt) return res.status(409).json({ error: 'Lançamento já estornado' });
  const reversedAt = new Date().toISOString();
  const finance = await found.model.findByIdAndUpdate(
    req.params.id,
    {
      reversedAt,
      reversedBy: (req as any).user?._id?.toString() || (req as any).user?.id || 'system',
      reversalReason: req.body?.reason || 'Estorno manual',
      settlementStatus: 'cancelled',
    },
    { new: true },
  );
  await logAudit({
    req,
    action: 'update',
    resource: 'finances',
    resourceId: req.params.id,
    description: `Estornou lançamento: ${(found.doc as any).description}`,
  });
  res.json(finance);
});

router.delete('/:id', async (req, res) => {
  const found = await findFinanceForRequest(req, req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  const finance = found.doc;
  await found.model.findByIdAndUpdate(req.params.id, {
    settlementStatus: 'cancelled',
    reversedAt: new Date().toISOString(),
    reversedBy: (req as any).user?._id?.toString() || (req as any).user?.id || 'system',
    reversalReason: 'Cancelamento manual',
  });
  await logAudit({
    req,
    action: 'delete',
    resource: 'finances',
    resourceId: req.params.id,
    description: `Excluiu lançamento: ${finance?.description}`,
  });
  res.status(204).end();
});
export { router as financeMutationRouter };

export { router as financeSettlementRouter };
