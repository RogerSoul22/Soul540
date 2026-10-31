import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseMigrationArgs } from '../../scripts/migrate-franchise-tenants';

describe('franchise migration command', () => {
  it('defaults to a dry run and requires the explicit Itu slug', () => {
    assert.deepEqual(parseMigrationArgs(['--slug', 'itu']), { slug: 'itu', apply: false });
    assert.deepEqual(parseMigrationArgs(['--slug', 'itu', '--apply']), { slug: 'itu', apply: true });
    assert.deepEqual(parseMigrationArgs([]), { slug: undefined, apply: false });
  });
});
