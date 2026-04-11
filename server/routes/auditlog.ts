import { Router } from 'express';
import { AuditLog } from '../utils/audit';

const router = Router();

// GET /api/audit-log — admin only, supports ?resource=&unit=&limit=&page=
router.get('/', async (req, res) => {
  const { resource, unit, page = '1', limit = '100' } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (resource) filter.resource = resource;
  if (unit)     filter.userUnit = unit;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [items, total] = await Promise.all([
    AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(parseInt(limit)),
    AuditLog.countDocuments(filter),
  ]);
  res.json({ items, total, page: parseInt(page), limit: parseInt(limit) });
});

export default router;
