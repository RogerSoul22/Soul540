import type { CachedResponse, OfflineStore, QueuedWrite } from './offline-types';

export function createMemoryStore(): OfflineStore {
  const responses = new Map<string, CachedResponse>();
  const writes = new Map<number, QueuedWrite>();
  let nextId = 1;

  return {
    async getResponse(key) {
      return responses.get(key);
    },
    async putResponse(response) {
      responses.set(response.key, response);
    },
    async listResponses() {
      return [...responses.values()];
    },
    async listWrites() {
      return [...writes.values()].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    },
    async addWrite(write) {
      const id = nextId++;
      writes.set(id, { ...write, id });
      return id;
    },
    async putWrite(write) {
      if (write.id !== undefined) writes.set(write.id, write);
    },
    async removeWrite(id) {
      writes.delete(id);
    },
    async clear() {
      responses.clear();
      writes.clear();
    },
  };
}
