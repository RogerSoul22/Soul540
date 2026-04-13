import { Router } from 'express';
import { createTenantModels } from '../utils/tenantModel';

const models = createTenantModels('Utensil', {
  name: { type: String, required: true },
  category: { type: String, default: '' },
  quantity: { type: Number, default: 1 },
  unitValue: Number,
  location: { type: String, default: '' },
  status: { type: String, default: 'disponivel' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { main: 'utensils', franchise: 'franchiseutensils', factory: 'factoryutensils' });

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
