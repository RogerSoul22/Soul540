import type { FactoryEventController } from '../hooks/use-factory-event-controller';
import styles from '../styles/Eventos.module.scss';

export default function FactoryEventsInfoModal({ controller }: { controller: FactoryEventController }) {
  const { showInfo, setShowInfo } = controller;
  if (!showInfo) return null;
  return (
    <div className={styles.overlay} onClick={() => setShowInfo(false)}>
      <div className={styles.modal} style={{ maxWidth: 480 }} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Sobre esta página</h2>
          <button className={styles.modalClose} onClick={() => setShowInfo(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.infoSection}>
            <p className={styles.infoSectionTitle}>O que é esta página?</p>
            <p className={styles.infoText}>
              A página de <strong>Eventos</strong> exibe todos os agendamentos de pizza da unidade principal e das
              franquias. A fábrica tem acesso somente de leitura — não é possível criar, editar ou excluir eventos por
              aqui.
            </p>
          </div>
          <div className={styles.infoSection}>
            <p className={styles.infoSectionTitle}>Como visualizar um evento</p>
            <ol className={styles.infoList}>
              <li>Clique em qualquer card de evento para ver os detalhes completos.</li>
              <li>Use a barra de busca para filtrar eventos por nome.</li>
              <li>Os eventos fechados são agrupados por mês — clique no mês para expandir.</li>
            </ol>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <span />
          <button className={styles.btnPrimary} onClick={() => setShowInfo(false)}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
