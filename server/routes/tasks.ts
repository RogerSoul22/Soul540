import { Router } from 'express';
import { createTenantModels } from '../utils/tenantModel';
import { historyModels } from './task-history';

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
  const updated = await found.model.findByIdAndUpdate(req.params.id, req.body, { new: true });

  // Auto-create history entry when task is moved to done
  if (req.body.status === 'done' && found.doc.status !== 'done') {
    const hModel = historyModels.getModel(req);
    const existing = await hModel.findOne({ taskId: req.params.id });
    if (!existing) {
      await hModel.create({
        taskId: req.params.id,
        title: updated.title,
        description: updated.description || '',
        priority: updated.priority || 'medium',
        assignee: updated.assignee || '',
        dueDate: updated.dueDate,
        eventId: updated.eventId,
        completedAt: new Date().toISOString(),
        source: historyModels.getSource(req),
      });
    }
  }

  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const found = await models.findInAll(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  await found.model.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
