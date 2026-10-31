import { Router } from 'express';
import mongoose, { Schema, Model } from 'mongoose';
import { getTenantUnit } from './middleware/tenant';
import { getFranchiseFilter, injectFranchiseScope } from './franchise-scope';
import { requirePermission } from './middleware/permissions';

type SchemaFields = Record<string, any>;

export interface TenantModels {
  Main: Model<any>;
  Franchise: Model<any>;
  Factory: Model<any>;
  getModel(req: any): Model<any>;
  getSource(req: any): string;
  getFilter(req: any, filter?: Record<string, unknown>): Record<string, unknown>;
  withScope(req: any, data: Record<string, unknown>): Record<string, unknown>;
}

export function createTenantModels(
  baseName: string,
  baseFields: SchemaFields,
  collections: { main: string; franchise: string; factory: string },
  options: {
    withSource?: boolean;
    overrides?: { franchise?: SchemaFields; factory?: SchemaFields };
  } = {},
): TenantModels {
  const { withSource = true, overrides = {} } = options;

  function buildSchema(source: string, collection: string, fieldOverrides: SchemaFields = {}) {
    const fields: SchemaFields = {
      ...baseFields,
      ...fieldOverrides,
      ...(withSource ? { source: { type: String, default: source } } : {}),
      ...(source === 'franchise'
        ? {
            franchiseId: { type: Schema.Types.ObjectId, ref: 'Franchise', index: true },
          }
        : {}),
      deletedAt: { type: Date, index: true },
    };
    return new Schema(fields, { collection, toJSON: { virtuals: true, versionKey: false } });
  }

  const Main = (mongoose.models[baseName] ||
    mongoose.model(baseName, buildSchema('main', collections.main))) as Model<any>;
  const Franchise = (mongoose.models[`Franchise${baseName}`] ||
    mongoose.model(
      `Franchise${baseName}`,
      buildSchema('franchise', collections.franchise, overrides.franchise),
    )) as Model<any>;
  const Factory = (mongoose.models[`Factory${baseName}`] ||
    mongoose.model(`Factory${baseName}`, buildSchema('factory', collections.factory, overrides.factory))) as Model<any>;

  return {
    Main,
    Franchise,
    Factory,
    getModel(req: any): Model<any> {
      const unit = getTenantUnit(req);
      if (unit === 'factory') return Factory;
      if (unit === 'franchise') return Franchise;
      return Main;
    },
    getSource(req: any): string {
      const unit = getTenantUnit(req);
      if (unit === 'factory') return 'factory';
      if (unit === 'franchise') return 'franchise';
      return 'main';
    },
    getFilter(req: any, filter = {}) {
      return getFranchiseFilter(req, { deletedAt: { $exists: false }, ...filter });
    },
    withScope(req: any, data) {
      const { deletedAt: _deletedAt, ...safeData } = data;
      return injectFranchiseScope(req, safeData);
    },
  };
}

export function createCategoryRouter(
  baseName: string,
  collections: { main: string; franchise: string; factory: string },
  permission = 'estoque',
): Router {
  function buildCategorySchema(collection: string) {
    const schema = new Schema(
      {
        name: { type: String, required: true },
        franchiseId: { type: Schema.Types.ObjectId, ref: 'Franchise', index: true },
        deletedAt: { type: Date, index: true },
      },
      { collection, toJSON: { virtuals: true, versionKey: false } },
    );
    schema.index(
      { franchiseId: 1, name: 1 },
      { unique: true, partialFilterExpression: { franchiseId: { $exists: true } } },
    );
    return schema;
  }

  const Main = (mongoose.models[baseName] ||
    mongoose.model(baseName, buildCategorySchema(collections.main))) as Model<any>;
  const Franchise = (mongoose.models[`Franchise${baseName}`] ||
    mongoose.model(`Franchise${baseName}`, buildCategorySchema(collections.franchise))) as Model<any>;
  const Factory = (mongoose.models[`Factory${baseName}`] ||
    mongoose.model(`Factory${baseName}`, buildCategorySchema(collections.factory))) as Model<any>;

  function getModel(req: any) {
    const unit = getTenantUnit(req);
    if (unit === 'factory') return Factory;
    if (unit === 'franchise') return Franchise;
    return Main;
  }

  const router = Router();
  router.use(requirePermission(permission, 'read'));

  router.get('/', async (req, res) => {
    const cats = await getModel(req)
      .find(getFranchiseFilter(req, { deletedAt: { $exists: false } }))
      .sort({ name: 1 });
    res.json(cats.map((c: { name: string }) => c.name));
  });

  router.post('/', requirePermission(permission, 'write'), async (req, res) => {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'name required' });
    const cat = await getModel(req).findOneAndUpdate(
      getFranchiseFilter(req, { deletedAt: { $exists: false }, name: name.trim() }),
      injectFranchiseScope(req, { name: name.trim() }),
      { upsert: true, new: true },
    );
    res.status(201).json(cat.name);
  });

  router.delete('/', requirePermission(permission, 'write'), async (req, res) => {
    const { name } = req.body;
    await getModel(req).updateOne(getFranchiseFilter(req, { deletedAt: { $exists: false }, name }), {
      $set: { deletedAt: new Date() },
    });
    res.status(204).end();
  });

  return router;
}
