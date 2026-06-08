import { Router } from 'express';
import { createTenantModels } from '../utils/tenantModel';
import { logAudit } from '../utils/audit';

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

router.post('/', async (req, res) => {
  const contractor = await models.getModel(req).create({ ...req.body, source: models.getSource(req) });
  await logAudit({ req, action: 'create', resource: 'contractors', resourceId: contractor.id, description: `Criou contratante: ${contractor.name}` });
  res.status(201).json(contractor);
});

router.put('/:id', async (req, res) => {
  const found = await models.findInAll(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  const updated = await found.model.findByIdAndUpdate(req.params.id, req.body, { new: true });
  await logAudit({ req, action: 'update', resource: 'contractors', resourceId: req.params.id, description: `Atualizou contratante: ${updated?.name || req.params.id}` });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const found = await models.findInAll(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  const contractor = await found.model.findById(req.params.id);
  await found.model.findByIdAndDelete(req.params.id);
  await logAudit({ req, action: 'delete', resource: 'contractors', resourceId: req.params.id, description: `Excluiu contratante: ${contractor?.name || req.params.id}` });
  res.status(204).end();
});

export default router;
