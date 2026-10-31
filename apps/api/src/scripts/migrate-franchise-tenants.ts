import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { FranchiseModel } from '../modules/identity/franchise-policy';

export const FRANCHISE_COLLECTIONS = [
  'franchiseevents',
  'franchisefinances',
  'franchisetasks',
  'franchisetaskhistory',
  'franchiseemployees',
  'franchisecontractors',
  'franchisecontracts',
  'franchisemenus',
  'franchisesupplies',
  'franchiseutensils',
  'franchisecontractorcategories',
  'franchisesupplycategories',
  'franchiseutensilcategories',
  'auditlogs',
  'productionorders',
] as const;

export interface MigrationCollection {
  countDocuments(filter: Record<string, unknown>): Promise<number>;
  updateMany(filter: Record<string, unknown>, update: Record<string, unknown>): Promise<{ modifiedCount: number }>;
}

export interface MigrationResult {
  collection: string;
  pending: number;
  modified: number;
}

export async function migrateLegacyCollection(
  name: string,
  collection: MigrationCollection,
  franchiseId: string,
  apply: boolean,
  legacyFilter: Record<string, unknown> = {},
): Promise<MigrationResult> {
  const filter = { ...legacyFilter, franchiseId: { $exists: false } };
  const pending = await collection.countDocuments(filter);
  if (!apply || pending === 0) return { collection: name, pending, modified: 0 };
  const result = await collection.updateMany(filter, { $set: { franchiseId } });
  return { collection: name, pending, modified: result.modifiedCount };
}

export async function ensureItuFranchise(model: any = FranchiseModel): Promise<any> {
  const existing = (await model.findOne({ slug: 'itu' })) || (await model.findOne({ name: 'Itu' }));
  if (existing) {
    if (!existing.slug && model.updateOne) await model.updateOne({ _id: existing._id }, { $set: { slug: 'itu' } });
    return existing;
  }
  return model.create({ name: 'Itu', slug: 'itu', city: 'Itu', state: 'SP', status: 'ativa', unit: 'main' });
}

export function parseMigrationArgs(args: string[] = process.argv.slice(2)) {
  const slugIndex = args.indexOf('--slug');
  const slug = slugIndex >= 0 ? args[slugIndex + 1] : undefined;
  return { slug, apply: args.includes('--apply') };
}

export async function runMigration({ slug, apply }: { slug: string; apply: boolean }) {
  if (slug !== 'itu') throw new Error('Only the Itu migration is currently supported');
  await connectDatabase();
  const franchise =
    (await FranchiseModel.findOne({ slug })) ||
    (await FranchiseModel.findOne({ name: 'Itu' })) ||
    (apply ? await ensureItuFranchise() : null);
  if (!franchise) {
    console.log('Prévia: a franquia Itu será criada quando --apply for informado.');
  }
  const franchiseId = franchise?._id.toString() || '000000000000000000000000';
  const db = mongoose.connection.db!;
  const results: MigrationResult[] = [];
  for (const name of FRANCHISE_COLLECTIONS) {
    const filter =
      name === 'auditlogs'
        ? { userUnit: 'franchise' }
        : name === 'productionorders'
          ? { eventSource: 'franchise' }
          : {};
    results.push(await migrateLegacyCollection(name, db.collection(name), franchiseId, apply, filter));
  }
  const users = await migrateLegacyCollection('users', db.collection('users'), franchiseId, apply, {
    unit: 'franchise',
  });
  results.push(users);
  console.table(results);
  await mongoose.disconnect();
  return results;
}

if (/[\\/]migrate-franchise-tenants\.(ts|js)$/.test(process.argv[1] || '')) {
  const options = parseMigrationArgs();
  if (!options.slug) {
    console.error('Usage: pnpm migrate:franchise-tenants -- --slug itu [--apply]');
    process.exit(1);
  }
  runMigration({ slug: options.slug, apply: options.apply }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
