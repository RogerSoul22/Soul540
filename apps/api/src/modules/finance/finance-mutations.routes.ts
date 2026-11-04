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
  getFinanceFilter,
} from './finance-tenant';
import { injectFranchiseScope } from '../../infrastructure/franchise-scope';
import { appendSettlementToFinance, serializeFinanceEntry } from './finance-settlements';
import { requirePermission } from '../../infrastructure/middleware/permissions';
import { findEventForRequest } from '../events/events.finance';
const router = Router();
router.use(requirePermission('financeiro', 'write'));
router.post('/', validate(createFinanceSchema), async (req, res) => {
  const source = getTenantUnit(req) as 'main' | 'franchise' | 'factory';
  if (typeof req.body.eventId === 'string' && req.body.eventId.trim()) {
    const event = await findEventForRequest(req, req.body.eventId.trim());
    if (!event) return res.status(400).json({ error: 'Evento não encontrado ou sem acesso.' });
    req.body.eventId = event.doc.id || event.doc._id.toString();
  }
  const normalized = buildManualFinancePayload(req.body, source, getAuthenticatedUserId(req));
  const Model = getFinanceModelForUnit(source);
  if (isFromFactory(req)) {
    const finance = await FactoryFinance.create({ ...normalized, source: 'factory' });
    await logAudit({
      req,
      action: 'create',
      resource: 'finances',
      resourceId: finance.id,
      description: `Criou lançamento: ${finance.description} (R$ ${finance.amount})`,
    });
    return res.status(201).json(finance);
  }
  if (isFromFranchise(req)) {
    const finance = await FranchiseFinance.create({
      ...injectFranchiseScope(req, normalized),
      source: 'franchise',
    });
    await logAudit({
      req,
      action: 'create',
      resource: 'finances',
      resourceId: finance.id,
      description: `Criou lançamento: ${finance.description} (R$ ${finance.amount})`,
    });
    return res.status(201).json(finance);
  }
  const finance = await Finance.create({ ...normalized, source: 'main' });
  await logAudit({
    req,
    action: 'create',
    resource: 'finances',
    resourceId: finance.id,
    description: `Criou lançamento: ${finance.description} (R$ ${finance.amount})`,
  });
  res.status(201).json(finance);
});

const STATUS_LABELS: Record<string, string> = { pending: 'Pendente', paid: 'Pago' };

import financeUpdateRouter from './finance-update.routes';

router.use(financeUpdateRouter);
import { financeSettlementRouter } from './finance-settlement.routes';

router.use(financeSettlementRouter);

export { router as financeMutationRouter };
