import { getTenantUnit } from '../middleware/tenant';

export type EventUnit = 'main' | 'franchise' | 'factory';

const EVENT_UNITS: EventUnit[] = ['main', 'franchise', 'factory'];

export function getEventUnitsForRequest(req: any, scope: string): EventUnit[] {
  const unit = getTenantUnit(req) as EventUnit;
  if (!req.user?.isAdmin) return [unit];
  return scope === 'combined' ? EVENT_UNITS : [unit];
}
