import { Router } from 'express';
import { createTenantModels } from '../utils/tenantModel';

const models = createTenantModels('Contractor', {
  name: String,
  type: { type: String, default: 'pessoa_fisica' },
  document: { type: String, default: '' },
  documentType: String,
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: String,
  maritalStatus: String,
  profession: String,
  category: String,
  status: { type: String, default: 'ativo' },
  totalRevenue: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { main: 'contractors', franchise: 'franchisecontractors', factory: 'factorycontractors' }, {
  overrides: {
    factory: { type: { type: String, default: 'pessoa_juridica' } },
  },
});

export const Contractor = models.Main;
export const FranchiseContractor = models.Franchise;
export const FactoryContractor = models.Factory;

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
