import { getFranchiseFilter } from '../../infrastructure/franchise-scope';
import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import { type EventUnit } from '../../infrastructure/event-tenant';
import { Finance, FranchiseFinance, FactoryFinance } from '../finance/finance.model';
import { Event, FranchiseEvent, FactoryEvent } from './events.model';
import { getFactoryFranchiseFilter } from './factory-event-scope';

export function getEventStoreForUnit(unit: EventUnit) {
  if (unit === 'factory') return { model: FactoryEvent, financeModel: FactoryFinance, financeSource: 'factory' };
  if (unit === 'franchise') {
    return { model: FranchiseEvent, financeModel: FranchiseFinance, financeSource: 'franchise' };
  }
  return { model: Event, financeModel: Finance, financeSource: 'main' };
}

export function getEventUnitsForLookup(req: any, requestedSource?: string): EventUnit[] {
  const tenantUnit = getTenantUnit(req) as EventUnit;
  if (tenantUnit === 'factory') {
    if (requestedSource === 'factory') return ['factory'];
    if (requestedSource === 'main' || requestedSource === 'franchise') return [requestedSource];
    return ['main', 'franchise'];
  }
  return [tenantUnit];
}

export async function findEventForRequest(req: any, id: string, requestedSource?: string) {
  const tenantUnit = getTenantUnit(req);
  for (const unit of getEventUnitsForLookup(req, requestedSource)) {
    const store = getEventStoreForUnit(unit);
    const filter =
      unit === 'franchise'
        ? tenantUnit === 'factory'
          ? await getFactoryFranchiseFilter({ _id: id, deletedAt: { $exists: false } })
          : getFranchiseFilter(req, { _id: id, deletedAt: { $exists: false } })
        : { _id: id, deletedAt: { $exists: false } };
    const doc = await store.model.findOne(filter);
    if (doc) return { doc, ...store };
  }
  return null;
}
