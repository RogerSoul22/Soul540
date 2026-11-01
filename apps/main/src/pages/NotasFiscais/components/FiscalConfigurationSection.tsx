import { useRef, useState, type FormEvent } from 'react';
import {
  Button,
  ConfirmModal,
  Heading,
  Input,
  Label,
  SkeletonContent,
} from '../../../../../../packages/pentagono/src/index';
import { isCertificateFile } from '../../ConfiguracaoFiscal/certificate-file';
import { formatCertificateDate, getCertificateDaysRemaining } from '../../ConfiguracaoFiscal/certificate-formatters';
import { useConfiguracaoFiscal } from '../../ConfiguracaoFiscal/hooks/use-configuracao-fiscal';
import styles from '../../ConfiguracaoFiscal/styles/ConfiguracaoFiscal.module.scss';
import FiscalCertificateSummary from './FiscalCertificateSummary';
function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <line x1="3" y1="3" x2="21" y2="21" />}
    </svg>
  );
}

export default function FiscalConfigurationSection() {
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
    <section className={`${styles.card} ${styles.integratedSection}`}>
      <Heading level={2} variant="section" className={styles.title}>
        Certificado digital
      </Heading>
      {controller.loading ? (
        <SkeletonContent variant="cards" count={2} label="Carregando configuração..." />
      ) : configured ? (
        <FiscalCertificateSummary
          summary={controller.summary}
          days={days}
          saving={controller.saving}
          onRemove={() => setConfirmRemove(true)}
          onReplace={() => setReplaceMode(true)}
        />
      ) : (
        <form className={styles.uploadForm} onSubmit={submit}>
          <Button
            variant="dashed"
            className={`${styles.uploadZone} ${file ? styles.uploadSelected : ''}`}
            type="button"
            onClick={() => fileInput.current?.click()}
          >
            <span className={styles.uploadIcon}>↥</span>
            <span>{file?.name || 'Clique para selecionar o arquivo (.pfx ou .p12)'}</span>
          </Button>
          <Input
            variant="file"
            ref={fileInput}
            className={styles.fileInput}
            type="file"
            accept=".pfx,.p12"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          <Label className={styles.passwordLabel} htmlFor="certificate-password">
            Senha do certificado
          </Label>
          <div className={styles.passwordRow}>
            <Input
              id="certificate-password"
              className={styles.passwordInput}
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha do arquivo"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              className={styles.passwordToggle}
              type="button"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              <EyeIcon off={showPassword} />
            </Button>
          </div>
          <Button
            variant="primary"
            size="sm"
            className={styles.submitButton}
            type="submit"
            disabled={!file || !password || controller.saving}
          >
            <span>↥</span> Enviar certificado
          </Button>
          {replaceMode && (
            <Button variant="ghost" type="button" onClick={() => setReplaceMode(false)}>
              Cancelar substituição
            </Button>
          )}
        </form>
      )}
      {controller.error && <p className={styles.error}>{controller.error}</p>}
      {controller.notice && <p className={styles.notice}>{controller.notice}</p>}
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
    </section>
  );
}
