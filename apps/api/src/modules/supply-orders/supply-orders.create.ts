import { getFranchiseScope } from '../../infrastructure/franchise-context';
import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import { FranchiseModel } from '../identity/franchise-policy';
import { supplyModels } from '../operations/supply-model';
import { logAudit } from '../../infrastructure/audit-log';
import type { CreateSupplyOrderInput } from '@soul540/contracts';
import { validateSupplyAvailability, validateSupplyOrderItems } from '@soul540/domain';
import { SupplyOrderError } from './supply-orders.errors';
import { SupplyOrderModel } from './supply-orders.model';
import { assertFranchiseScope } from './supply-orders.read';
import { getFactorySupplyOrderFilter } from './supply-orders.scope';

export async function createSupplyOrder(req: any, input: CreateSupplyOrderInput) {
  const scope = assertFranchiseScope(req);
  const validation = validateSupplyOrderItems(input.items || []);
  if (validation) throw new SupplyOrderError(validation, 400);
  const factorySupplies = await supplyModels.Factory.find(
    getFactorySupplyOrderFilter({ _id: { $in: input.items.map((item) => item.factorySupplyId) } }),
  );
  if (factorySupplies.length !== input.items.length) {
    throw new SupplyOrderError('Um ou mais insumos não estão disponíveis no catálogo da Fábrica.', 422);
  }
  const stockValidation = validateSupplyAvailability(factorySupplies);
  if (stockValidation) throw new SupplyOrderError(stockValidation, 422);
  const franchiseName = await resolveRequestingUnit(scope);
  const supplyById = new Map(factorySupplies.map((supply: any) => [String(supply._id), supply]));
  const now = new Date().toISOString();
  const actor = actorSnapshot(req);
  const [order] = await SupplyOrderModel.create([
    {
      unit: scope.unit,
      ...(scope.franchiseId && { franchiseId: scope.franchiseId }),
      franchiseName,
      status: 'submitted',
      items: input.items.map((item) => {
        const supply = supplyById.get(item.factorySupplyId) as any;
        return {
          factorySupplyId: item.factorySupplyId,
          factorySupplyName: supply.name,
          measureUnit: supply.measureUnit,
          costPerUnit: Number(supply.costPerUnit) || 0,
          quantityRequested: item.quantity,
          quantityToDispatch: 0,
        };
      }),
      note: input.note?.trim().slice(0, 1000),
      history: [{ status: 'submitted', ...actor, at: now }],
      createdAt: now,
      updatedAt: now,
    },
  ]);
  await logAudit({
    req,
    action: 'create',
    resource: 'supply-orders',
    resourceId: String(order._id),
    description: `Criou pedido de insumos para ${franchiseName}`,
  });
  return order;
}

async function resolveRequestingUnit(scope: { unit: string; franchiseId?: string }) {
  if (scope.unit === 'main') return 'Sorocaba';
  const franchise = await FranchiseModel.findOne({
    _id: scope.franchiseId,
    status: 'ativa',
    deletedAt: { $exists: false },
  });
  if (!franchise) throw new SupplyOrderError('Franquia não encontrada ou inativa.', 403);
  return franchise.name;
}

function actorSnapshot(req: any) {
  return {
    actorName: String(req.user?.name || req.user?.email || 'Usuário'),
    actorUnit: getTenantUnit(req),
  };
}
