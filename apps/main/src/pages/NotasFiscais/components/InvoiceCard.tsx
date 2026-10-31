import { format, parseISO } from 'date-fns';
import type { Invoice } from '@soul540/contracts';
import { Badge } from '@soul540/ui';
import { statusColors, statusLabels } from '../types/invoice-types';
import styles from '../styles/NotasFiscais.module.scss';

type Props = {
  invoice: Invoice;
  eventName?: string;
  onPreview: () => void;
  onEmit: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onDelete: () => void;
};

export default function InvoiceCard({ invoice, eventName, onPreview, onEmit, onEdit, onCancel, onDelete }: Props) {
  const processing = invoice.emissaoStatus === 'processing' || invoice.nfeioStatus === 'processing';
  const issued = invoice.emissaoStatus === 'emitida' || invoice.nfeioStatus === 'issued';
  const errored = invoice.emissaoStatus === 'erro' || invoice.nfeioStatus === 'error';

  return (
    <div className={styles.card} onClick={onPreview}>
      <div className={styles.cardHeader}>
        <span className={styles.cardId}>{invoice.id.toUpperCase()}</span>
        <Badge variant={statusColors[invoice.status]}>{statusLabels[invoice.status]}</Badge>
      </div>
      <div className={styles.cardBody}>
        <Info label="Cliente" value={invoice.clientName} />
        <Info label="Evento" value={eventName || '-'} />
        <Info label="Data Emissão" value={format(parseISO(invoice.issueDate), 'dd/MM/yyyy')} />
        <Info label="Tipo" value={(invoice.type || 'nfse').toUpperCase()} />
        <Info label={'ISS (' + invoice.taxRate + '%)'} value={'R$ ' + invoice.taxAmount.toLocaleString('pt-BR')} />
        <div className={styles.cardRow}>
          <span className={styles.cardLabel}>Total</span>
          <span className={styles.cardValueLg}>R$ {invoice.totalValue.toLocaleString('pt-BR')}</span>
        </div>
      </div>
      <div className={styles.nfeioSection} onClick={(event) => event.stopPropagation()}>
        {!invoice.nfeioStatus && !invoice.emissaoStatus && invoice.status !== 'cancelada' && (
          <button className={styles.emitBtn} onClick={onEmit}>
            Emitir Nota Fiscal
          </button>
        )}
        {processing && <Badge variant="amber">Processando...</Badge>}
        {issued && (
          <div className={styles.nfeioIssued}>
            <Badge variant="green">Nota Emitida</Badge>
            {(invoice.numeroNF || invoice.nfeioNumber) && (
              <span className={styles.nfeioNumber}>NF {invoice.numeroNF || invoice.nfeioNumber}</span>
            )}
            <div className={styles.nfeioLinks}>
              <a
                className={styles.nfeioLink}
                href={'/api/invoices/' + invoice.id + '/download/pdf'}
                target="_blank"
                rel="noreferrer"
              >
                PDF
              </a>
              <a
                className={styles.nfeioLink}
                href={'/api/invoices/' + invoice.id + '/download/xml'}
                rel="noreferrer"
                download
              >
                XML
              </a>
            </div>
          </div>
        )}
        {errored && (
          <div className={styles.nfeioError}>
            <Badge variant="red">Erro na Emissão</Badge>
            <button className={styles.retryBtn} onClick={onEmit}>
              Tentar novamente
            </button>
          </div>
        )}
      </div>
      <div className={styles.cardFooter} onClick={(event) => event.stopPropagation()}>
        <span className={styles.cardLabel}>{invoice.clientDocument}</span>
        <div className={styles.cardActions}>
          <button className={styles.actionBtn} onClick={onEdit} title="Editar">
            ✏
          </button>
          {invoice.status === 'rascunho' && (
            <button
              className={styles.actionBtn + ' ' + styles.actionBtnWarning}
              onClick={onCancel}
              title="Cancelar nota"
            >
              !
            </button>
          )}
          <button className={styles.actionBtn + ' ' + styles.actionBtnDanger} onClick={onDelete} title="Excluir">
            X
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.cardRow}>
      <span className={styles.cardLabel}>{label}</span>
      <span className={styles.cardValue}>{value}</span>
    </div>
  );
}
