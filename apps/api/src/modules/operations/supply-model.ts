import { createTenantModels } from '../../infrastructure/tenant-model';

export const supplyModels = createTenantModels(
  'Supply',
  {
    name: { type: String, required: true },
    category: { type: String, default: '' },
    measureUnit: { type: String, default: 'kg' },
    quantity: { type: Number, default: 0 },
    minStock: { type: Number, default: 0 },
    costPerUnit: { type: Number, default: 0 },
    supplier: { type: String, default: '' },
    expirationDate: String,
    status: { type: String, default: 'em_estoque' },
    factorySupplyId: { type: String, index: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { main: 'supplies', franchise: 'franchisesupplies', factory: 'factorysupplies' },
);

supplyModels.Franchise.schema.index(
  { franchiseId: 1, factorySupplyId: 1 },
  { unique: true, partialFilterExpression: { factorySupplyId: { $type: 'string' } } },
);
