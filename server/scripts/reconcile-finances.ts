import mongoose from 'mongoose';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { connectDB } from '../db';
import { Event, FactoryEvent, FranchiseEvent } from '../routes/events';
import { FactoryFinance, Finance, FranchiseFinance } from '../routes/finances';
import { reconcileFinances, reconciliationFindingsToCsv } from '../services/financeReconciliation';

type Unit = 'main' | 'franchise' | 'factory';

const UNITS: Unit[] = ['main', 'franchise', 'factory'];

function option(name: string, fallback: string): string {
  const argument = process.argv.find((value) => value.startsWith(`--${name}=`));
  return argument ? argument.slice(name.length + 3) : fallback;
}

function unitsOption(): Unit[] {
  const requested = option('units', UNITS.join(','))
    .split(',')
    .map((value) => value.trim())
    .filter((value): value is Unit => UNITS.includes(value as Unit));
  return requested.length > 0 ? requested : UNITS;
}

function modelsForUnit(unit: Unit) {
  if (unit === 'factory') return { finances: FactoryFinance, events: FactoryEvent };
  if (unit === 'franchise') return { finances: FranchiseFinance, events: FranchiseEvent };
  return { finances: Finance, events: Event };
}

async function main() {
  const start = option('start', '2026-06-01');
  const end = option('end', '2026-07-31');
  const units = unitsOption();
  const csvPath = option('csv', '').trim();

  await connectDB();
  try {
    const groups = await Promise.all(units.map(async (unit) => {
      const { finances, events } = modelsForUnit(unit);
      const [financeRows, eventRows] = await Promise.all([
        finances.find({
          $or: [
            { date: { $lte: end } },
            { 'settlements.settledOn': { $gte: start, $lte: end } },
          ],
        }).lean(),
        events.find({ status: 'cancelled' }).lean(),
      ]);
      return {
        unit,
        finances: financeRows.map((entry: any) => ({ ...entry, id: entry.id || entry._id.toString(), source: entry.source || unit })),
        events: eventRows.map((entry: any) => ({ id: entry.id || entry._id.toString(), status: entry.status })),
      };
    }));

    const findings = groups.flatMap((group) => reconcileFinances(group.finances, group.events, start, end));
    const byAction = findings.reduce<Record<string, number>>((summary, finding) => {
      summary[finding.action] = (summary[finding.action] || 0) + 1;
      return summary;
    }, {});

    const report: Record<string, unknown> = {
      mode: 'read-only',
      period: { start, end },
      units,
      totals: { findings: findings.length, byAction },
      findings,
    };
    if (csvPath) {
      const absoluteCsvPath = resolve(process.cwd(), csvPath);
      await writeFile(absoluteCsvPath, reconciliationFindingsToCsv(findings), 'utf8');
      report.artifact = { csvPath: absoluteCsvPath, note: 'Arquivo gerado sem alterar lançamentos financeiros' };
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
