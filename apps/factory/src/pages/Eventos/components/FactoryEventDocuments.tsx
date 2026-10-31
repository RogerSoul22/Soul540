import type { PizzaEvent } from '@soul540/contracts';
import styles from '../styles/Eventos.module.scss';
import FactoryEventDocumentCard from './FactoryEventDocumentCard';

export default function FactoryEventDocuments({ event }: { event: PizzaEvent }) {
  const hasPayment = Boolean(event.paymentProofName || event.paymentProofData);
  const hasContract = Boolean(event.contractPdfName || event.contractPdfData);
  if (!hasPayment && !hasContract && !event.createdBy) return null;

  return (
    <>
      {(hasPayment || hasContract) && (
        <div className={styles.detailSection}>
          <p className={styles.detailSectionTitle}>Documentos</p>
          <div className={styles.docGrid}>
            {hasPayment && (
              <FactoryEventDocumentCard
                data={event.paymentProofData}
                downloadName={event.paymentProofName}
                label="Comprovante de Pagamento"
                name={event.paymentProofName}
                styles={styles}
              />
            )}
            {hasContract && (
              <FactoryEventDocumentCard
                data={event.contractPdfData}
                downloadName={event.contractPdfName}
                label="Contrato"
                name={event.contractPdfName}
                styles={styles}
              />
            )}
          </div>
        </div>
      )}
      {event.createdBy && (
        <div className={styles.detailSection}>
          <p className={styles.detailSectionTitle}>Criado por</p>
          <p className={styles.detailValue}>{event.createdBy}</p>
        </div>
      )}
    </>
  );
}
