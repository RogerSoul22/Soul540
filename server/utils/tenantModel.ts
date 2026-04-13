import { Router } from 'express';
import mongoose, { Schema, Model } from 'mongoose';
import { getTenantUnit } from '../middleware/tenant';

type SchemaFields = Record<string, any>;

export interface TenantModels {
  Main: Model<any>;
  Franchise: Model<any>;
  Factory: Model<any>;
  getModel(req: any): Model<any>;
  getSource(req: any): string;
  findInAll(id: string): Promise<{ doc: any; model: Model<any> } | null>;
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
    };
    return new Schema(fields, { collection, toJSON: { virtuals: true, versionKey: false } });
  }

  const Main = (mongoose.models[baseName] ||
    mongoose.model(baseName, buildSchema('main', collections.main))) as Model<any>;
  const Franchise = (mongoose.models[`Franchise${baseName}`] ||
    mongoose.model(`Franchise${baseName}`, buildSchema('franchise', collections.franchise, overrides.franchise))) as Model<any>;
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
    async findInAll(id: string) {
      const doc = await Main.findById(id);
      if (doc) return { doc, model: Main };
      const fdoc = await Franchise.findById(id);
      if (fdoc) return { doc: fdoc, model: Franchise };
      const factDoc = await Factory.findById(id);
      if (factDoc) return { doc: factDoc, model: Factory };
      return null;
    },
  };
}

export function createCategoryRouter(
  baseName: string,
  collections: { main: string; franchise: string; factory: string },
): Router {
  function buildCategorySchema(collection: string) {
    return new Schema(
      { name: { type: String, required: true, unique: true } },
      { collection, toJSON: { virtuals: true, versionKey: false } },
    );
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

  router.get('/', async (req, res) => {
    const cats = await getModel(req).find().sort({ name: 1 });
    res.json(cats.map((c: { name: string }) => c.name));
  });

  router.post('/', async (req, res) => {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'name required' });
    const cat = await getModel(req).findOneAndUpdate(
      { name: name.trim() },
      { name: name.trim() },
      { upsert: true, new: true },
    );
    res.status(201).json(cat.name);
  });

  router.delete('/', async (req, res) => {
    const { name } = req.body;
    await getModel(req).deleteOne({ name });
    res.status(204).end();
  });

  return router;
}
