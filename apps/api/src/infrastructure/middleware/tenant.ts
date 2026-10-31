import { getFranchiseScope } from '../franchise-context';

export function getTenantFilter(req: any): Record<string, string> {
  const scope = getFranchiseScope(req);
  if (scope.unit === 'main') return {};
  if (scope.unit === 'franchise' && !scope.franchiseId) {
    throw new Error('Franchise scope required');
  }
  return {
    unit: scope.unit,
    ...(scope.franchiseId && { franchiseId: scope.franchiseId }),
  };
}

export function getTenantUnit(req: any): string {
  return getFranchiseScope(req).unit;
}
