import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import { getFranchiseFilter } from '../../infrastructure/franchise-scope';
import { Finance, FranchiseFinance, FactoryFinance } from './finance.model';
import { canAccessConsolidatedData } from '../identity/auth-system-policy';

export { Finance, FranchiseFinance, FactoryFinance };

export function isFromFranchise(req: any): boolean {
  return getTenantUnit(req) === 'franchise';
}
export function isFromFactory(req: any): boolean {
  return getTenantUnit(req) === 'factory';
}

export function getFinanceModelForUnit(unit: string) {
  if (unit === 'factory') return FactoryFinance;
  if (unit === 'franchise') return FranchiseFinance;
  return Finance;
}

export function getFinanceModelsForRequest(req: any, scope: string) {
  const tenantUnit = getTenantUnit(req);
  if (!canAccessConsolidatedData(req.user, tenantUnit)) return [getFinanceModelForUnit(tenantUnit)];
  if (scope === 'combined') return [Finance, FranchiseFinance, FactoryFinance];
  return [getFinanceModelForUnit(scope)];
}

export function getFinanceFilter(req: any, model: any, filter: Record<string, unknown> = {}) {
  const requestedFranchise =
    canAccessConsolidatedData(req.user, getTenantUnit(req)) &&
    (req.query?.scope === 'franchise' || req.query?.reportingUnit === 'franchise');
  if (model === FranchiseFinance && (getTenantUnit(req) === 'franchise' || requestedFranchise)) {
    return getFranchiseFilter(req, filter);
  }
  return filter;
}

export function getFinanceReverseError(entry: { automatic?: boolean; reversedAt?: string }): string | undefined {
  if (entry.reversedAt) return 'Lançamento já estornado';
  return undefined;
}

export async function findFinanceForRequest(req: any, id: string) {
  const model = getFinanceModelForUnit(getTenantUnit(req));
  const doc = await model.findOne(getFinanceFilter(req, model, { _id: id }));
  if (doc) return { doc, model };
  return null;
}

export function getAuthenticatedUserId(req: any): string {
  return req.user?._id?.toString() || req.user?.id || 'system';
}
