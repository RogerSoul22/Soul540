import test from 'node:test';
import assert from 'node:assert/strict';
import { checkArchitecture } from './check-architecture.mjs';

test('staged architecture checks keep the configured architecture roots', () => {
  const result = checkArchitecture({
    rootDir: process.cwd(),
    files: ['shared/common/currency.ts'],
  });

  assert.deepEqual(result.errors, []);
});
