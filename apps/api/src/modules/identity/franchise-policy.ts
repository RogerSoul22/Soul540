import mongoose, { Schema, type Model } from 'mongoose';

export const ACTIVE_FRANCHISE_STATUSES = ['ativa', 'em_implantacao', 'congelada'] as const;

const FranchiseSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    owner: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: 'SP' },
    monthlyFee: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['ativa', 'em_implantacao', 'suspensa', 'congelada', 'encerrada'],
      default: 'em_implantacao',
    },
    openDate: { type: String, default: '' },
    unit: { type: String, default: 'main' },
    deletedAt: { type: Date, index: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true, versionKey: false } },
);

export const FranchiseModel = (mongoose.models.Franchise || mongoose.model('Franchise', FranchiseSchema)) as Model<any>;

export type FranchiseLookupModel = {
  findOne(query: Record<string, unknown>): any;
};

export function normalizeFranchiseSlug(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  if (!slug) throw new Error('Franchise name must produce a valid slug');
  return slug;
}

export function assertFranchiseUserLink(unit: string, franchiseId?: string): string | undefined {
  if (unit === 'franchise' && !franchiseId) throw new Error('franchiseId is required');
  if (unit !== 'franchise' && franchiseId) throw new Error('franchiseId is not allowed');
  if (franchiseId && !mongoose.isValidObjectId(franchiseId)) {
    throw new Error('Invalid franchiseId');
  }
  return franchiseId;
}

async function resolveQuery(result: any): Promise<any> {
  return typeof result?.lean === 'function' ? result.lean() : result;
}

export async function ensureUniqueFranchiseSlug(
  slug: string,
  excludeId?: string,
  model: FranchiseLookupModel = FranchiseModel,
): Promise<void> {
  const query: Record<string, unknown> = { slug, deletedAt: { $exists: false } };
  if (excludeId) query._id = { $ne: excludeId };
  if (await resolveQuery(model.findOne(query))) throw new Error('Franchise slug already exists');
}

export async function getActiveFranchiseOrThrow(
  id: string,
  model: FranchiseLookupModel = FranchiseModel,
): Promise<any> {
  if (!mongoose.isValidObjectId(id)) throw new Error('Franchise not found or inactive');
  const franchise = await resolveQuery(
    model.findOne({
      _id: id,
      status: { $in: ACTIVE_FRANCHISE_STATUSES },
      deletedAt: { $exists: false },
    }),
  );
  if (!franchise) throw new Error('Franchise not found or inactive');
  return franchise;
}
