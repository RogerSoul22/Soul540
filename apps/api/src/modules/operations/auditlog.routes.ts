import { Router } from 'express';
import { AuditLog } from '../../infrastructure/audit-log';
import { getFranchiseFilter } from '../../infrastructure/franchise-scope';
import { requireAdmin } from '../../infrastructure/middleware/auth';
import { getFranchiseScope, requireFranchiseId } from '../../infrastructure/franchise-context';

const router = Router();
router.use(requireAdmin);

export function getAuditLogFilter(req: any, filter: Record<string, unknown>) {
  const scopedFilter = getFranchiseFilter(req, filter);
  if (getFranchiseScope(req).unit === 'franchise') {
    return {
      ...scopedFilter,
      userUnit: 'franchise',
      franchiseId: requireFranchiseId(req),
    };
  }
  // O portal da fábrica só enxerga registros da fábrica, mesmo para o administrador global.
  if (getFranchiseScope(req).unit === 'factory') {
    return { ...scopedFilter, userUnit: 'factory' };
  }
  return scopedFilter;
}

// GET /api/audit-log — admin only, supports ?resource=&unit=&limit=&page=
router.get('/', async (req, res) => {
  const { resource, unit, page = '1', limit = '100' } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (resource) filter.resource = resource;
  if (unit) filter.userUnit = unit;
  const scopedFilter = getAuditLogFilter(req, filter);

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [items, total] = await Promise.all([
    AuditLog.find(scopedFilter).sort({ timestamp: -1 }).skip(skip).limit(parseInt(limit)),
    AuditLog.countDocuments(scopedFilter),
  ]);
  res.json({ items, total, page: parseInt(page), limit: parseInt(limit) });
});

export default router;
