import { access, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { Event, FactoryEvent, FranchiseEvent } from '../modules/events/events.model';
import { FactoryFinance, Finance, FranchiseFinance } from '../modules/finance/finance.model';
import { buildFinanceMigrationPlan } from '../infrastructure/services/financeMigration';
import { reconcileFinances, type ReconciliationAction } from '../infrastructure/services/financeReconciliation';

export type Unit = 'main' | 'franchise' | 'factory';

export const UNITS: Unit[] = ['main', 'franchise', 'factory'];
export const APPLY_CONFIRMATION = 'APLICAR_MIGRACAO_FINANCEIRA';
export const MIGRATABLE_ACTIONS: ReconciliationAction[] = [
  'add_amount_cents',
  'normalize_legacy_status',
  'migrate_legacy_settlement',
  'settle_automatic_deposit',
];

export function option(name: string, fallback = ''): string {
  const argument = process.argv.find((value) => value.startsWith(`--${name}=`));
  return argument ? argument.slice(name.length + 3) : fallback;
}

export function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

export function unitsOption(): Unit[] {
  const requested = option('units', UNITS.join(','))
    .split(',')
    .map((value) => value.trim())
    .filter((value): value is Unit => UNITS.includes(value as Unit));
  return requested.length > 0 ? requested : UNITS;
}

export function actionsOption(): ReconciliationAction[] | undefined {
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

export function modelsForUnit(unit: Unit) {
  if (unit === 'factory') return { finances: FactoryFinance, events: FactoryEvent };
  if (unit === 'franchise') return { finances: FranchiseFinance, events: FranchiseEvent };
  return { finances: Finance, events: Event };
}

export async function assertApplySafeguards(backupPath: string, rollbackPath: string) {
  if (option('confirm') !== APPLY_CONFIRMATION) {
    throw new Error('Para aplicar use --confirm=APLICAR_MIGRACAO_FINANCEIRA');
  }
  if (!backupPath) throw new Error('A aplicação exige --backup=CAMINHO_PARA_BACKUP_EXISTENTE');
  if (!rollbackPath) throw new Error('A aplicação exige --rollback=CAMINHO_PARA_ARQUIVO_DE_REVERSAO');
  await access(backupPath);
}

export { access };
