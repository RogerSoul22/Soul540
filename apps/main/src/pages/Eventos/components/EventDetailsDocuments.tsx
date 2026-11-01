import { Card } from '../../../../../../packages/pentagono/src/index';
import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';
import styles from '../styles/Eventos.module.scss';

export default function EventDetailsDocuments({ event }: { event: PizzaEvent }) {
  return (
    <>
      {/* Documentos */}
      {(event.paymentProofName || event.contractPdfName) && (
        <div className={styles.detailSection}>
          <p className={styles.detailSectionTitle}>Documentos</p>
          <div className={styles.docGrid}>
            {event.paymentProofName && (
              <Card className={styles.docCard}>
                <div className={styles.docCardHeader}>
                  <span className={styles.detailLabel}>Comprovante de Pagamento</span>
                  {event.paymentProofData && (
                    <a
                      href={event.paymentProofData}
                      download={event.paymentProofName}
                      className={styles.docDownloadBtn}
                      title="Baixar"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </a>
                  )}
                </div>
                {event.paymentProofData ? (
                  event.paymentProofData.startsWith('data:image') ? (
                    <img src={event.paymentProofData} alt="Comprovante" className={styles.docPreviewImage} />
                  ) : (
                    <iframe src={event.paymentProofData} className={styles.docPreviewPdf} title="Comprovante" />
                  )
                ) : (
                  <div className={styles.docNoPreview}>
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span>{event.paymentProofName}</span>
                  </div>
                )}
              </Card>
            )}
            {event.contractPdfName && (
              <Card className={styles.docCard}>
                <div className={styles.docCardHeader}>
                  <span className={styles.detailLabel}>Contrato</span>
                  {event.contractPdfData && (
                    <a
                      href={event.contractPdfData}
                      download={event.contractPdfName}
                      className={styles.docDownloadBtn}
                      title="Baixar"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </a>
                  )}
                </div>
                {event.contractPdfData ? (
                  <iframe src={event.contractPdfData} className={styles.docPreviewPdf} title="Contrato" />
                ) : (
                  <div className={styles.docNoPreview}>
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span>{event.contractPdfName}</span>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      )}
    </>
  );
}
