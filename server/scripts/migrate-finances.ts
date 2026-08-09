import { access, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import mongoose from 'mongoose';
import { connectDB } from '../db';
import { Event, FactoryEvent, FranchiseEvent } from '../routes/events';
import { FactoryFinance, Finance, FranchiseFinance } from '../routes/finances';
import { buildFinanceMigrationPlan } from '../services/financeMigration';
import { reconcileFinances, type ReconciliationAction } from '../services/financeReconciliation';

type Unit = 'main' | 'franchise' | 'factory';

const UNITS: Unit[] = ['main', 'franchise', 'factory'];
const APPLY_CONFIRMATION = 'APLICAR_MIGRACAO_FINANCEIRA';
const MIGRATABLE_ACTIONS: ReconciliationAction[] = [
  'add_amount_cents',
  'normalize_legacy_status',
  'migrate_legacy_settlement',
];

function option(name: string, fallback = ''): string {
  const argument = process.argv.find((value) => value.startsWith(`--${name}=`));
  return argument ? argument.slice(name.length + 3) : fallback;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function unitsOption(): Unit[] {
  const requested = option('units', UNITS.join(','))
    .split(',')
    .map((value) => value.trim())
    .filter((value): value is Unit => UNITS.includes(value as Unit));
  return requested.length > 0 ? requested : UNITS;
}

function actionsOption(): ReconciliationAction[] | undefined {
  const raw = option('actions').trim();
  if (!raw) return undefined;
  const actions = raw
    .split(',')
    .map((value) => value.trim())
    .filter((value): value is ReconciliationAction => MIGRATABLE_ACTIONS.includes(value as ReconciliationAction));
  if (actions.length === 0) {
    throw new Error(`Use --actions=${MIGRATABLE_ACTIONS.join(',')}`);
  }
  return actions;
}

function modelsForUnit(unit: Unit) {
  if (unit === 'factory') return { finances: FactoryFinance, events: FactoryEvent };
  if (unit === 'franchise') return { finances: FranchiseFinance, events: FranchiseEvent };
  return { finances: Finance, events: Event };
}

async function assertApplySafeguards(backupPath: string, rollbackPath: string) {
  if (option('confirm') !== APPLY_CONFIRMATION) {
    throw new Error('Para aplicar use --confirm=APLICAR_MIGRACAO_FINANCEIRA');
  }
  if (!backupPath) throw new Error('A aplicação exige --backup=CAMINHO_PARA_BACKUP_EXISTENTE');
  if (!rollbackPath) throw new Error('A aplicação exige --rollback=CAMINHO_PARA_ARQUIVO_DE_REVERSAO');
  await access(backupPath);
}

async function main() {
  const start = option('start', '2026-06-01');
  const end = option('end', '2026-07-31');
  const units = unitsOption();
  const requestedActions = actionsOption();
  const isStatusOnlyMigration = requestedActions?.length === 1 && requestedActions[0] === 'normalize_legacy_status';
  const reconciliationStart = isStatusOnlyMigration ? '' : start;
  const reconciliationEnd = isStatusOnlyMigration ? '\uffff' : end;
  const apply = hasFlag('apply');
  const backupPath = option('backup').trim();
  const rollbackPath = option('rollback').trim();
  const migratedAt = new Date().toISOString();

  if (apply) await assertApplySafeguards(backupPath, rollbackPath);

  await connectDB();
  try {
    const groups = await Promise.all(units.map(async (unit) => {
      const { finances, events } = modelsForUnit(unit);
      const [financeRows, eventRows] = await Promise.all([
        finances.find(isStatusOnlyMigration
          ? { status: 'received' }
          : {
            $or: [
              { date: { $gte: start, $lte: end } },
              { 'settlements.settledOn': { $gte: start, $lte: end } },
            ],
          }).lean(),
        events.find({ status: 'cancelled' }).lean(),
      ]);
      const normalizedFinances = financeRows.map((entry: any) => ({ ...entry, id: entry.id || entry._id.toString(), source: entry.source || unit }));
      const findings = reconcileFinances(
        normalizedFinances,
        eventRows.map((entry: any) => ({ id: entry.id || entry._id.toString(), status: entry.status })),
        reconciliationStart,
        reconciliationEnd,
      );
      const actionsByFinanceId = new Map<string, typeof findings[number]['action'][]>();
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
    }));

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
