import { Router } from 'express';
import { createTenantModels } from '../utils/tenantModel';

export const historyModels = createTenantModels('TaskHistory', {
  taskId: { type: String, default: '' },
  title: String,
  description: { type: String, default: '' },
  priority: { type: String, default: 'medium' },
  assignee: { type: String, default: '' },
  dueDate: String,
  eventId: String,
  completedAt: { type: String, default: () => new Date().toISOString() },
}, { main: 'taskhistory', franchise: 'franchisetaskhistory', factory: 'factorytaskhistory' });

const router = Router();

router.get('/', async (req, res) =>
  res.json(await historyModels.getModel(req).find({}).sort({ completedAt: -1 })));

router.post('/', async (req, res) =>
  res.status(201).json(
    await historyModels.getModel(req).create({ ...req.body, source: historyModels.getSource(req) }),
  ));

router.delete('/:id', async (req, res) => {
  const found = await historyModels.findInAll(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  await found.model.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
