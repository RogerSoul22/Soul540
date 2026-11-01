import type { CachedResponse, OfflineStore, QueuedWrite } from './offline-types';

const DB_NAME = 'soul540-offline';
const RESPONSES = 'responses';
const WRITES = 'writes';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(RESPONSES, { keyPath: 'key' });
      request.result.createObjectStore(WRITES, { keyPath: 'id', autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function wrap<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function createIndexedDbStore(): OfflineStore {
  let database: Promise<IDBDatabase> | null = null;
  const store = async (name: string, mode: IDBTransactionMode) => {
    database ??= open();
    return (await database).transaction(name, mode).objectStore(name);
  };

  return {
    async getResponse(key) {
      return wrap<CachedResponse | undefined>((await store(RESPONSES, 'readonly')).get(key));
    },
    async putResponse(response) {
      await wrap((await store(RESPONSES, 'readwrite')).put(response));
    },
    async listResponses() {
      return wrap<CachedResponse[]>((await store(RESPONSES, 'readonly')).getAll());
    },
    async listWrites() {
      const writes = await wrap<QueuedWrite[]>((await store(WRITES, 'readonly')).getAll());
      return writes.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    },
    async addWrite(write) {
      const { id: _ignored, ...data } = write;
      return Number(await wrap((await store(WRITES, 'readwrite')).add(data)));
    },
    async putWrite(write) {
      await wrap((await store(WRITES, 'readwrite')).put(write));
    },
    async removeWrite(id) {
      await wrap((await store(WRITES, 'readwrite')).delete(id));
    },
    async clear() {
      await wrap((await store(RESPONSES, 'readwrite')).clear());
      await wrap((await store(WRITES, 'readwrite')).clear());
    },
  };
}
