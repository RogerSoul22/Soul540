import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getFranchiseFilter, injectFranchiseScope } from '../../infrastructure/franchise-scope';

describe('franchise identity isolation regression', () => {
  it('does not allow a body franchiseId to replace the authenticated id', () => {
    const req = {
      user: { unit: 'franchise', franchiseId: '507f1f77bcf86cd799439011', isAdmin: false },
      headers: {},
    };
    assert.equal(
      injectFranchiseScope(req, { franchiseId: '507f191e810c19729de860ea' }).franchiseId,
      '507f1f77bcf86cd799439011',
    );
  });

  it('composes resource filters with the authenticated id', () => {
    const req = {
      user: { unit: 'franchise', franchiseId: '507f1f77bcf86cd799439011', isAdmin: false },
      headers: {},
    };
    assert.deepEqual(getFranchiseFilter(req, { status: 'active' }), {
      status: 'active',
      franchiseId: '507f1f77bcf86cd799439011',
    });
  });
});
