import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';
import { getTenantUnit } from '../middleware/tenant';

const MenuItemSchema = new Schema({
  id: String,
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  price: { type: Number, default: 0 },
}, { _id: false });

const MenuCategorySchema = new Schema({
  id: String,
  name: { type: String, default: '' },
  items: [MenuItemSchema],
}, { _id: false });

const MenuSchema = new Schema({
  name: String,
  eventId: { type: String, default: '' },
  headerText: { type: String, default: '' },
  footerText: { type: String, default: '' },
  categories: [MenuCategorySchema],
  source: { type: String, default: 'main' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { collection: 'menus', toJSON: { virtuals: true, versionKey: false } });

const FranchiseMenuSchema = new Schema({
  name: String,
  eventId: { type: String, default: '' },
  headerText: { type: String, default: '' },
  footerText: { type: String, default: '' },
  categories: [MenuCategorySchema],
  source: { type: String, default: 'franchise' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { collection: 'franchisemenus', toJSON: { virtuals: true, versionKey: false } });

const FactoryMenuSchema = new Schema({
  name: String,
  eventId: { type: String, default: '' },
  headerText: { type: String, default: '' },
  footerText: { type: String, default: '' },
  categories: [MenuCategorySchema],
  source: { type: String, default: 'factory' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { collection: 'factorymenus', toJSON: { virtuals: true, versionKey: false } });

const Menu = mongoose.models.Menu || mongoose.model('Menu', MenuSchema);
const FranchiseMenu = mongoose.models.FranchiseMenu || mongoose.model('FranchiseMenu', FranchiseMenuSchema);
const FactoryMenu = mongoose.models.FactoryMenu || mongoose.model('FactoryMenu', FactoryMenuSchema);

function isFromFranchise(req: any): boolean {
  return getTenantUnit(req) === 'franchise';
}

function isFromFactory(req: any): boolean {
  return getTenantUnit(req) === 'factory';
}

async function findInAllCollections(id: string) {
  const doc = await Menu.findById(id);
  if (doc) return { doc, model: Menu };
  const fdoc = await FranchiseMenu.findById(id);
  if (fdoc) return { doc: fdoc, model: FranchiseMenu };
  const factDoc = await FactoryMenu.findById(id);
  if (factDoc) return { doc: factDoc, model: FactoryMenu };
  return null;
}

const router = Router();

router.get('/', async (req, res) => {
  if (isFromFactory(req)) {
    const items = await FactoryMenu.find({});
    return res.json(items);
  }
  const Model = isFromFranchise(req) ? FranchiseMenu : Menu;
  const items = await Model.find({});
  res.json(items);
});

router.post('/', async (req, res) => {
  if (isFromFactory(req)) {
    const menu = await FactoryMenu.create({ ...req.body, source: 'factory' });
    return res.status(201).json(menu);
  }
  if (isFromFranchise(req)) {
    const menu = await FranchiseMenu.create({ ...req.body, source: 'franchise' });
    return res.status(201).json(menu);
  }
  const menu = await Menu.create({ ...req.body, source: 'main' });
  res.status(201).json(menu);
});

router.put('/:id', async (req, res) => {
  const found = await findInAllCollections(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  const menu = await found.model.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(menu);
});

router.delete('/:id', async (req, res) => {
  const found = await findInAllCollections(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  await found.model.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
