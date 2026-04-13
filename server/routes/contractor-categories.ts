import { createCategoryRouter } from '../utils/tenantModel';

export default createCategoryRouter('ContractorCategory', {
  main: 'contractorcategories',
  franchise: 'franchisecontractorcategories',
  factory: 'factorycontractorcategories',
});
