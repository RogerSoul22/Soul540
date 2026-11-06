import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseMigrationArgs } from '../../scripts/migrate-franchise-tenants';

describe('franchise migration command', () => {
  it('defaults to a dry run and requires the explicit Campinas slug', () => {
    assert.deepEqual(parseMigrationArgs(['--slug', 'campinas']), { slug: 'campinas', apply: false });
    assert.deepEqual(parseMigrationArgs(['--slug', 'campinas', '--apply']), { slug: 'campinas', apply: true });
    assert.deepEqual(parseMigrationArgs([]), { slug: undefined, apply: false });
  });
});
