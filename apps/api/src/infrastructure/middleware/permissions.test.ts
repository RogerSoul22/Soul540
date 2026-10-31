import assert from 'node:assert/strict';
import test from 'node:test';
import { hasPermission, requireGlobalAdmin, requirePermission } from './permissions';

function response() {
  return {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      return body;
    },
  };
}

test('admin global always has module permissions', () => {
  assert.equal(hasPermission({ isAdmin: true, unit: 'main' }, 'financeiro', 'write'), true);
});

test('exact module permission grants read and write access', () => {
  assert.equal(hasPermission({ permissions: ['financeiro'] }, 'financeiro', 'read'), true);
  assert.equal(hasPermission({ permissions: ['financeiro'] }, 'financeiro', 'write'), true);
  assert.equal(hasPermission({ permissions: ['eventos'] }, 'financeiro', 'read'), false);
});

test('permission middleware rejects users without the module permission', () => {
  const res = response();
  let called = false;
  requirePermission('financeiro', 'write')({ user: { permissions: [] } }, res, () => {
    called = true;
  });
  assert.equal(res.statusCode, 403);
  assert.equal(called, false);
});

test('global admin middleware rejects local administrators', () => {
  const res = response();
  let called = false;
  requireGlobalAdmin({ user: { isAdmin: true, unit: 'franchise' } }, res, () => {
    called = true;
  });
  assert.equal(res.statusCode, 403);
  assert.equal(called, false);
});
