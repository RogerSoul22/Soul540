import { getFranchiseScope, getRequestedFranchiseId, requireFranchiseId } from './franchise-context';

export function getFranchiseFilter(req: any, filter: Record<string, unknown> = {}): Record<string, unknown> {
  const scope = getFranchiseScope(req);
  const requestedFranchise =
    Boolean(scope.isAdmin) && (req.query?.scope === 'franchise' || req.query?.reportingUnit === 'franchise');
  if (scope.unit === 'franchise') return { ...filter, franchiseId: requireFranchiseId(req) };
  if (!requestedFranchise) return filter;
  const requestedFranchiseId = getRequestedFranchiseId(req);
  return requestedFranchiseId ? { ...filter, franchiseId: requestedFranchiseId } : filter;
}

export function injectFranchiseScope(req: any, data: Record<string, unknown>): Record<string, unknown> {
  const { franchiseId: _ignored, ...safeData } = data;
  const scope = getFranchiseScope(req);
  if (scope.unit !== 'franchise') return safeData;
  return { ...safeData, franchiseId: requireFranchiseId(req) };
}
