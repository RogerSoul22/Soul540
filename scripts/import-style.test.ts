import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import test from 'node:test';

const sourceRoots = ['apps', 'packages', 'shared'];
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);
const scopedImportPattern = /(?:from|import)\s*['"]@soul540\//;
const ignoredDirectories = new Set(['node_modules', 'dist', '.git']);

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
    const filePath = join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(filePath);
    return sourceExtensions.has(extname(entry.name)) ? [filePath] : [];
  });
}

test('source code uses relative imports instead of scoped workspace imports', () => {
  const violations = sourceRoots
    .flatMap((root) => listSourceFiles(root))
    .filter((filePath) => scopedImportPattern.test(readFileSync(filePath, 'utf8')))
    .map((filePath) => relative(process.cwd(), filePath));

  assert.deepEqual(violations, []);
});
