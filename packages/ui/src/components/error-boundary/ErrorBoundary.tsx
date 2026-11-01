import { Button, Heading } from '../../../../pentagono/src/index';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import styles from './styles/ErrorBoundary.module.scss';

type Props = { children: ReactNode };
type State = { error: Error | null };

const BASE = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/`;

// Arquivo novo publicado enquanto a tela estava aberta: basta recarregar para pegar a versão atual.
function isChunkLoadError(error: Error) {
  return /ChunkLoadError|Loading chunk|dynamically imported module|import\(\) failed|Failed to fetch/i.test(
    `${error.name} ${error.message}`,
  );
}

function RefreshIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <polyline points="21 3 21 9 15 9" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Falha ao renderizar o portal:', error, info);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const outdated = isChunkLoadError(error);

    return (
      <main className={styles.page}>
        <section className={styles.card} role="alert" aria-labelledby="app-error-title">
          <div className={styles.brand}>
            <span className={styles.brandMark}>
              <img src={`${BASE}logo.png`} alt="" aria-hidden="true" />
            </span>
            <span>Soul540</span>
          </div>
          <div className={styles.icon}>
            <AlertIcon />
          </div>
          <Heading id="app-error-title" variant="display" className={styles.title}>
            {outdated ? 'O sistema foi atualizado' : 'Não foi possível abrir esta tela'}
          </Heading>
          <p className={styles.message}>
            {outdated
              ? 'Atualizamos alguns arquivos da aplicação. Recarregue a página para abrir a versão mais recente.'
              : 'Tivemos uma falha ao abrir esta área. Recarregue a página ou volte para o início.'}
          </p>
          <div className={styles.actions}>
            <Button variant="primary" type="button" onClick={() => window.location.reload()}>
              <RefreshIcon />
              Recarregar página
            </Button>
            <Button variant="ghost" type="button" onClick={() => window.location.assign(BASE)}>
              Voltar ao início
            </Button>
          </div>
          {error.message && <div className={styles.detail}>{error.message}</div>}
        </section>
      </main>
    );
  }
}
