import { Button } from '../../../../pentagono/src/index';
import { useEffect, useState } from 'react';

type ApiErrorDetail = { message?: string; status?: number; kind?: 'error' | 'success' };

export default function ApiFeedback() {
  const [message, setMessage] = useState<string | null>(null);
  const [kind, setKind] = useState<'error' | 'success'>('error');

  useEffect(() => {
    const showError = (event: Event) => {
      const detail = (event as CustomEvent<ApiErrorDetail>).detail;
      setMessage(detail?.message || 'Não foi possível concluir a operação.');
      setKind(detail?.kind || 'error');
    };

    window.addEventListener('soul540:api-error', showError);
    return () => window.removeEventListener('soul540:api-error', showError);
  }, []);

  if (!message) return null;

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1000,
        maxWidth: 420,
        padding: '12px 14px',
        borderRadius: 8,
        background: kind === 'success' ? '#166534' : '#991b1b',
        color: '#fff',
        boxShadow: '0 8px 24px rgba(0,0,0,.25)',
      }}
    >
      <strong>{kind === 'success' ? 'Concluído' : 'Não foi possível concluir'}</strong>
      <p style={{ margin: '4px 0 10px' }}>{message}</p>
      {kind !== 'success' && (
        <Button variant="outline" type="button" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      )}
      <Button
        variant="outline"
        type="button"
        onClick={() => setMessage(null)}
        style={{ marginLeft: kind === 'success' ? 0 : 8 }}
      >
        Fechar
      </Button>
    </div>
  );
}
