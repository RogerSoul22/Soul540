import assert from 'node:assert/strict';
import test from 'node:test';
import { startApiServer } from './start-api';

test('connects to the database before accepting requests', async () => {
  const order: string[] = [];

  await startApiServer({
    validateJwtSecret: () => 'configured',
    connect: async () => {
      order.push('database');
    },
    listen: (_port, callback) => {
      order.push('listen');
      callback();
    },
    log: () => undefined,
  });

  assert.deepEqual(order, ['database', 'listen']);
});
