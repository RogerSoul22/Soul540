import { getTenantUnit } from './middleware/tenant';

export type EventUnit = 'main' | 'franchise' | 'factory';

const EVENT_UNITS: EventUnit[] = ['main', 'franchise', 'factory'];

export function getEventUnitsForRequest(req: any, scope: string): EventUnit[] {
  const unit = getTenantUnit(req) as EventUnit;
  if (!req.user?.isAdmin) return [unit];
  if (scope === 'combined') return EVENT_UNITS;
  return EVENT_UNITS.includes(scope as EventUnit) ? [scope as EventUnit] : [unit];
}
