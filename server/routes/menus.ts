import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';
import { getTenantFilter, getTenantUnit } from '../middleware/tenant';

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
  unit: { type: String, default: 'main' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { toJSON: { virtuals: true, versionKey: false } });

const Menu = mongoose.models.Menu || mongoose.model('Menu', MenuSchema);

const router = Router();

router.get('/', async (req, res) => {
  const menus = await Menu.find(getTenantFilter(req)).sort({ createdAt: -1 });
  res.json(menus);
});

router.post('/', async (req, res) => {
  const menu = await Menu.create({ ...req.body, unit: getTenantUnit(req) });
  res.status(201).json(menu);
});

router.put('/:id', async (req, res) => {
  const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!menu) return res.status(404).json({ error: 'Not found' });
  res.json(menu);
});

router.delete('/:id', async (req, res) => {
  await Menu.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
