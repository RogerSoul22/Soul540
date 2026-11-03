import { getTenantUnit } from './middleware/tenant';
import { canAccessConsolidatedData } from '../modules/identity/auth-system-policy';

export type EventUnit = 'main' | 'franchise' | 'factory';

const EVENT_UNITS: EventUnit[] = ['main', 'franchise', 'factory'];

export function getEventUnitsForRequest(req: any, scope: string): EventUnit[] {
  const unit = getTenantUnit(req) as EventUnit;
  if (unit === 'factory' || scope === 'combined') return ['main', 'franchise'];
  if (!canAccessConsolidatedData(req.user, unit)) return [unit];
  return EVENT_UNITS.includes(scope as EventUnit) ? [scope as EventUnit] : [unit];
}
