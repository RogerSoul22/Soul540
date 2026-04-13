import { createCategoryRouter } from '../utils/tenantModel';

export default createCategoryRouter('UtensilCategory', {
  main: 'utensilcategories',
  franchise: 'franchiseutensilcategories',
  factory: 'factoryutensilcategories',
});
