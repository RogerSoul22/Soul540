import { Button, Modal } from '../../../../../../packages/pentagono/src/index';
import type { FactoryEventController } from '../hooks/use-factory-event-controller';
import styles from '../styles/Eventos.module.scss';

export default function FactoryEventsInfoModal({ controller }: { controller: FactoryEventController }) {
  const { showInfo, setShowInfo } = controller;
  if (!showInfo) return null;
  return (
    <Modal title="Sobre esta página" onClose={() => setShowInfo(false)} closeOnOverlay maxWidth={480} flush>
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
        <Button variant="primary" onClick={() => setShowInfo(false)}>
          Entendido
        </Button>
      </div>
    </Modal>
  );
}
