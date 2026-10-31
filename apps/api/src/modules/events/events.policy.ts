import { getTenantUnit } from '../../infrastructure/middleware/tenant';

const FACTORY_OPERATIONAL_FIELDS = [
  'factoryProductionStatus',
  'factoryProductionNotes',
  'factoryDoughBalls',
  'factorySauceKg',
  'factoryCheeseKg',
  'factoryPackagingUnits',
  'actualPizzas',
] as const;

export function isFromFranchise(req: any): boolean {
  return getTenantUnit(req) === 'franchise';
}

export function isFromFactory(req: any): boolean {
  return getTenantUnit(req) === 'factory';
}

export function pickFactoryOperationalUpdate(body: Record<string, unknown>) {
  return FACTORY_OPERATIONAL_FIELDS.reduce<Record<string, unknown>>((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(body, key)) acc[key] = body[key];
    return acc;
  }, {});
}
