import assert from 'node:assert/strict';
import test from 'node:test';
import app from '../app';

test('mounts mandatory authentication for protected API routes', () => {
  const layers = (app as any)._router.stack as Array<{ name: string; regexp: RegExp }>;

  assert.ok(layers.some((layer) => layer.name === 'authMiddleware' && layer.regexp.test('/api/finances')));
});
