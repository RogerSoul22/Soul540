import { Button } from '../../../../../../packages/pentagono/src/index';
import { formatCertificateDate } from '../../ConfiguracaoFiscal/certificate-formatters';
import styles from '../../ConfiguracaoFiscal/styles/ConfiguracaoFiscal.module.scss';

interface Props {
  summary: { configuredAt?: string; validUntil?: string; certificateHolder?: string; certificateCnpj?: string };
  days: number;
  saving: boolean;
  onRemove: () => void;
  onReplace: () => void;
}

export default function FiscalCertificateSummary({ summary, days, saving, onRemove, onReplace }: Props) {
  return (
    <section className={styles.certificateConfigured}>
      <div className={styles.configuredBanner}>
        <span className={styles.bannerIcon}>🛡</span>
        <div>
          <strong>Certificado A1 configurado</strong>
          <span>Enviado em {formatCertificateDate(summary.configuredAt)}.</span>
        </div>
      </div>
      <dl className={styles.metadata}>
        <div>
          <dt>Válido até</dt>
          <dd>
            <strong>{formatCertificateDate(summary.validUntil)}</strong>{' '}
            <span className={days === 0 ? styles.daysExpired : days < 30 ? styles.daysWarning : styles.daysOk}>
              {days ? `${days} dias restantes` : 'Certificado expirado'}
            </span>
          </dd>
        </div>
        <div>
          <dt>Titular</dt>
          <dd>{summary.certificateHolder || '—'}</dd>
        </div>
        <div>
          <dt>CNPJ</dt>
          <dd>{summary.certificateCnpj || '—'}</dd>
        </div>
      </dl>
      <Button
        variant="danger"
        size="sm"
        className={styles.removeButton}
        type="button"
        onClick={() => onRemove()}
        disabled={saving}
      >
        <span>🗑</span> Remover certificado
      </Button>
      <Button variant="link" className={styles.replaceLink} type="button" onClick={() => onReplace()} disabled={saving}>
        Substituir certificado
      </Button>
    </section>
  );
}
