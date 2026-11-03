import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import { validate } from '../../infrastructure/middleware/validate';
import { importOfxSchema, previewOfxSchema } from '../../infrastructure/schemas/finances';
import { logAudit } from '../../infrastructure/audit-log';
import { buildBankImportPayload } from '../../infrastructure/services/financeCommands';
import { buildOfxSuggestions, parseOfxTransactions } from '../../infrastructure/services/ofx';
import { buildFinanceSummary } from '../../../../../shared/finance/financeSummary';
import { fromCents } from '../../../../../shared/finance/money';
import {
  Finance,
  FranchiseFinance,
  FactoryFinance,
  getAuthenticatedUserId,
  getFinanceFilter,
  getFinanceModelForUnit,
  getFinanceModelsForRequest,
} from './finance-tenant';
import { linkOfxTransaction, serializeFinanceEntry } from './finance-settlements';
import { financeMutationRouter } from './finance-mutations.routes';
import { requirePermission } from '../../infrastructure/middleware/permissions';
import { canAccessConsolidatedData } from '../identity/auth-system-policy';
const router = Router();
const requireFinanceRead = requirePermission('financeiro', 'read');

router.get('/', requireFinanceRead, async (req, res) => {
  const requestedScope = String(req.query.scope || '');
  const tenantUnit = getTenantUnit(req);
  const canConsolidate = canAccessConsolidatedData((req as any).user, tenantUnit);
  const scope =
    canConsolidate && ['main', 'franchise', 'factory', 'combined'].includes(requestedScope)
      ? requestedScope
      : tenantUnit;
  const models = scope === 'combined' ? [Finance, FranchiseFinance] : [getFinanceModelForUnit(scope)];
  const groups = await Promise.all(
    models.map((model) =>
      model
        .find(
          getFinanceFilter(req, model, {
            source: model === FranchiseFinance ? 'franchise' : model === Finance ? 'main' : 'factory',
            reversedAt: { $exists: false },
            settlementStatus: { $ne: 'cancelled' },
          }),
        )
        .sort({ date: -1 }),
    ),
  );
  res.json(groups.flat().map(serializeFinanceEntry));
});

router.get('/summary', requireFinanceRead, async (req, res) => {
  const requestedScope = String(req.query.scope || '');
  const tenantUnit = getTenantUnit(req);
  const canConsolidate = canAccessConsolidatedData((req as any).user, tenantUnit);
  const scope =
    canConsolidate && ['main', 'franchise', 'factory', 'combined'].includes(requestedScope)
      ? requestedScope
      : tenantUnit;
  const view = req.query.view === 'competence' ? 'competence' : 'cash';
  const requestedReportingUnit = typeof req.query.reportingUnit === 'string' ? req.query.reportingUnit : '';
  const reportingUnit = canConsolidate && ['main', 'franchise', 'factory'].includes(requestedReportingUnit)
    ? (requestedReportingUnit as 'main' | 'franchise' | 'factory')
    : scope === 'combined'
      ? undefined
      : (scope as 'main' | 'franchise' | 'factory');
  const models = canConsolidate
    ? reportingUnit === 'main'
      ? [Finance, FranchiseFinance]
      : reportingUnit === 'franchise'
        ? [FranchiseFinance]
        : reportingUnit === 'factory'
          ? [FactoryFinance]
          : getFinanceModelsForRequest(req, scope)
    : getFinanceModelsForRequest(req, scope);
  const start = typeof req.query.start === 'string' ? req.query.start : '';
  const end = typeof req.query.end === 'string' ? req.query.end : '';
  const groups = await Promise.all(
    models.map((model) => model.find(getFinanceFilter(req, model, { reversedAt: { $exists: false } })).lean()),
  );
  const entries = groups.flat() as any[];
  const summary = buildFinanceSummary(
    entries.map((entry) => ({
      ...entry,
      id: entry.id || entry._id?.toString(),
    })),
    { view, start, end, reportingUnit },
  );

  res.json({
    view,
    period: { start: start || undefined, end: end || undefined },
    reportingUnit,
    totalIncome: fromCents(summary.totalIncomeCents),
    totalExpense: fromCents(summary.totalExpenseCents),
    realizedIncome: fromCents(summary.realizedIncomeCents),
    projectedIncome: fromCents(summary.projectedIncomeCents),
    realizedExpense: fromCents(summary.realizedExpenseCents),
    projectedExpense: fromCents(summary.projectedExpenseCents),
    openReceivables: fromCents(summary.openReceivablesCents),
    netRealized: fromCents(summary.netRealizedCents),
    byPaymentMethod: summary.byPaymentMethod.map((item) => ({ ...item, amount: fromCents(item.amountCents) })),
    byEvent: summary.byEvent.map((item) => ({
      eventId: item.eventId,
      received: fromCents(item.receivedCents),
      receivable: fromCents(item.receivableCents),
      costs: fromCents(item.costsCents),
    })),
    excludedCancelled: summary.excludedCancelled,
  });
});

import financeOfxRouter from './finance-ofx.routes';

router.use(financeOfxRouter);
router.use(financeMutationRouter);

export default router;

export { default as financeCategoryRoutes } from './finance-categories.routes';
export { default as invoiceRoutes } from './invoices.routes';
