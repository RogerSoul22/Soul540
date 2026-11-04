import { Router } from 'express';
import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import { validate } from '../../infrastructure/middleware/validate';
import {
  createFinanceSchema,
  createSettlementSchema,
  updateFinanceSchema,
} from '../../infrastructure/schemas/finances';
import { logAudit } from '../../infrastructure/audit-log';
import {
  buildManualFinancePayload,
  buildSettlementRecord,
  getClassificationStatusForCategory,
  resolveFinanceStatusChange,
} from '../../infrastructure/services/financeCommands';
import { toCents } from '../../../../../shared/finance/money';
import { getFinanceAmountCents, getSettledCents } from '../../../../../shared/finance/financePolicy';
import {
  FactoryFinance,
  Finance,
  FranchiseFinance,
  findFinanceForRequest,
  getAuthenticatedUserId,
  getFinanceModelForUnit,
  getFinanceReverseError,
  isFromFactory,
  isFromFranchise,
} from './finance-tenant';
import { appendSettlementToFinance, serializeFinanceEntry } from './finance-settlements';
import { requirePermission } from '../../infrastructure/middleware/permissions';
import { findEventForRequest } from '../events/events.finance';
const router = Router();
router.use(requirePermission('financeiro', 'write'));

const STATUS_LABELS: Record<string, string> = { pending: 'Pendente', paid: 'Pago' };

router.put('/:id', validate(updateFinanceSchema), async (req, res) => {
  const found = await findFinanceForRequest(req, req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  const oldDoc = found.doc;
  let currentDoc: any = oldDoc;

  if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
    const entry = oldDoc.toJSON();
    let command;
    try {
      command = resolveFinanceStatusChange(entry, req.body.status, req.body, getAuthenticatedUserId(req));
    } catch (error: any) {
      return res.status(409).json({ error: error.message });
    }

    if (command.kind === 'settle') {
      const outcome = await appendSettlementToFinance(found.model, oldDoc, command.settlement);
      if (outcome.kind === 'error') return res.status(outcome.status).json({ error: outcome.error });
      if (outcome.kind === 'created') {
        await logAudit({
          req,
          action: 'update',
          resource: 'finances',
          resourceId: req.params.id,
          description:
            `Alterou status de "${STATUS_LABELS[entry.status] || entry.status}" para ` +
            `"${STATUS_LABELS[req.body.status] || req.body.status}": ${outcome.finance.description}`,
        });
      }
      currentDoc = outcome.finance;
    } else if (command.kind === 'reopen') {
      const updated = await found.model.findOneAndUpdate(
        { _id: entry._id },
        {
          $set: { settlementStatus: 'open', settledCents: 0, status: 'pending' },
          $unset: { settledAt: 1, settlements: 1 },
        },
        { new: true },
      );
      if (!updated) return res.status(409).json({ error: 'Não é possível reabrir um lançamento cancelado' });
      await logAudit({
        req,
        action: 'update',
        resource: 'finances',
        resourceId: req.params.id,
        description:
          `Alterou status de "${STATUS_LABELS[entry.status] || entry.status}" para "Pendente": ` + updated.description,
      });
      currentDoc = updated;
    }
    // command.kind === 'noop': currentDoc segue sendo oldDoc; continua para os outros campos abaixo, se houver.
  }

  const commandFields = [
    'settlementStatus',
    'settledAt',
    'settledCents',
    'settlements',
    'origin',
    'kind',
    'automatic',
    'source',
    'reversedAt',
    'reversedBy',
    'reversalReason',
    'autoEventBudget',
  ];
  if (commandFields.some((field) => Object.prototype.hasOwnProperty.call(req.body, field))) {
    return res.status(400).json({
      error: 'Use os comandos de liquidar, cancelar ou origem vinculada para alterar a situação financeira',
    });
  }
  const allowedFields = [
    'eventId',
    'type',
    'modality',
    'category',
    'description',
    'amount',
    'date',
    'dueDate',
    'paymentMethod',
    'installmentGroupId',
    'installmentNumber',
    'installmentTotal',
    'recurrenceId',
    'recurrenceFrequency',
    'recurrenceEndDate',
    'recurrenceInterval',
    'recurrenceTotal',
  ];
  const update = allowedFields.reduce<Record<string, unknown>>((result, field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) result[field] = req.body[field];
    return result;
  }, {});
  const editableClassificationFields = ['eventId', 'type', 'modality'];
  if (
    editableClassificationFields.some((field) => Object.prototype.hasOwnProperty.call(update, field)) &&
    (oldDoc.automatic === true ||
      (oldDoc.origin && oldDoc.origin !== 'manual') ||
      (oldDoc.kind && oldDoc.kind !== 'manual'))
  ) {
    return res.status(409).json({
      error: 'A origem, o tipo e o evento de lançamentos automáticos não podem ser alterados.',
    });
  }
  if (typeof update.eventId === 'string' && update.eventId.trim()) {
    const event = await findEventForRequest(req, update.eventId.trim());
    if (!event) return res.status(400).json({ error: 'Evento não encontrado ou sem acesso.' });
    update.eventId = event.doc.id || event.doc._id.toString();
  }
  if (typeof update.category === 'string') {
    update.classificationStatus = getClassificationStatusForCategory(update.category);
  }
  if (Object.keys(update).length === 0) {
    return res.json(serializeFinanceEntry(currentDoc));
  }
  if (Object.prototype.hasOwnProperty.call(update, 'amount')) {
    update.amountCents = toCents(update.amount as number);
  }
  const finance = await found.model.findByIdAndUpdate(req.params.id, update, { new: true });
  await logAudit({
    req,
    action: 'update',
    resource: 'finances',
    resourceId: req.params.id,
    description: `Atualizou lançamento: ${finance?.description} (R$ ${finance?.amount})`,
  });
  res.json(serializeFinanceEntry(finance));
});

export default router;
