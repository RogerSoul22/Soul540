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
  getAuthenticatedUserId,
  getFinanceModelForUnit,
  getFinanceModelsForRequest,
  getFinanceFilter,
} from './finance-tenant';
import { injectFranchiseScope } from '../../infrastructure/franchise-scope';
import { linkOfxTransaction, serializeFinanceEntry } from './finance-settlements';
import { requirePermission } from '../../infrastructure/middleware/permissions';
const router = Router();
router.use(requirePermission('financeiro', 'write'));

router.post('/ofx/preview', validate(previewOfxSchema), async (req, res) => {
  const source = getTenantUnit(req);
  const model = getFinanceModelForUnit(source);
  const parsed = parseOfxTransactions(req.body.ofxText);
  const finances = await model.find(getFinanceFilter(req, model, { source, reversedAt: { $exists: false } })).lean();
  const suggestions = buildOfxSuggestions(parsed.transactions, finances as any[]);
  res.json({
    bankAccount: parsed.bankAccount,
    statementBalance: parsed.statementBalance,
    suggestions,
  });
});

router.post('/ofx/import', validate(importOfxSchema), async (req, res) => {
  const source = getTenantUnit(req) as 'main' | 'franchise' | 'factory';
  const model = getFinanceModelForUnit(source);
  const parsed = parseOfxTransactions(req.body.ofxText);
  const finances = await model.find(getFinanceFilter(req, model, { source, reversedAt: { $exists: false } })).lean();
  const suggestions = buildOfxSuggestions(parsed.transactions, finances as any[]);
  const selections = new Map(req.body.selections.map((selection: any) => [selection.externalId, selection]));
  const importBatchId = `ofx-${randomUUID()}`;
  const settledBy = getAuthenticatedUserId(req);
  const results: Array<Record<string, unknown>> = [];

  for (const suggestion of suggestions) {
    const selection = selections.get(suggestion.externalId) as { category?: string; financeId?: string } | undefined;
    if (!selection) continue;
    if (suggestion.decision === 'duplicate') {
      results.push({ externalId: suggestion.externalId, action: 'ignored_duplicate', financeId: suggestion.financeId });
      continue;
    }
    if (suggestion.decision === 'ambiguous' && !selection.financeId) {
      results.push({ externalId: suggestion.externalId, action: 'needs_decision' });
      continue;
    }

    if (suggestion.decision === 'link' || selection.financeId) {
      const financeId = selection.financeId || suggestion.financeId;
      if (!financeId) {
        results.push({ externalId: suggestion.externalId, action: 'needs_decision' });
        continue;
      }
      const outcome = await linkOfxTransaction(model, suggestion, financeId, settledBy, getFinanceFilter(req, model));
      if (outcome.kind === 'error') {
        results.push({ externalId: suggestion.externalId, action: 'conflict', error: outcome.error });
        continue;
      }
      if (outcome.kind === 'created') {
        await logAudit({
          req,
          action: 'update',
          resource: 'finances',
          resourceId: outcome.finance.id,
          description: `Conciliou extrato OFX em ${suggestion.date}: ${outcome.finance.description}`,
        });
      }
      results.push({
        externalId: suggestion.externalId,
        action: outcome.kind === 'created' ? 'linked' : 'ignored_duplicate',
        financeId: outcome.finance.id,
      });
      continue;
    }

    const existing = await model.exists(
      getFinanceFilter(req, model, {
        $or: [{ externalId: suggestion.externalId }, { 'settlements.externalId': suggestion.externalId }],
      }),
    );
    if (existing) {
      results.push({ externalId: suggestion.externalId, action: 'ignored_duplicate' });
      continue;
    }
    try {
      const finance = await model.create(
        injectFranchiseScope(
          req,
          buildBankImportPayload(suggestion, {
            source,
            bankAccount: parsed.bankAccount,
            bankStatementBalance: parsed.statementBalance,
            importBatchId,
            settledBy,
            category: selection.category,
          }),
        ),
      );
      await logAudit({
        req,
        action: 'create',
        resource: 'finances',
        resourceId: finance.id,
        description: `Importou movimento OFX: ${finance.description}`,
      });
      results.push({ externalId: suggestion.externalId, action: 'created_unclassified', financeId: finance.id });
    } catch (error: any) {
      if (error?.code === 11000) {
        results.push({ externalId: suggestion.externalId, action: 'ignored_duplicate' });
        continue;
      }
      throw error;
    }
  }

  res.status(201).json({
    bankAccount: parsed.bankAccount,
    statementBalance: parsed.statementBalance,
    importBatchId,
    results,
  });
});

export default router;
