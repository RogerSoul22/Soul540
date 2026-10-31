import assert from 'node:assert/strict';
import test from 'node:test';
import { parseChatAction } from './chat.routes';

test('parses an allowed chat action and params', () => {
  assert.deepEqual(parseChatAction('{"action":"query_events","params":{"limit":5}}'), {
    action: 'query_events',
    params: { limit: 5 },
  });
});

test('converts non-JSON model output into an unknown reply', () => {
  assert.deepEqual(parseChatAction('não entendi'), { action: 'unknown', params: { reply: 'não entendi' } });
});

test('rejects an action outside the allowlist', () => {
  assert.throws(() => parseChatAction('{"action":"delete_everything","params":{}}'), /Ação do chat inválida/);
});
