import { Schema } from 'mongoose';
import { Router } from 'express';
import { createTenantModels } from '../utils/tenantModel';
import { logAudit } from '../utils/audit';

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

router.post('/', async (req, res) => {
  const menu = await models.getModel(req).create({ ...req.body, source: models.getSource(req) });
  await logAudit({ req, action: 'create', resource: 'menus', resourceId: menu.id, description: `Criou cardapio: ${menu.name}` });
  res.status(201).json(menu);
});

router.put('/:id', async (req, res) => {
  const found = await models.findInAll(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  const updated = await found.model.findByIdAndUpdate(req.params.id, req.body, { new: true });
  await logAudit({ req, action: 'update', resource: 'menus', resourceId: req.params.id, description: `Atualizou cardapio: ${updated?.name || req.params.id}` });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const found = await models.findInAll(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  const menu = await found.model.findById(req.params.id);
  await found.model.findByIdAndDelete(req.params.id);
  await logAudit({ req, action: 'delete', resource: 'menus', resourceId: req.params.id, description: `Excluiu cardapio: ${menu?.name || req.params.id}` });
  res.status(204).end();
});

export default router;
