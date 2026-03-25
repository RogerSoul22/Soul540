import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';
import { getTenantUnit } from '../middleware/tenant';

const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
}, { toJSON: { virtuals: true, versionKey: false } });

const FranchiseCategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
}, { collection: 'franchiseutensilcategories', toJSON: { virtuals: true, versionKey: false } });

const FactoryCategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
}, { collection: 'factoryutensilcategories', toJSON: { virtuals: true, versionKey: false } });

const Category = mongoose.models.UtensilCategory || mongoose.model('UtensilCategory', CategorySchema);
const FranchiseCategory = mongoose.models.FranchiseUtensilCategory || mongoose.model('FranchiseUtensilCategory', FranchiseCategorySchema);
const FactoryCategory = mongoose.models.FactoryUtensilCategory || mongoose.model('FactoryUtensilCategory', FactoryCategorySchema);

function getModel(req: any) {
  const unit = getTenantUnit(req);
  if (unit === 'factory') return FactoryCategory;
  if (unit === 'franchise') return FranchiseCategory;
  return Category;
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

export default router;
