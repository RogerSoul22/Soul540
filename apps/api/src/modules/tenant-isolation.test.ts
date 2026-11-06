import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getFranchiseFilter, injectFranchiseScope } from '../infrastructure/franchise-scope';

const campinasId = '507f1f77bcf86cd799439011';

describe('tenant isolation', () => {
  it('uses the authenticated franchise in reads and writes', () => {
    const req = { user: { unit: 'franchise', franchiseId: campinasId, isAdmin: false }, headers: {} };

    assert.deepEqual(getFranchiseFilter(req, { status: 'open' }), {
      status: 'open',
      franchiseId: campinasId,
    });
    assert.deepEqual(injectFranchiseScope(req, { franchiseId: 'other', source: 'main' }), {
      franchiseId: campinasId,
      source: 'main',
    });
  });

  it('allows a matrix administrator to select a validated franchise', () => {
    const req = {
      user: { unit: 'main', isAdmin: true },
      headers: { 'x-system': 'franchise', 'x-franchise-id': campinasId },
    };

    assert.deepEqual(getFranchiseFilter(req), { franchiseId: campinasId });
  });

  it('fails closed when a franchise request has no scope', () => {
    assert.throws(
      () =>
        getFranchiseFilter({
          user: { unit: 'main', isAdmin: true },
          headers: { 'x-system': 'franchise' },
        }),
      /Franchise scope required/,
    );
  });
});
