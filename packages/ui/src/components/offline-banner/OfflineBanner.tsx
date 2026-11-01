import { useEffect, useState } from 'react';
import {
  getOfflineLayer,
  OFFLINE_STATUS_EVENT,
  OFFLINE_SYNCED_EVENT,
  type OfflineStatus,
} from '../../../../api-client/src/index';
import { Button } from '../../../../pentagono/src/index';
import styles from './styles/OfflineBanner.module.scss';

const RELOAD_DELAY_MS = 1500;

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
const clock = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export default function OfflineBanner() {
  const [status, setStatus] = useState<OfflineStatus | null>(null);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const layer = getOfflineLayer();
    if (!layer) return;
    const onStatus = (event: Event) => setStatus((event as CustomEvent<OfflineStatus>).detail);
    const onSynced = () => {
      setSynced(true);
      // Os dados da tela são de antes do envio: recarrega para buscar o que o servidor gravou.
      window.setTimeout(() => window.location.reload(), RELOAD_DELAY_MS);
    };
    window.addEventListener(OFFLINE_STATUS_EVENT, onStatus);
    window.addEventListener(OFFLINE_SYNCED_EVENT, onSynced);
    void layer.status().then(setStatus);
    return () => {
      window.removeEventListener(OFFLINE_STATUS_EVENT, onStatus);
      window.removeEventListener(OFFLINE_SYNCED_EVENT, onSynced);
    };
  }, []);

  const layer = getOfflineLayer();
  if (!status || !layer) return null;

  const waiting =
    status.pending > 0 ? ` ${plural(status.pending, 'alteração aguarda', 'alterações aguardam')} envio.` : '';
  let tone = 'info';
  let message = '';

  if (synced) message = 'Alterações enviadas. Atualizando os dados…';
  else if (status.offline) {
    tone = 'warning';
    message = `Sem conexão. Você vê os dados salvos neste aparelho.${waiting}`;
  } else if (status.syncing) message = `Enviando ${plural(status.pending, 'alteração', 'alterações')}…`;
  else if (status.pending > 0) {
    tone = 'warning';
    message = `${plural(status.pending, 'alteração aguarda', 'alterações aguardam')} envio.`;
  } else if (status.servedFromCacheAt) {
    tone = 'warning';
    message = `Servidor indisponível. Dados salvos às ${clock(status.servedFromCacheAt)}.`;
  }

  if (!message && status.failed === 0) return null;

  return (
    <div className={styles.stack} role="status" aria-live="polite">
      {message && (
        <div className={`${styles.banner} ${styles[tone]}`}>
          <span>{message}</span>
          {!status.offline && !status.syncing && !synced && status.pending > 0 && (
            <Button variant="outline" onClick={() => void layer.sync()}>
              Enviar agora
            </Button>
          )}
        </div>
      )}
      {status.failed > 0 && (
        <div className={`${styles.banner} ${styles.danger}`}>
          <div className={styles.failures}>
            <strong>{plural(status.failed, 'alteração não foi aceita', 'alterações não foram aceitas')}:</strong>
            <ul>
              {status.failures.map((failure) => (
                <li key={failure.id}>
                  {failure.method} {failure.path}: {failure.error}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.actions}>
            <Button variant="outline" onClick={() => void layer.retryFailed()}>
              Tentar de novo
            </Button>
            <Button variant="ghost" onClick={() => void layer.discardFailed()}>
              Descartar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
