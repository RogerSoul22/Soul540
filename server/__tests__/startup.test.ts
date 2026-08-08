import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

test('does not run finance backfill during server startup', () => {
  const source = readFileSync(resolve(process.cwd(), 'server/index.ts'), 'utf8');

  assert.equal(source.includes('backfillEventFinances'), false);
});

