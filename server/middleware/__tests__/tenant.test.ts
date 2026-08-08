import assert from 'node:assert/strict';
import test from 'node:test';
import { getTenantUnit } from '../tenant';

test('locks every non-admin user to the authenticated unit', () => {
  const unit = getTenantUnit({
    user: { unit: 'main', isAdmin: false },
    headers: { 'x-system': 'factory' },
  });

  assert.equal(unit, 'main');
});

