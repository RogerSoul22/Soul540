import assert from 'node:assert/strict';
import test from 'node:test';
import { authMiddleware, requireAdmin } from '../auth';

function createResponse() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
  };
}

test('rejects a protected request with no authentication token', async () => {
  const response = createResponse();
  let nextCalled = false;

  await authMiddleware({ cookies: {}, headers: {} }, response, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.body, { error: 'Authentication required' });
});

test('rejects a non-admin user from an administrative route', () => {
  const response = createResponse();
  let nextCalled = false;

  requireAdmin({ user: { isAdmin: false } }, response, () => {
    nextCalled = true;
  });

  assert.equal(response.statusCode, 403);
  assert.deepEqual(response.body, { error: 'Administrator access required' });
  assert.equal(nextCalled, false);
});
