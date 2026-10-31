import { Router } from 'express';
import { createTenantModels } from '../../infrastructure/tenant-model';
import { requirePermission } from '../../infrastructure/middleware/permissions';

export const historyModels = createTenantModels(
  'TaskHistory',
  {
    taskId: { type: String, default: '' },
    title: String,
    description: { type: String, default: '' },
    priority: { type: String, default: 'medium' },
    assignee: { type: String, default: '' },
    dueDate: String,
    eventId: String,
    completedAt: { type: String, default: () => new Date().toISOString() },
  },
  { main: 'taskhistory', franchise: 'franchisetaskhistory', factory: 'factorytaskhistory' },
);

const router = Router();
router.use(requirePermission('tarefas', 'read'));

router.get('/', async (req, res) =>
  res.json(await historyModels.getModel(req).find(historyModels.getFilter(req)).sort({ completedAt: -1 })),
);

router.post('/', async (req, res) =>
  res.status(201).json(
    await historyModels.getModel(req).create({
      ...historyModels.withScope(req, req.body),
      source: historyModels.getSource(req),
    }),
  ),
);

router.delete('/:id', async (req, res) => {
  const model = historyModels.getModel(req);
  if (!(await model.findOne(historyModels.getFilter(req, { _id: req.params.id })))) {
    return res.status(404).json({ error: 'Not found' });
  }
  await model.findOneAndUpdate(historyModels.getFilter(req, { _id: req.params.id }), {
    $set: { deletedAt: new Date() },
  });
  res.status(204).end();
});

export default router;
