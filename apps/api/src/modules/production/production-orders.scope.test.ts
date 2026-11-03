import assert from 'node:assert/strict';
import test from 'node:test';
import { getFactoryProductionOrderFilter } from './production-orders.scope';

test('factory order list includes every portal unit', () => {
  assert.deepEqual(getFactoryProductionOrderFilter({ deletedAt: { $exists: false } }), {
    deletedAt: { $exists: false },
    unit: { $in: ['main', 'franchise', 'factory'] },
  });
});

test('factory order mutations can target a specific visible unit', () => {
  assert.deepEqual(getFactoryProductionOrderFilter({ id: 'order-1' }, 'franchise'), {
    id: 'order-1',
    unit: 'franchise',
  });
});

test('factory order scope ignores unknown units', () => {
  assert.deepEqual(getFactoryProductionOrderFilter({}, 'unknown'), {
    unit: { $in: ['main', 'franchise', 'factory'] },
  });
});
