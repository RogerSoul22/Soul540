import { Router } from 'express';
import { createTenantModels } from '../utils/tenantModel';

const models = createTenantModels('Supply', {
  name: { type: String, required: true },
  category: { type: String, default: '' },
  measureUnit: { type: String, default: 'kg' },
  quantity: { type: Number, default: 0 },
  minStock: { type: Number, default: 0 },
  costPerUnit: { type: Number, default: 0 },
  supplier: { type: String, default: '' },
  expirationDate: String,
  status: { type: String, default: 'em_estoque' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { main: 'supplies', franchise: 'franchisesupplies', factory: 'factorysupplies' });

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
