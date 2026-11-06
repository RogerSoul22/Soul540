import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getFranchiseScope, requireFranchiseId } from './franchise-context';

const campinasId = '507f1f77bcf86cd799439011';

describe('franchise context', () => {
  it('locks a regular franchise user to its own franchise', () => {
    const scope = getFranchiseScope({
      user: { unit: 'franchise', franchiseId: campinasId, isAdmin: false },
      headers: { 'x-system': 'factory', 'x-franchise-id': '507f191e810c19729de860ea' },
    });

    assert.deepEqual(scope, { unit: 'franchise', franchiseId: campinasId, isAdmin: false });
  });

  it('accepts a valid franchise header only for a main administrator', () => {
    const scope = getFranchiseScope({
      user: { unit: 'main', isAdmin: true },
      headers: { 'x-system': 'franchise', 'x-franchise-id': campinasId },
    });

    assert.deepEqual(scope, { unit: 'franchise', franchiseId: campinasId, isAdmin: true });
  });

  it('rejects an invalid franchise header', () => {
    assert.throws(
      () =>
        getFranchiseScope({
          user: { unit: 'main', isAdmin: true },
          headers: { 'x-system': 'franchise', 'x-franchise-id': 'campinas' },
        }),
      /Invalid franchise scope/,
    );
  });

  it('requires a franchise id for a franchise scope', () => {
    assert.throws(
      () =>
        requireFranchiseId({
          user: { unit: 'main', isAdmin: true },
          headers: { 'x-system': 'franchise' },
        }),
      /Franchise scope required/,
    );
  });
});
