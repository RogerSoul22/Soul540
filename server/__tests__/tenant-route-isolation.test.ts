import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import test from 'node:test';

function listRouteFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listRouteFiles(path);
    return entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') ? [path] : [];
  });
}

test('does not search resource IDs across tenant collections', () => {
  const routeDirectory = resolve(process.cwd(), 'server/routes');
  const violatingFile = listRouteFiles(routeDirectory).find((file) => readFileSync(file, 'utf8').includes('findInAll'));

  assert.equal(violatingFile, undefined);
  assert.equal(readFileSync(resolve(process.cwd(), 'server/utils/tenantModel.ts'), 'utf8').includes('findInAll'), false);
});
