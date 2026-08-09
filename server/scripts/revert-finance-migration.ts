import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import mongoose from 'mongoose';
import { connectDB } from '../db';
import { FactoryFinance, Finance, FranchiseFinance } from '../routes/finances';

type Unit = 'main' | 'franchise' | 'factory';

interface RollbackEntry {
  unit: Unit;
  financeId: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  unsetOnRollback: string[];
}

interface RollbackArtifact {
  migrationVersion: string;
  entries: RollbackEntry[];
}

const REVERT_CONFIRMATION = 'REVERTER_MIGRACAO_FINANCEIRA';

function option(name: string, fallback = ''): string {
  const argument = process.argv.find((value) => value.startsWith(`--${name}=`));
  return argument ? argument.slice(name.length + 3) : fallback;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function financeModelForUnit(unit: Unit) {
  if (unit === 'factory') return FactoryFinance;
  if (unit === 'franchise') return FranchiseFinance;
  return Finance;
}

function buildRevertUpdate(entry: RollbackEntry) {
  const $set = Object.fromEntries(Object.entries(entry.before).filter(([, value]) => value !== undefined));
  const $unset = Object.fromEntries(entry.unsetOnRollback.map((field) => [field, 1]));
  return {
    ...(Object.keys($set).length > 0 ? { $set } : {}),
    ...(Object.keys($unset).length > 0 ? { $unset } : {}),
  };
}

async function main() {
  const rollbackPath = option('rollback').trim();
  const apply = hasFlag('apply');
  if (!rollbackPath) throw new Error('Informe --rollback=CAMINHO_PARA_ARQUIVO_DE_REVERSAO');
  if (apply && option('confirm') !== REVERT_CONFIRMATION) {
    throw new Error('Para reverter use --confirm=REVERTER_MIGRACAO_FINANCEIRA');
  }

  const artifact = JSON.parse(await readFile(resolve(process.cwd(), rollbackPath), 'utf8')) as RollbackArtifact;
  if (artifact.migrationVersion !== 'finance-migration-v1' || !Array.isArray(artifact.entries)) {
    throw new Error('Artefato de reversão inválido');
  }

  const report: Record<string, unknown> = {
    mode: apply ? 'revert' : 'preview-revert',
    rollbackPath: resolve(process.cwd(), rollbackPath),
    candidates: artifact.entries.length,
  };

  if (!apply) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }

  await connectDB();
  try {
    let reverted = 0;
    for (const entry of artifact.entries) {
      const filter = { _id: entry.financeId, ...entry.after };
      const result = await financeModelForUnit(entry.unit).updateOne(filter, buildRevertUpdate(entry));
      reverted += result.modifiedCount;
    }
    report.reverted = reverted;
    report.skipped = artifact.entries.length - reverted;
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
