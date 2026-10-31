import { createCategoryRouter } from '../../infrastructure/tenant-model';

export default createCategoryRouter(
  'ContractorCategory',
  {
    main: 'contractorcategories',
    franchise: 'franchisecontractorcategories',
    factory: 'factorycontractorcategories',
  },
  'contratantes',
);
