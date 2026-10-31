import mongoose from 'mongoose';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { connectDatabase } from '../config/database';
import { buildFinanceMigrationPlan } from '../infrastructure/services/financeMigration';
import { reconcileFinances, type ReconciliationAction } from '../infrastructure/services/financeReconciliation';
import {
  APPLY_CONFIRMATION,
  MIGRATABLE_ACTIONS,
  UNITS,
  actionsOption,
  assertApplySafeguards,
  hasFlag,
  modelsForUnit,
  option,
  type Unit,
  unitsOption,
} from './migrate-finances-options';

async function main() {
  const start = option('start', '2026-06-01');
  const end = option('end', '2026-07-31');
  const requestedActions = actionsOption();
  const isStatusOnlyMigration = requestedActions?.length === 1 && requestedActions[0] === 'normalize_legacy_status';
  const isAutomaticDepositOnlyMigration =
    requestedActions?.length === 1 && requestedActions[0] === 'settle_automatic_deposit';
  const isGlobalMigration = isStatusOnlyMigration || isAutomaticDepositOnlyMigration;
  const units: Unit[] = isAutomaticDepositOnlyMigration ? ['main', 'franchise'] : unitsOption();
  const reconciliationStart = isGlobalMigration ? '' : start;
  const reconciliationEnd = isGlobalMigration ? '\uffff' : end;
  const apply = hasFlag('apply');
  const backupPath = option('backup').trim();
  const rollbackPath = option('rollback').trim();
  const migratedAt = new Date().toISOString();

  if (apply) await assertApplySafeguards(backupPath, rollbackPath);

  await connectDatabase();
  try {
    const groups = await Promise.all(
      units.map(async (unit) => {
        const { finances, events } = modelsForUnit(unit);
        const [financeRows, eventRows] = await Promise.all([
          finances
            .find(
              isStatusOnlyMigration
                ? { status: 'received' }
                : isAutomaticDepositOnlyMigration
                  ? {
                      kind: 'deposit',
                      automatic: true,
                      status: { $in: ['pending', 'paid'] },
                      settlementStatus: { $ne: 'cancelled' },
                    }
                  : {
                      $or: [
                        { date: { $gte: start, $lte: end } },
                        { 'settlements.settledOn': { $gte: start, $lte: end } },
                      ],
                    },
            )
            .lean(),
          events.find({ status: 'cancelled' }).lean(),
        ]);
        const normalizedFinances = financeRows.map((entry: any) => ({
          ...entry,
          id: entry.id || entry._id.toString(),
          source: entry.source || unit,
        }));
        const findings = reconcileFinances(
          normalizedFinances,
          eventRows.map((entry: any) => ({ id: entry.id || entry._id.toString(), status: entry.status })),
          reconciliationStart,
          reconciliationEnd,
        );
        const actionsByFinanceId = new Map<string, (typeof findings)[number]['action'][]>();
        for (const finding of findings) {
          const actions = actionsByFinanceId.get(finding.financeId) || [];
          actions.push(finding.action);
          actionsByFinanceId.set(finding.financeId, actions);
        }
        return {
          unit,
          finances,
          plans: normalizedFinances
            .map((finance) => {
              const actions = actionsByFinanceId.get(finance.id) || [];
              const selectedActions = requestedActions
                ? actions.filter((action) => requestedActions.includes(action))
                : actions;
              return buildFinanceMigrationPlan(finance, selectedActions, migratedAt);
            })
            .filter((plan): plan is NonNullable<typeof plan> => plan !== null),
        };
      }),
    );

    const plans = groups.flatMap((group) => group.plans.map((plan) => ({ unit: group.unit, plan })));
    const report: Record<string, unknown> = {
      mode: apply ? 'apply' : 'preview',
      period: { start, end },
      units,
      totals: { candidates: plans.length },
      plans: plans.map(({ unit, plan }) => ({ unit, ...plan })),
    };

    if (apply) {
      const absoluteRollbackPath = resolve(process.cwd(), rollbackPath);
      const rollback = {
        migrationVersion: 'finance-migration-v1',
        createdAt: migratedAt,
        backupReference: resolve(process.cwd(), backupPath),
        entries: plans.map(({ unit, plan }) => ({
          unit,
          financeId: plan.financeId,
          before: plan.before,
          after: plan.update.$set,
          unsetOnRollback: Object.entries(plan.before)
            .filter(([, value]) => value === undefined)
            .map(([field]) => field),
        })),
      };
      await writeFile(absoluteRollbackPath, `${JSON.stringify(rollback, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });

      let applied = 0;
      for (const { unit, plan } of plans) {
        const { finances } = modelsForUnit(unit);
        const result = await finances.updateOne(plan.filter, plan.update);
        applied += result.modifiedCount;
      }
      report.applied = applied;
      report.rollbackPath = absoluteRollbackPath;
      report.backupReference = resolve(process.cwd(), backupPath);
    }

    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
