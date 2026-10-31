import { Router } from 'express';
import { createTenantModels } from '../../infrastructure/tenant-model';
import { requirePermission } from '../../infrastructure/middleware/permissions';
import { historyModels } from './task-history.routes';

const models = createTenantModels(
  'Task',
  {
    title: String,
    description: { type: String, default: '' },
    status: { type: String, default: 'backlog' },
    priority: { type: String, default: 'medium' },
    assignee: { type: String, default: '' },
    dueDate: String,
    eventId: String,
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { main: 'tasks', franchise: 'franchisetasks', factory: 'factorytasks' },
);

export const Task = models.Main;
export const FranchiseTask = models.Franchise;
export const FactoryTask = models.Factory;

const router = Router();
router.use(requirePermission('tarefas', 'read'));

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
  const current = await model.findOne(models.getFilter(req, { _id: req.params.id }));
  if (!current) return res.status(404).json({ error: 'Not found' });
  const updated = await model.findOneAndUpdate(
    models.getFilter(req, { _id: req.params.id }),
    models.withScope(req, req.body),
    { new: true },
  );

  // Auto-create history entry when task is moved to done
  if (req.body.status === 'done' && current.status !== 'done') {
    const hModel = historyModels.getModel(req);
    const existing = await hModel.findOne(models.getFilter(req, { taskId: req.params.id }));
    if (!existing) {
      await hModel.create(
        models.withScope(req, {
          taskId: req.params.id,
          title: updated.title,
          description: updated.description || '',
          priority: updated.priority || 'medium',
          assignee: updated.assignee || '',
          dueDate: updated.dueDate,
          eventId: updated.eventId,
          completedAt: new Date().toISOString(),
          source: historyModels.getSource(req),
        }),
      );
    }
  }

  res.json(updated);
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
