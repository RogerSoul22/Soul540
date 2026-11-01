import { format, parseISO } from 'date-fns';
import type { Invoice } from '../../../../../../packages/contracts/src/index';
import { Badge, Button, Card } from '../../../../../../packages/pentagono/src/index';
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
    <Card className={styles.card} interactive onClick={onPreview}>
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
          <Button variant="outline" className={styles.emitBtn} onClick={onEmit}>
            Emitir Nota Fiscal
          </Button>
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
            <Button variant="outline" className={styles.retryBtn} onClick={onEmit}>
              Tentar novamente
            </Button>
          </div>
        )}
      </div>
      <div className={styles.cardFooter} onClick={(event) => event.stopPropagation()}>
        <span className={styles.cardLabel}>{invoice.clientDocument}</span>
        <div className={styles.cardActions}>
          <Button variant="outline" className={styles.actionBtn} onClick={onEdit} title="Editar">
            ✏
          </Button>
          {invoice.status === 'rascunho' && (
            <Button
              variant="outline"
              className={styles.actionBtn + ' ' + styles.actionBtnWarning}
              onClick={onCancel}
              title="Cancelar nota"
            >
              !
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            className={styles.actionBtn + ' ' + styles.actionBtnDanger}
            onClick={onDelete}
            title="Excluir"
          >
            X
          </Button>
        </div>
      </div>
    </Card>
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
