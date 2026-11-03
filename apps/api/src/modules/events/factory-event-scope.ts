import { FranchiseModel } from '../identity/franchise-policy';

const FACTORY_FRANCHISE_LOCATIONS = new Set(['sorocaba', 'itu']);

function normalizeTokens(value: unknown): string[] {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function isFactoryFranchise(franchise: { name?: string; slug?: string; city?: string }): boolean {
  return [franchise.name, franchise.slug, franchise.city].some((value) =>
    normalizeTokens(value).some((token) => FACTORY_FRANCHISE_LOCATIONS.has(token)),
  );
}

export async function getFactoryFranchiseIds(): Promise<unknown[]> {
  const franchises = await FranchiseModel.find({ deletedAt: { $exists: false } })
    .select('_id name slug city')
    .lean();

  return franchises.filter((franchise: any) => isFactoryFranchise(franchise)).map((franchise: any) => franchise._id);
}

export async function getFactoryFranchiseFilter(filter: Record<string, unknown> = {}) {
  const franchiseIds = await getFactoryFranchiseIds();
  return { ...filter, franchiseId: { $in: franchiseIds } };
}
