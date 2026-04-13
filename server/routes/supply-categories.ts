import { createCategoryRouter } from '../utils/tenantModel';

export default createCategoryRouter('SupplyCategory', {
  main: 'supplycategories',
  franchise: 'franchisesupplycategories',
  factory: 'factorysupplycategories',
});
