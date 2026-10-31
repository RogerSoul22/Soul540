import { getFranchiseFilter } from '../../infrastructure/franchise-scope';
import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import { getEventUnitsForRequest, type EventUnit } from '../../infrastructure/event-tenant';
import { Finance, FranchiseFinance, FactoryFinance } from '../finance/finance.model';
import { Event, FranchiseEvent, FactoryEvent } from './events.model';

export function getEventStoreForUnit(unit: EventUnit) {
  if (unit === 'factory') return { model: FactoryEvent, financeModel: FactoryFinance, financeSource: 'factory' };
  if (unit === 'franchise') {
    return { model: FranchiseEvent, financeModel: FranchiseFinance, financeSource: 'franchise' };
  }
  return { model: Event, financeModel: Finance, financeSource: 'main' };
}

export function getEventUnitsForLookup(req: any, requestedSource?: string): EventUnit[] {
  const tenantUnit = getTenantUnit(req) as EventUnit;
  const canReadCombined = Boolean(req.user?.isAdmin) && tenantUnit === 'factory';
  const source = requestedSource as EventUnit | undefined;
  if (canReadCombined && source && ['main', 'franchise', 'factory'].includes(source)) return [source];
  if (canReadCombined) return ['factory', 'franchise', 'main'];
  return [tenantUnit];
}

export async function findEventForRequest(req: any, id: string, requestedSource?: string) {
  for (const unit of getEventUnitsForLookup(req, requestedSource)) {
    const store = getEventStoreForUnit(unit);
    const filter =
      unit === 'franchise'
        ? getFranchiseFilter(req, { _id: id, deletedAt: { $exists: false } })
        : { _id: id, deletedAt: { $exists: false } };
    const doc = await store.model.findOne(filter);
    if (doc) return { doc, ...store };
  }
  return null;
}
