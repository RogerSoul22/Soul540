import assert from 'node:assert/strict';
import test from 'node:test';
import { createRateLimit } from './rate-limit';

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

test('blocks requests after the configured maximum', () => {
  const middleware = createRateLimit({ windowMs: 60_000, max: 1 });
  const req = { ip: '127.0.0.1', path: '/api/test' };
  const first = response();
  let firstNext = false;
  middleware(req, first, () => {
    firstNext = true;
  });
  const second = response();
  let secondNext = false;
  middleware(req, second, () => {
    secondNext = true;
  });
  assert.equal(firstNext, true);
  assert.equal(secondNext, false);
  assert.equal(second.statusCode, 429);
});
