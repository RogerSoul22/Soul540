import { Router } from 'express';
import { createTenantModels } from '../../infrastructure/tenant-model';
import { requirePermission } from '../../infrastructure/middleware/permissions';

const models = createTenantModels(
  'Utensil',
  {
    name: { type: String, required: true },
    category: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    unitValue: Number,
    location: { type: String, default: '' },
    status: { type: String, default: 'disponivel' },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { main: 'utensils', franchise: 'franchiseutensils', factory: 'factoryutensils' },
);

const router = Router();
router.use(requirePermission('estoque-utensilios', 'read'));

router.get('/', async (req, res) => res.json(await models.getModel(req).find(models.getFilter(req))));

router.post('/', async (req, res) =>
  res.status(201).json(
    await models.getModel(req).create({
      ...models.withScope(req, req.body),
      source: models.getSource(req),
    }),
  ),
);

router.put('/:id', async (req, res) => {
  const model = models.getModel(req);
  if (!(await model.findOne(models.getFilter(req, { _id: req.params.id })))) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(
    await model.findOneAndUpdate(models.getFilter(req, { _id: req.params.id }), models.withScope(req, req.body), {
      new: true,
    }),
  );
});

router.delete('/:id', async (req, res) => {
  const model = models.getModel(req);
  if (!(await model.findOne(models.getFilter(req, { _id: req.params.id })))) {
    return res.status(404).json({ error: 'Not found' });
  }
  await model.findOneAndUpdate(models.getFilter(req, { _id: req.params.id }), { $set: { deletedAt: new Date() } });
  res.status(204).end();
});

export default router;
