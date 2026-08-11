import { getSaoPauloDate, isDateOnly } from '../../shared/financeDates';
import type { FinanceSettlement, FinancePolicyEntry } from '../../shared/financePolicy';
import type { ReconciliationAction } from './financeReconciliation';

export interface LegacyFinanceForMigration extends FinancePolicyEntry {
  id: string;
  settledAt?: string;
  settledCents?: number;
  kind?: string;
  automatic?: boolean;
}

export interface FinanceMigrationPlan {
  financeId: string;
  actions: Array<'add_amount_cents' | 'normalize_legacy_status' | 'migrate_legacy_settlement' | 'settle_automatic_deposit'>;
  filter: Record<string, unknown>;
  update: { $set: Record<string, unknown> };
  before: Pick<LegacyFinanceForMigration, 'amountCents' | 'settledCents' | 'settlements' | 'settlementStatus' | 'status' | 'settledAt'>;
}

function getExactAmountCents(finance: LegacyFinanceForMigration): number | null {
  if (!Number.isFinite(finance.amount)) return null;
  const cents = Math.round(Number(finance.amount) * 100);
  return Math.abs(Number(finance.amount) * 100 - cents) < 0.000001 ? cents : null;
}

function getLegacySettlement(finance: LegacyFinanceForMigration, amountCents: number, migratedAt: string): FinanceSettlement | null {
  const settledOn = finance.settledAt ? getSaoPauloDate(finance.settledAt) : finance.date;
  if (!isDateOnly(settledOn)) return null;
  const id = `migration-v1:${finance.id}:legacy-settlement`;
  return {
    id,
    amountCents,
    settledOn,
    settledAt: finance.settledAt || migratedAt,
    idempotencyKey: id,
    reason: 'Migração de baixa legada',
  };
}

function getAutomaticDepositSettlement(finance: LegacyFinanceForMigration, amountCents: number, migratedAt: string): FinanceSettlement | null {
  if (!isDateOnly(finance.date)) return null;
  const id = `migration-v1:${finance.id}:automatic-deposit`;
  const settledAt = finance.settledAt || migratedAt;
  return {
    id,
    amountCents,
    settledOn: finance.date,
    settledAt,
    idempotencyKey: id,
    reason: 'Migra\u00e7\u00e3o de sinal autom\u00e1tico',
  };
}

export function buildFinanceMigrationPlan(
  finance: LegacyFinanceForMigration,
  reconciliationActions: ReconciliationAction[],
  migratedAt: string,
): FinanceMigrationPlan | null {
  const actions: FinanceMigrationPlan['actions'] = [];
  const update: Record<string, unknown> = {};
  const amountCents = getExactAmountCents(finance);
  const shouldAddAmountCents = reconciliationActions.includes('add_amount_cents') && !Number.isSafeInteger(finance.amountCents);
  const shouldNormalizeLegacyStatus = reconciliationActions.includes('normalize_legacy_status') && finance.status === 'received';
  const shouldMigrateSettlement = reconciliationActions.includes('migrate_legacy_settlement') && !Array.isArray(finance.settlements);
  const hasSettlementDetails = Array.isArray(finance.settlements) && finance.settlements.length > 0;
  const needsAutomaticDepositAmountCents = amountCents !== null && finance.amountCents !== amountCents;
  const shouldCanonicalizeAutomaticDeposit = reconciliationActions.includes('settle_automatic_deposit')
    && finance.kind === 'deposit'
    && finance.automatic === true
    && (finance.status === 'pending' || finance.status === 'paid')
    && finance.settlementStatus !== 'cancelled'
    && amountCents !== null
    && (!hasSettlementDetails || needsAutomaticDepositAmountCents);

  if (shouldAddAmountCents && amountCents !== null) {
    actions.push('add_amount_cents');
    update.amountCents = amountCents;
  }

  if (shouldNormalizeLegacyStatus) {
    actions.push('normalize_legacy_status');
    update.status = 'paid';
  }

  if (shouldMigrateSettlement && amountCents !== null) {
    const settlement = getLegacySettlement(finance, amountCents, migratedAt);
    if (settlement) {
      actions.push('migrate_legacy_settlement');
      update.settledCents = amountCents;
      update.settlements = [settlement];
      update.settlementStatus = 'settled';
    }
  }

  if (shouldCanonicalizeAutomaticDeposit && amountCents !== null) {
    if (needsAutomaticDepositAmountCents) {
      actions.push('settle_automatic_deposit');
      update.amountCents = amountCents;
    }

    if (!hasSettlementDetails) {
      const settlement = getAutomaticDepositSettlement(finance, amountCents, migratedAt);
      if (settlement) {
        if (!actions.includes('settle_automatic_deposit')) actions.push('settle_automatic_deposit');
        update.status = 'paid';
        update.settlementStatus = 'settled';
        update.settledCents = amountCents;
        update.settledAt = settlement.settledAt;
        update.settlements = [settlement];
      }
    }
  }

  if (actions.length === 0) return null;

  const filter: Record<string, unknown> = { _id: finance.id };
  if (actions.includes('normalize_legacy_status')) filter.status = 'received';
  if (actions.includes('migrate_legacy_settlement')) filter.settlements = { $exists: false };
  if (actions.includes('settle_automatic_deposit')) {
    filter.kind = 'deposit';
    filter.automatic = true;
    filter.status = finance.status;
    filter.amount = finance.amount;
    if (!hasSettlementDetails) filter['settlements.0'] = { $exists: false };
    if (needsAutomaticDepositAmountCents) {
      filter.amountCents = finance.amountCents === undefined ? { $exists: false } : finance.amountCents;
    }
  }

  return {
    financeId: finance.id,
    actions,
    filter,
    update: { $set: update },
    before: {
      amountCents: finance.amountCents,
      settledCents: finance.settledCents,
      settlements: finance.settlements,
      settlementStatus: finance.settlementStatus,
      status: finance.status,
      settledAt: finance.settledAt,
    },
  };
}
