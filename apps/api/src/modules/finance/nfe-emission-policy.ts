import { getTenantUnit } from '../../infrastructure/middleware/tenant';

export function assertMainNfeScope(req: any): void {
  if (getTenantUnit(req) !== 'main') throw new Error('A emissão de NF-e ocorre somente no sistema principal.');
}
