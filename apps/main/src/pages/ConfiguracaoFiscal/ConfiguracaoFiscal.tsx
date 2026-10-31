import { useRef, useState, type FormEvent } from 'react';
import { ConfirmModal } from '@soul540/ui';
import { isCertificateFile } from './certificate-file';
import { formatCertificateDate, getCertificateDaysRemaining } from './certificate-formatters';
import { useConfiguracaoFiscal } from './hooks/use-configuracao-fiscal';
import styles from './styles/ConfiguracaoFiscal.module.scss';
export default function ConfiguracaoFiscal() {
  const controller = useConfiguracaoFiscal();
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [pendingReplacement, setPendingReplacement] = useState<{ file: File; password: string } | null>(null);
  async function executeSave(credentials: { file: File; password: string }) {
    try {
      await controller.save(credentials.file, credentials.password);
      setFile(null);
      setPassword('');
      setReplaceMode(false);
    } catch {}
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!file || !isCertificateFile(file.name) || !password) return;
    const credentials = { file, password };
    if (controller.summary.configured) {
      setPendingReplacement(credentials);
      return;
    }
    await executeSave(credentials);
  }
  const days = getCertificateDaysRemaining(controller.summary.validUntil);
  const configured = controller.summary.configured && !replaceMode;

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>
          Certificado digital <span className={styles.info}>i</span>
        </h1>
        {controller.loading ? (
          <p className={styles.loading}>Carregando configuração...</p>
        ) : configured ? (
          <section className={styles.certificateConfigured}>
            <div className={styles.configuredBanner}>
              <span className={styles.bannerIcon}>🛡</span>
              <div>
                <strong>Certificado A1 configurado</strong>
                <span>Enviado em {formatCertificateDate(controller.summary.configuredAt)}.</span>
              </div>
            </div>
            <dl className={styles.metadata}>
              <div>
                <dt>Válido até</dt>
                <dd>
                  <strong>{formatCertificateDate(controller.summary.validUntil)}</strong>{' '}
                  <span className={days === 0 ? styles.daysExpired : days < 30 ? styles.daysWarning : styles.daysOk}>
                    {days ? `${days} dias restantes` : 'Certificado expirado'}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Titular</dt>
                <dd>{controller.summary.certificateHolder || '—'}</dd>
              </div>
              <div>
                <dt>CNPJ</dt>
                <dd>{controller.summary.certificateCnpj || '—'}</dd>
              </div>
            </dl>
            <button
              className={styles.removeButton}
              type="button"
              onClick={() => setConfirmRemove(true)}
              disabled={controller.saving}
            >
              <span>🗑</span> Remover certificado
            </button>
            <button
              className={styles.replaceLink}
              type="button"
              onClick={() => setReplaceMode(true)}
              disabled={controller.saving}
            >
              Substituir certificado
            </button>
          </section>
        ) : (
          <form className={styles.uploadForm} onSubmit={submit}>
            <button
              className={`${styles.uploadZone} ${file ? styles.uploadSelected : ''}`}
              type="button"
              onClick={() => fileInput.current?.click()}
            >
              <span className={styles.uploadIcon}>↥</span>
              <span>{file?.name || 'Clique para selecionar o arquivo (.pfx ou .p12)'}</span>
            </button>
            <input
              ref={fileInput}
              className={styles.fileInput}
              type="file"
              accept=".pfx,.p12"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            <label className={styles.passwordLabel} htmlFor="certificate-password">
              Senha do certificado
            </label>
            <div className={styles.passwordRow}>
              <input
                id="certificate-password"
                className={styles.passwordInput}
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha do arquivo"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                className={styles.passwordToggle}
                type="button"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                ◉
              </button>
            </div>
            <button className={styles.submitButton} type="submit" disabled={!file || !password || controller.saving}>
              <span>↥</span> Enviar certificado
            </button>
            {replaceMode && (
              <button className={styles.cancelButton} type="button" onClick={() => setReplaceMode(false)}>
                Cancelar substituição
              </button>
            )}
          </form>
        )}
        {controller.error && <p className={styles.error}>{controller.error}</p>}
        {controller.notice && <p className={styles.notice}>{controller.notice}</p>}
      </section>
      {pendingReplacement && (
        <ConfirmModal
          title="Substituir certificado digital?"
          message="O certificado atual será substituído e deixará de ser usado para novas emissões de NF-e."
          confirmLabel="Substituir certificado"
          onClose={() => setPendingReplacement(null)}
          onConfirm={() => {
            const credentials = pendingReplacement;
            setPendingReplacement(null);
            void executeSave(credentials);
          }}
        />
      )}
      {confirmRemove && (
        <ConfirmModal
          title="Remover certificado digital?"
          message="A emissão de NF-e ficará indisponível até que outro certificado seja cadastrado."
          confirmLabel="Remover certificado"
          variant="danger"
          onClose={() => setConfirmRemove(false)}
          onConfirm={() => {
            setConfirmRemove(false);
            void controller.remove();
          }}
        />
      )}
    </main>
  );
}
