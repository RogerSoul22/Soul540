export interface CachedResponse {
  // sistema|franquia|caminho: cada portal e cada franquia tem a própria cópia.
  key: string;
  // Caminho sem a query, usado para achar a lista de um recurso ao aplicar uma alteração offline.
  path: string;
  body: string;
  savedAt: number;
}

export type WriteState = 'pending' | 'failed';

export interface QueuedWrite {
  id?: number;
  state: WriteState;
  method: string;
  url: string;
  path: string;
  body: string;
  headers: Record<string, string>;
  // Id provisório de um registro criado offline; vira o id real depois do envio.
  tempId?: string;
  createdAt: number;
  error?: string;
}

// Persistência do modo offline. Em produção é o IndexedDB; nos testes, a versão em memória.
export interface OfflineStore {
  getResponse(key: string): Promise<CachedResponse | undefined>;
  putResponse(response: CachedResponse): Promise<void>;
  listResponses(): Promise<CachedResponse[]>;
  listWrites(): Promise<QueuedWrite[]>;
  addWrite(write: QueuedWrite): Promise<number>;
  putWrite(write: QueuedWrite): Promise<void>;
  removeWrite(id: number): Promise<void>;
  clear(): Promise<void>;
}

export interface OfflineStatus {
  offline: boolean;
  pending: number;
  failed: number;
  failures: Array<{ id: number; method: string; path: string; error: string }>;
  syncing: boolean;
  // Quando a última tela veio do cache do aparelho (e não do servidor).
  servedFromCacheAt: number | null;
}
