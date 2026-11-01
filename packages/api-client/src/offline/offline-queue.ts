import { isOfflineEligible, patchCachedLists, pathOf } from './offline-cache';
import type { OfflineStore, QueuedWrite } from './offline-types';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function isQueueableWrite(method: string, path: string, body: unknown) {
  if (!WRITE_METHODS.has(method) || !isOfflineEligible(path)) return false;
  return body === undefined || body === null || typeof body === 'string';
}

function newId() {
  return `offline-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
}

function parseBody(body: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(body);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

// Guarda a alteração para enviar depois e devolve uma resposta provisória no formato que a tela espera.
export async function enqueueWrite(
  store: OfflineStore,
  input: { method: string; url: string; path: string; body: string; headers: Record<string, string> },
): Promise<Response> {
  const method = input.method.toUpperCase();
  const tempId = method === 'POST' ? newId() : undefined;
  const write: QueuedWrite = {
    ...input,
    method,
    path: pathOf(input.path),
    state: 'pending',
    tempId,
    createdAt: Date.now(),
  };
  await store.addWrite(write);

  const lastSegment = write.path.split('/').pop() ?? '';
  const entity = { ...parseBody(write.body), ...(tempId ? { id: tempId } : { id: lastSegment }), _offline: true };
  await patchCachedLists(store, write, entity);

  const payload = method === 'DELETE' ? { ok: true, _offline: true } : entity;
  return new Response(JSON.stringify(payload), {
    status: method === 'POST' ? 201 : 200,
    headers: { 'Content-Type': 'application/json', 'X-Offline-Queued': '1' },
  });
}
