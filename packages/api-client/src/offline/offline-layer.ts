import { CACHE_HEADER, isOfflineEligible, recallResponse, rememberResponse } from './offline-cache';
import { enqueueWrite, isQueueableWrite } from './offline-queue';
import { replayWrites, type SendWrite } from './offline-sync';
import type { OfflineStatus, OfflineStore } from './offline-types';

export const OFFLINE_STATUS_EVENT = 'soul540:offline-status';
export const OFFLINE_SYNCED_EVENT = 'soul540:offline-synced';

interface LayerOptions {
  // true quando o aparelho está sem conexão (navigator.onLine === false).
  isOffline: () => boolean;
  send: SendWrite;
  emit?: (name: string, detail?: unknown) => void;
}

export interface RequestInfo {
  method: string;
  url: string;
  path: string;
  body: unknown;
  headers: Record<string, string>;
}

export function createOfflineLayer(store: OfflineStore, { isOffline, send, emit = () => undefined }: LayerOptions) {
  let syncing = false;
  let servedFromCacheAt: number | null = null;

  async function status(): Promise<OfflineStatus> {
    const writes = await store.listWrites();
    const failures = writes.filter((write) => write.state === 'failed');
    return {
      offline: isOffline(),
      pending: writes.length - failures.length,
      failed: failures.length,
      failures: failures.map((write) => ({
        id: write.id as number,
        method: write.method,
        path: write.path,
        error: write.error ?? '',
      })),
      syncing,
      servedFromCacheAt,
    };
  }

  const publish = async () => emit(OFFLINE_STATUS_EVENT, await status());

  async function sync() {
    if (syncing || isOffline()) return;
    syncing = true;
    await publish();
    try {
      const result = await replayWrites(store, send);
      if (result.sent > 0) emit(OFFLINE_SYNCED_EVENT, result);
    } finally {
      syncing = false;
      await publish();
    }
  }

  return {
    status,
    publish,

    // Consulta que deu certo: guarda para a próxima vez que a rede cair.
    async remember(request: RequestInfo, response: Response) {
      if (request.method !== 'GET' || !isOfflineEligible(request.path)) return;
      servedFromCacheAt = null;
      await rememberResponse(store, request.path, request.headers, response);
    },

    // A rede falhou: consultas voltam do cache e alterações entram na fila (só com o aparelho sem conexão).
    async fallback(request: RequestInfo): Promise<Response | null> {
      if (!isOfflineEligible(request.path)) return null;

      if (request.method === 'GET') {
        const cached = await recallResponse(store, request.path, request.headers);
        if (cached) servedFromCacheAt = Number(cached.headers.get(CACHE_HEADER));
        await publish();
        return cached;
      }
      if (!isOffline() || !isQueueableWrite(request.method, request.path, request.body)) return null;

      const queued = await enqueueWrite(store, { ...request, body: (request.body as string) ?? '' });
      await publish();
      return queued;
    },

    sync,

    async retryFailed() {
      for (const write of await store.listWrites()) {
        if (write.state === 'failed') await store.putWrite({ ...write, state: 'pending', error: undefined });
      }
      await sync();
    },

    async discardFailed() {
      for (const write of await store.listWrites()) {
        if (write.state === 'failed') await store.removeWrite(write.id as number);
      }
      await publish();
    },

    // Troca de usuário (login e logout): nada do anterior fica no aparelho.
    async clear() {
      servedFromCacheAt = null;
      await store.clear();
      await publish();
    },
  };
}
