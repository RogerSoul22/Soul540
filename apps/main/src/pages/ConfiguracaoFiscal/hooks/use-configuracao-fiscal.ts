import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { encodeCertificateBytes } from '../certificate-file';

export interface FiscalCertificateSummary {
  configured: boolean;
  configuredAt?: string;
  validUntil?: string;
  certificateCnpj?: string;
  certificateHolder?: string;
}

const EMPTY: FiscalCertificateSummary = { configured: false };

async function readError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.error || 'Não foi possível concluir a operação.';
  } catch {
    return 'Não foi possível concluir a operação.';
  }
}

export function useConfiguracaoFiscal() {
  const [summary, setSummary] = useState<FiscalCertificateSummary>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/fiscal/certificado', { headers: { 'X-System': 'main' } });
      setSummary((await response.json()) as FiscalCertificateSummary);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível carregar o certificado.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async (file: File, password: string) => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const certificado = encodeCertificateBytes(await file.arrayBuffer());
      const response = await apiFetch('/api/fiscal/certificado', {
        method: 'PUT',
        headers: { 'X-System': 'main' },
        body: JSON.stringify({ certificado, senha: password }),
      });
      setSummary((await response.json()) as FiscalCertificateSummary);
      setNotice('Certificado digital salvo com segurança.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar o certificado.');
      throw reason;
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async () => {
    setSaving(true);
    setError('');
    try {
      await apiFetch('/api/fiscal/certificado', { method: 'DELETE', headers: { 'X-System': 'main' } });
      setSummary(EMPTY);
      setNotice('Certificado digital removido.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível remover o certificado.');
    } finally {
      setSaving(false);
    }
  }, []);

  return { summary, loading, saving, error, notice, save, remove };
}
