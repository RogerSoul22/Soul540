import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  assertFranchiseUserLink,
  ensureUniqueFranchiseSlug,
  getActiveFranchiseOrThrow,
  normalizeFranchiseSlug,
} from './franchise-policy';

describe('franchise policy', () => {
  it('normalizes names into stable slugs', () => {
    assert.equal(normalizeFranchiseSlug('São José / Norte'), 'sao-jose-norte');
  });

  it('requires a franchise id only for franchise users', () => {
    assert.throws(() => assertFranchiseUserLink('franchise'), /franchiseId is required/);
    assert.throws(() => assertFranchiseUserLink('main', '507f1f77bcf86cd799439011'), /not allowed/);
    assert.equal(assertFranchiseUserLink('franchise', '507f1f77bcf86cd799439011'), '507f1f77bcf86cd799439011');
  });

  it('rejects a duplicated slug', async () => {
    const model = { findOne: async () => ({ id: 'existing' }) };
    await assert.rejects(ensureUniqueFranchiseSlug('campinas', undefined, model), /already exists/);
  });

  it('rejects inactive or missing franchise access', async () => {
    const model = { findOne: async () => null };
    await assert.rejects(getActiveFranchiseOrThrow('507f1f77bcf86cd799439011', model), /not found or inactive/);
  });
});
