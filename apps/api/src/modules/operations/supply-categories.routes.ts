import { createCategoryRouter } from '../../infrastructure/tenant-model';

export default createCategoryRouter(
  'SupplyCategory',
  {
    main: 'supplycategories',
    franchise: 'franchisesupplycategories',
    factory: 'factorysupplycategories',
  },
  'estoque-insumos',
);
