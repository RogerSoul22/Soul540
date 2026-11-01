import type { OfflineStore, QueuedWrite } from './offline-types';

export type SendWrite = (write: QueuedWrite) => Promise<Response>;

export interface SyncResult {
  sent: number;
  failed: number;
  // Parou por falta de conexão ou de sessão; o que sobrou continua na fila.
  stopped: 'offline' | 'unauthorized' | null;
}

async function errorMessage(response: Response) {
  try {
    const payload = await response.clone().json();
    const message = payload?.error?.message ?? payload?.error;
    if (typeof message === 'string' && message.trim()) return message;
  } catch {}
  return `O servidor recusou a alteração (erro ${response.status}).`;
}

async function realIdOf(response: Response): Promise<string | undefined> {
  try {
    const payload = await response.clone().json();
    const data = payload?.data ?? payload;
    return data?.id ?? data?._id;
  } catch {
    return undefined;
  }
}

// Envia a fila em ordem. Registros criados offline ganham o id real, e as alterações seguintes que
// citam o id provisório são reescritas antes de seguir.
export async function replayWrites(store: OfflineStore, send: SendWrite): Promise<SyncResult> {
  const result: SyncResult = { sent: 0, failed: 0, stopped: null };
  const idMap = new Map<string, string>();

  for (const original of (await store.listWrites()).filter((write) => write.state === 'pending')) {
    let write = original;
    for (const [temp, real] of idMap) {
      write = { ...write, url: write.url.split(temp).join(real), body: write.body.split(temp).join(real) };
    }

    let response: Response;
    try {
      response = await send(write);
    } catch {
      result.stopped = 'offline';
      break;
    }

    if (response.status === 401) {
      result.stopped = 'unauthorized';
      break;
    }
    if (response.ok) {
      const realId = write.tempId ? await realIdOf(response) : undefined;
      if (write.tempId && realId) idMap.set(write.tempId, String(realId));
      await store.removeWrite(original.id as number);
      result.sent += 1;
      continue;
    }
    if (response.status >= 500) {
      result.stopped = 'offline';
      break;
    }

    // Recusada pelo servidor (dados inválidos, sem permissão, registro removido): não adianta repetir.
    await store.putWrite({ ...original, state: 'failed', error: await errorMessage(response) });
    result.failed += 1;
  }

  return result;
}
