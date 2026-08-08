import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('protects user management with the administrator middleware', () => {
  const source = readFileSync(resolve(process.cwd(), 'server/routes/users.ts'), 'utf8');

  assert.equal(source.includes('router.use(requireAdmin)'), true);
  assert.equal(source.includes('user?.role'), false);
});
