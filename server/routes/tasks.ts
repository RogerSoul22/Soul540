import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';
import { getTenantFilter, getTenantUnit } from '../middleware/tenant';

const TaskSchema = new Schema({
  title: String,
  description: { type: String, default: '' },
  status: { type: String, default: 'backlog' },
  priority: { type: String, default: 'medium' },
  assignee: { type: String, default: '' },
  dueDate: String,
  eventId: String,
  createdAt: { type: String, default: () => new Date().toISOString() },
  unit: { type: String, default: 'main' },
}, { toJSON: { virtuals: true, versionKey: false } });

const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

const router = Router();

router.get('/', async (req, res) => {
  const tasks = await Task.find(getTenantFilter(req));
  res.json(tasks);
});

router.post('/', async (req, res) => {
  const task = await Task.create({ ...req.body, unit: getTenantUnit(req) });
  res.status(201).json(task);
});

router.put('/:id', async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!task) return res.status(404).json({ error: 'Not found' });
  res.json(task);
});

router.delete('/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
