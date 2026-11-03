import { getTenantUnit } from './middleware/tenant';
import { canAccessConsolidatedData } from '../modules/identity/auth-system-policy';

export type EventUnit = 'main' | 'franchise' | 'factory';

const EVENT_UNITS: EventUnit[] = ['main', 'franchise', 'factory'];

export function getEventUnitsForRequest(req: any, scope: string): EventUnit[] {
  const unit = getTenantUnit(req) as EventUnit;
  if (!canAccessConsolidatedData(req.user, unit)) return [unit];
  if (scope === 'combined') return ['main', 'franchise'];
  return EVENT_UNITS.includes(scope as EventUnit) ? [scope as EventUnit] : [unit];
}
