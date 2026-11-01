import { Button, Heading } from '../../../../pentagono/src/index';
import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Falha ao renderizar o portal:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
      >
        <section role="alert" style={{ maxWidth: 440, textAlign: 'center' }}>
          <Heading variant="display">Não foi possível abrir esta tela</Heading>
          <p>Recarregue a página. Se o problema continuar, tente novamente em alguns minutos.</p>
          <Button variant="outline" type="button" onClick={() => window.location.reload()}>
            Recarregar página
          </Button>
        </section>
      </main>
    );
  }
}
