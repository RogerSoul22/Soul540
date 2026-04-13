import { Schema } from 'mongoose';
import { Router } from 'express';
import { createTenantModels } from '../utils/tenantModel';

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

const models = createTenantModels('Menu', {
  name: String,
  eventId: { type: String, default: '' },
  headerText: { type: String, default: '' },
  footerText: { type: String, default: '' },
  categories: [MenuCategorySchema],
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { main: 'menus', franchise: 'franchisemenus', factory: 'factorymenus' });

const router = Router();

router.get('/', async (req, res) => res.json(await models.getModel(req).find({})));

router.post('/', async (req, res) =>
  res.status(201).json(await models.getModel(req).create({ ...req.body, source: models.getSource(req) })));

router.put('/:id', async (req, res) => {
  const found = await models.findInAll(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  res.json(await found.model.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

router.delete('/:id', async (req, res) => {
  const found = await models.findInAll(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  await found.model.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
