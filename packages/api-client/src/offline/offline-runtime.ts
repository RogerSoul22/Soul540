import { createIndexedDbStore } from './indexeddb-store';
import { createOfflineLayer } from './offline-layer';

type OfflineLayer = ReturnType<typeof createOfflineLayer>;

let layer: OfflineLayer | null = null;

// Camada offline única do navegador. Devolve null onde não há IndexedDB (testes, navegadores antigos).
export function getOfflineLayer(): OfflineLayer | null {
  if (layer) return layer;
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return null;

  layer = createOfflineLayer(createIndexedDbStore(), {
    isOffline: () => navigator.onLine === false,
    send: (write) =>
      fetch(write.url, {
        method: write.method,
        headers: write.headers,
        body: write.method === 'DELETE' ? undefined : write.body || undefined,
        credentials: 'include',
      }),
    emit: (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail })),
  });

  const current = layer;
  // Voltou a conexão: envia o que ficou na fila. Também tenta ao abrir o portal.
  window.addEventListener('online', () => void current.sync().catch(() => undefined));
  window.addEventListener('offline', () => void current.publish().catch(() => undefined));
  void current
    .sync()
    .catch(() => undefined)
    .then(() => current.publish());

  return layer;
}
