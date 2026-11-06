import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ensureCampinasFranchise, migrateLegacyCollection } from './migrate-franchise-tenants';

describe('franchise tenant migration', () => {
  it('reports a dry run without writing legacy documents', async () => {
    let updates = 0;
    const collection = {
      countDocuments: async () => 2,
      updateMany: async () => {
        updates += 1;
        return { modifiedCount: 2 };
      },
    };

    const result = await migrateLegacyCollection('franchiseevents', collection, '507f1f77bcf86cd799439011', false);

    assert.deepEqual(result, { collection: 'franchiseevents', pending: 2, modified: 0 });
    assert.equal(updates, 0);
  });

  it('is idempotent when applying a migration twice', async () => {
    let pending = 2;
    const collection = {
      countDocuments: async () => pending,
      updateMany: async () => {
        const modifiedCount = pending;
        pending = 0;
        return { modifiedCount };
      },
    };

    const first = await migrateLegacyCollection('franchisefinances', collection, '507f1f77bcf86cd799439011', true);
    const second = await migrateLegacyCollection('franchisefinances', collection, '507f1f77bcf86cd799439011', true);

    assert.deepEqual(first, { collection: 'franchisefinances', pending: 2, modified: 2 });
    assert.deepEqual(second, { collection: 'franchisefinances', pending: 0, modified: 0 });
  });

  it('reuses Campinas instead of creating a duplicate', async () => {
    let creates = 0;
    const model = {
      findOne: async () => ({ id: 'campinas-id', slug: 'campinas' }),
      create: async () => {
        creates += 1;
        return { id: 'new-id' };
      },
    };

    const franchise = await ensureCampinasFranchise(model);

    assert.equal(franchise.id, 'campinas-id');
    assert.equal(creates, 0);
  });
});
