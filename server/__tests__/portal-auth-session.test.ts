import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const portalRoots = ['factory', 'franchise'];

function readPortalFile(portal: string, file: string) {
  return readFileSync(resolve(process.cwd(), portal, 'src', file), 'utf8');
}

test('does not treat a cached browser user as an authenticated session', () => {
  for (const portal of portalRoots) {
    const source = readPortalFile(portal, 'contexts/AuthContext.tsx');

    assert.equal(source.includes('const cached = Storage.getUser<User>();'), false, portal);
    assert.equal(source.includes("apiFetch('/api/auth/me')"), true, portal);
    assert.equal(source.includes('Storage.clear();'), true, portal);
  }
});

test('waits for session validation and ends a portal session after a protected 401', () => {
  for (const portal of portalRoots) {
    const apiSource = readPortalFile(portal, 'lib/api.ts');
    const contextSource = readPortalFile(portal, 'contexts/AppContext.tsx');
    const authSource = readPortalFile(portal, 'contexts/AuthContext.tsx');

    assert.equal(apiSource.includes('soul540:unauthorized'), true, portal);
    assert.equal(contextSource.includes('if (loading || !authenticated) return;'), true, portal);
    assert.equal(authSource.includes("addEventListener('soul540:unauthorized'"), true, portal);
  }
});
