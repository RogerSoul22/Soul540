import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('keeps franchise cards out of the public portal', () => {
  const portal = source('../public/portal.html');
  const franchisesPage = source('./pages/Franquias/Franquias.tsx');

  assert.match(portal, /id="sorocaba-card"/);
  assert.match(portal, /id="fabrica-card"/);
  assert.doesNotMatch(portal, /id="itu-card"/);
  assert.doesNotMatch(portal, /Franquia Itu|Acessar Franquia|localhost:5174\/itu/);

  assert.match(franchisesPage, /const activeFranchises = controller\.franchises\.filter/);
  assert.match(franchisesPage, /activeFranchises\.map\(\(franchise\) =>/);
  assert.match(franchisesPage, /<PortalCard/);
});
