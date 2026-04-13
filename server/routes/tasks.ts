import { Router } from 'express';
import { createTenantModels } from '../utils/tenantModel';

const models = createTenantModels('Task', {
  title: String,
  description: { type: String, default: '' },
  status: { type: String, default: 'backlog' },
  priority: { type: String, default: 'medium' },
  assignee: { type: String, default: '' },
  dueDate: String,
  eventId: String,
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { main: 'tasks', franchise: 'franchisetasks', factory: 'factorytasks' });

export const Task = models.Main;
export const FranchiseTask = models.Franchise;
export const FactoryTask = models.Factory;

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
