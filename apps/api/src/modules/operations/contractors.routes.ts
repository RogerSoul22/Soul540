import { Router } from 'express';
import { createTenantModels } from '../../infrastructure/tenant-model';
import { logAudit } from '../../infrastructure/audit-log';
import { requirePermission } from '../../infrastructure/middleware/permissions';

const models = createTenantModels(
  'Contractor',
  {
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
  },
  { main: 'contractors', franchise: 'franchisecontractors', factory: 'factorycontractors' },
  {
    overrides: {
      factory: { type: { type: String, default: 'pessoa_juridica' } },
    },
  },
);

export const Contractor = models.Main;
export const FranchiseContractor = models.Franchise;
export const FactoryContractor = models.Factory;

const router = Router();
router.use(requirePermission('contratantes', 'read'));

router.get('/', async (req, res) => res.json(await models.getModel(req).find(models.getFilter(req))));

router.post('/', async (req, res) => {
  const contractor = await models.getModel(req).create({
    ...models.withScope(req, req.body),
    source: models.getSource(req),
  });
  await logAudit({
    req,
    action: 'create',
    resource: 'contractors',
    resourceId: contractor.id,
    description: `Criou contratante: ${contractor.name}`,
  });
  res.status(201).json(contractor);
});

router.put('/:id', async (req, res) => {
  const model = models.getModel(req);
  if (!(await model.findOne(models.getFilter(req, { _id: req.params.id })))) {
    return res.status(404).json({ error: 'Not found' });
  }
  const updated = await model.findOneAndUpdate(
    models.getFilter(req, { _id: req.params.id }),
    models.withScope(req, req.body),
    { new: true },
  );
  await logAudit({
    req,
    action: 'update',
    resource: 'contractors',
    resourceId: req.params.id,
    description: `Atualizou contratante: ${updated?.name || req.params.id}`,
  });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const model = models.getModel(req);
  const contractor = await model.findOne(models.getFilter(req, { _id: req.params.id }));
  if (!contractor) return res.status(404).json({ error: 'Not found' });
  await model.findOneAndUpdate(models.getFilter(req, { _id: req.params.id }), { $set: { deletedAt: new Date() } });
  await logAudit({
    req,
    action: 'delete',
    resource: 'contractors',
    resourceId: req.params.id,
    description: `Excluiu contratante: ${contractor?.name || req.params.id}`,
  });
  res.status(204).end();
});

export default router;
