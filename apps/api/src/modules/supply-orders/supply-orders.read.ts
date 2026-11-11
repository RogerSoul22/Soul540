import { getFranchiseScope } from '../../infrastructure/franchise-context';
import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import { supplyModels } from '../operations/supply-model';
import { SupplyOrderError } from './supply-orders.errors';
import { SupplyOrderModel } from './supply-orders.model';
import { getSupplyOrderListFilter } from './supply-orders.scope';

export async function listSupplyOrders(req: any) {
  const scope = getFranchiseScope(req);
  const filter = getSupplyOrderListFilter(scope);
  return SupplyOrderModel.find(filter).sort({ createdAt: -1 });
}

export async function getSupplyOrderCatalog(req: any) {
  if (!['main', 'franchise'].includes(getTenantUnit(req))) {
    throw new SupplyOrderError('Somente as unidades podem solicitar insumos.', 403);
  }
  const supplies = await supplyModels.Factory.find({
    deletedAt: { $exists: false },
    status: { $ne: 'vencido' },
  }).sort({ name: 1 });
  return supplies.map((supply: any) => ({
    id: String(supply._id),
    name: supply.name,
    measureUnit: supply.measureUnit,
    availableQuantity: supply.quantity,
  }));
}

export async function getLocalSupplyOptions(req: any) {
  const scope = getFranchiseScope(req);
  if (scope.unit === 'factory') throw new SupplyOrderError('A Fábrica não recebe pedidos de insumos.', 403);
  const model = supplyModels.getModel(req);
  const supplies = await model
    .find(supplyModels.getFilter(req, { deletedAt: { $exists: false } }))
    .select('_id name measureUnit quantity factorySupplyId')
    .sort({ name: 1 });
  return supplies.map((supply: any) => ({
    id: String(supply._id),
    name: supply.name,
    measureUnit: supply.measureUnit,
    quantity: supply.quantity,
    ...(supply.factorySupplyId && { factorySupplyId: supply.factorySupplyId }),
  }));
}

export function requireSupplyOrder(req: any, id: string, session?: any) {
  const scope = getFranchiseScope(req);
  const query = SupplyOrderModel.findOne({ _id: id, ...getSupplyOrderListFilter(scope) });
  return session ? query.session(session) : query;
}

export function requireFactorySupply(id: string, session?: any) {
  const query = supplyModels.Factory.findOne({ _id: id, deletedAt: { $exists: false } });
  return session ? query.session(session) : query;
}

export function assertFranchiseScope(req: any) {
  const scope = getFranchiseScope(req);
  if (scope.unit === 'factory') throw new SupplyOrderError('A fábrica não pode abrir pedidos de abastecimento.', 403);
  if (scope.unit === 'franchise' && !scope.franchiseId) throw new SupplyOrderError('Franquia não identificada.', 403);
  return scope;
}
