import { createCategoryRouter } from '../../infrastructure/tenant-model';

export default createCategoryRouter(
  'UtensilCategory',
  {
    main: 'utensilcategories',
    franchise: 'franchiseutensilcategories',
    factory: 'factoryutensilcategories',
  },
  'estoque-utensilios',
);
