import { format, parseISO } from 'date-fns';
import { Modal } from '@soul540/ui';
import type { Invoice, InvoiceItem } from '@soul540/contracts';
import styles from '../styles/NotasFiscais.module.scss';

type Props = {
  invoice: Invoice;
  eventName?: string;
  onClose: () => void;
};

export default function InvoicePreviewModal({ invoice, eventName, onClose }: Props) {
  return (
    <Modal title="Visualizar Nota Fiscal" size="lg" onClose={onClose}>
      <div className={styles.preview}>
        <div className={styles.previewHeader}>
          <div className={styles.previewLogo}>Soul540</div>
          <div className={styles.previewTitle}>Nota Fiscal de Serviços</div>
        </div>
        <PreviewSection title="Tomador de Serviço">
          <p>
            <strong>{invoice.clientName}</strong>
          </p>
          <p>{invoice.clientDocument}</p>
          <p>{invoice.clientEmail}</p>
        </PreviewSection>
        <PreviewSection title="Detalhes">
          <p>Número: {invoice.id.toUpperCase()}</p>
          <p>Tipo: {(invoice.type || 'nfse').toUpperCase()}</p>
          <p>Evento: {eventName || '-'}</p>
          <p>Data de Emissão: {format(parseISO(invoice.issueDate), 'dd/MM/yyyy')}</p>
          {(invoice.numeroNF || invoice.nfeioNumber) && <p>Número NF: {invoice.numeroNF || invoice.nfeioNumber}</p>}
          {invoice.chaveAcesso && (
            <p style={{ wordBreak: 'break-all', fontSize: '10px' }}>Chave: {invoice.chaveAcesso}</p>
          )}
        </PreviewSection>
        <table className={styles.previewTable}>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Qtd</th>
              <th>Valor Unit.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item: InvoiceItem, index) => (
              <tr key={index}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>R$ {item.unitPrice.toLocaleString('pt-BR')}</td>
                <td>R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.previewTotals}>
          <div className={styles.previewTotalRow}>
            <span>Subtotal:</span>
            <span>R$ {invoice.subtotal.toLocaleString('pt-BR')}</span>
          </div>
          <div className={styles.previewTotalRow}>
            <span>ISS ({invoice.taxRate}%):</span>
            <span>R$ {invoice.taxAmount.toLocaleString('pt-BR')}</span>
          </div>
          <div className={styles.previewTotalRow + ' ' + styles.previewTotalFinal}>
            <span>Total:</span>
            <span>R$ {invoice.totalValue.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.previewSection}>
      <p className={styles.previewSectionTitle}>{title}</p>
      <div className={styles.previewInfo}>{children}</div>
    </div>
  );
}
