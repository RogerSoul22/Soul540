import assert from 'node:assert/strict';
import test from 'node:test';
import { createTenantModels } from './tenant-model';

test('tenant model filters soft-deleted records from normal reads', () => {
  const models = createTenantModels(
    'SoftDeleteRegression',
    {
      name: String,
    },
    {
      main: 'softdeletemain',
      franchise: 'softdeletefranchise',
      factory: 'softdeletefactory',
    },
  );
  assert.deepEqual(models.getFilter({ user: { unit: 'main', isAdmin: true } }), {
    deletedAt: { $exists: false },
  });
});
