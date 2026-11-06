import assert from 'node:assert/strict';
import test from 'node:test';
import { createMemoryStore } from './memory-store';
import { createOfflineLayer, type RequestInfo } from './offline-layer';
import type { QueuedWrite } from './offline-types';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function setup(send: (write: QueuedWrite) => Promise<Response> = async () => json({ ok: true }), offline = true) {
  const store = createMemoryStore();
  const state = { offline };
  const layer = createOfflineLayer(store, { isOffline: () => state.offline, send });
  return { store, layer, state };
}

const request = (partial: Partial<RequestInfo> & { path: string }): RequestInfo => ({
  method: 'GET',
  url: `https://soul540.test${partial.path}`,
  body: undefined,
  headers: { 'x-system': 'main' },
  ...partial,
});

test('queries that worked are served from the device when the network fails', async () => {
  const { layer } = setup();
  const list = request({ path: '/api/events' });
  await layer.remember(list, json([{ id: 'a', name: 'Festa' }]));

  const cached = await layer.fallback(list);
  assert.deepEqual(await cached?.json(), [{ id: 'a', name: 'Festa' }]);
  assert.ok(cached?.headers.get('X-Offline-Cache'));
  assert.equal(await layer.fallback(request({ path: '/api/never-seen' })), null);
});

test('cached data is separated by system and franchise', async () => {
  const { layer } = setup();
  await layer.remember(
    request({ path: '/api/events', headers: { 'x-system': 'franchise', 'x-franchise-id': 'campinas' } }),
    json([1]),
  );

  assert.equal(await layer.fallback(request({ path: '/api/events', headers: { 'x-system': 'main' } })), null);
  assert.equal(
    await layer.fallback(
      request({ path: '/api/events', headers: { 'x-system': 'franchise', 'x-franchise-id': 'sorocaba' } }),
    ),
    null,
  );
  assert.ok(
    await layer.fallback(
      request({ path: '/api/events', headers: { 'x-system': 'franchise', 'x-franchise-id': 'campinas' } }),
    ),
  );
});

test('login, fiscal and chat routes never use the offline cache or queue', async () => {
  const { layer } = setup();
  for (const path of ['/api/auth/login', '/api/fiscal/certificado', '/api/chat']) {
    assert.equal(await layer.fallback(request({ path, method: 'POST', body: '{}' })), null, path);
  }
  const me = request({ path: '/api/auth/me' });
  await layer.remember(me, json({ id: 'u1' }));
  assert.ok(await layer.fallback(me), 'a sessão (me) pode voltar do cache');
});

test('a write made offline is queued, answered provisionally and shown in the cached list', async () => {
  const { layer, store } = setup();
  await layer.remember(request({ path: '/api/events' }), json([{ id: 'a', name: 'Antigo' }]));

  const response = await layer.fallback(
    request({ path: '/api/events', method: 'POST', body: JSON.stringify({ name: 'Novo' }) }),
  );
  const created = await response?.json();
  assert.equal(response?.status, 201);
  assert.match(created.id, /^offline-/);
  assert.equal(created.name, 'Novo');
  assert.equal((await layer.status()).pending, 1);

  const list = await (await layer.fallback(request({ path: '/api/events' })))?.json();
  assert.deepEqual(
    list.map((item: { name: string }) => item.name),
    ['Antigo', 'Novo'],
  );
  assert.equal((await store.listWrites())[0].state, 'pending');
});

test('writes made while the device is online are not queued', async () => {
  const { layer } = setup(undefined, false);
  const result = await layer.fallback(request({ path: '/api/events', method: 'POST', body: '{}' }));
  assert.equal(result, null);
  assert.equal((await layer.status()).pending, 0);
});

test('the queue is sent in order and temporary ids become the real ones', async () => {
  const sent: Array<{ method: string; url: string; body: string }> = [];
  const { layer, state } = setup(async (write) => {
    sent.push({ method: write.method, url: write.url, body: write.body });
    return write.method === 'POST' ? json({ id: 'real-1' }, 201) : json({ ok: true });
  });

  const created = await (
    await layer.fallback(request({ path: '/api/events', method: 'POST', body: JSON.stringify({ name: 'Novo' }) }))
  )?.json();
  await layer.fallback(
    request({ path: `/api/events/${created.id}`, method: 'PUT', body: JSON.stringify({ name: 'Editado' }) }),
  );

  state.offline = false;
  await layer.sync();

  assert.equal(sent.length, 2);
  assert.equal(sent[1].url, 'https://soul540.test/api/events/real-1');
  assert.equal((await layer.status()).pending, 0);
});

test('the server refusing a change moves it to failed, and a lost connection keeps it queued', async () => {
  let reply = () => json({ error: 'Dados inválidos' }, 400);
  const { layer, state } = setup(async () => reply());
  await layer.fallback(request({ path: '/api/events', method: 'POST', body: '{}' }));
  state.offline = false;

  await layer.sync();
  let status = await layer.status();
  assert.equal(status.failed, 1);
  assert.equal(status.failures[0].error, 'Dados inválidos');

  await layer.discardFailed();
  assert.equal((await layer.status()).failed, 0);

  state.offline = true;
  await layer.fallback(request({ path: '/api/events', method: 'POST', body: '{}' }));
  state.offline = false;
  reply = () => json({}, 503);
  await layer.sync();
  status = await layer.status();
  assert.equal(status.pending, 1);
  assert.equal(status.failed, 0);
});

test('clearing the device (login or logout) removes cached data and queued changes', async () => {
  const { layer } = setup();
  await layer.remember(request({ path: '/api/events' }), json([1]));
  await layer.fallback(request({ path: '/api/events', method: 'POST', body: '{}' }));

  await layer.clear();
  assert.equal(await layer.fallback(request({ path: '/api/events' })), null);
  assert.equal((await layer.status()).pending, 0);
});
