import type { CachedResponse, OfflineStore, QueuedWrite } from './offline-types';

const MAX_BODY_BYTES = 3_000_000;
// Rotas que dependem do servidor no momento (login, nota fiscal, IA) ou entregam arquivos.
const NEVER_OFFLINE = /^\/api\/(auth\/(?!me$)|fiscal\/|chat)|\/(export|download|pdf|xml|ofx|import|upload)/i;

export const CACHE_HEADER = 'X-Offline-Cache';

export const pathOf = (path: string) => path.split('?', 1)[0];

export function isOfflineEligible(path: string) {
  return path.startsWith('/api/') && !NEVER_OFFLINE.test(path);
}

export function cacheKey(path: string, headers: Record<string, string>) {
  const lower = Object.fromEntries(Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value]));
  return `${lower['x-system'] ?? 'main'}|${lower['x-franchise-id'] ?? ''}|${path}`;
}

// Guarda a resposta de uma consulta para usar quando a rede cair.
export async function rememberResponse(
  store: OfflineStore,
  path: string,
  headers: Record<string, string>,
  response: Response,
) {
  if (!response.ok || !(response.headers.get('content-type') || '').includes('application/json')) return;
  const body = await response.clone().text();
  if (body.length > MAX_BODY_BYTES) return;
  await store.putResponse({ key: cacheKey(path, headers), path: pathOf(path), body, savedAt: Date.now() });
}

export async function recallResponse(store: OfflineStore, path: string, headers: Record<string, string>) {
  const cached = await store.getResponse(cacheKey(path, headers));
  if (!cached) return null;
  return new Response(cached.body, {
    status: 200,
    headers: { 'Content-Type': 'application/json', [CACHE_HEADER]: String(cached.savedAt) },
  });
}

const sameId = (item: unknown, id: string) =>
  typeof item === 'object' && item !== null && [(item as any).id, (item as any)._id].some((value) => value === id);

function patchList(list: unknown[], write: QueuedWrite, entity: Record<string, unknown>, targetId: string) {
  if (write.method === 'POST') return [...list, entity];
  if (write.method === 'DELETE') return list.filter((item) => !sameId(item, targetId));
  return list.map((item) => (sameId(item, targetId) ? { ...(item as object), ...entity } : item));
}

// Reflete uma alteração feita offline nas listas guardadas, para ela aparecer se a tela for reaberta.
export async function patchCachedLists(store: OfflineStore, write: QueuedWrite, entity: Record<string, unknown>) {
  const segments = write.path.split('/');
  const targetId = write.method === 'POST' ? '' : (segments.pop() ?? '');
  const collection = write.method === 'POST' ? write.path : segments.join('/');

  for (const cached of await store.listResponses()) {
    if (cached.path !== collection) continue;
    let data: unknown;
    try {
      data = JSON.parse(cached.body);
    } catch {
      continue;
    }
    const next = patchPayload(data, write, entity, targetId);
    if (next !== data) await store.putResponse({ ...cached, body: JSON.stringify(next) } satisfies CachedResponse);
  }
}

function patchPayload(data: unknown, write: QueuedWrite, entity: Record<string, unknown>, targetId: string) {
  if (Array.isArray(data)) return patchList(data, write, entity, targetId);
  const items = (data as { items?: unknown })?.items;
  if (Array.isArray(items)) return { ...(data as object), items: patchList(items, write, entity, targetId) };
  return data;
}
