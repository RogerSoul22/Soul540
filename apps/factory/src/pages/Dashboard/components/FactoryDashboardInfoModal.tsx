import { Button, Modal } from '../../../../../../packages/pentagono/src/index';
import styles from '../styles/Dashboard.module.scss';

export default function FactoryDashboardInfoModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Sobre o Dashboard" onClose={onClose} closeOnOverlay maxWidth={480} flush>
      <div className={styles.modalBody}>
        <div className={styles.infoSection}>
          <p className={styles.infoSectionTitle}>O que é o Dashboard?</p>
          <p className={styles.infoText}>
            O <strong>Dashboard</strong> é a tela inicial do sistema. Ele exibe uma visão geral dos eventos do mês,
            alertas de tarefas urgentes e as principais métricas do negócio.
          </p>
        </div>
        <div className={styles.infoSection}>
          <p className={styles.infoSectionTitle}>Calendário de eventos</p>
          <ul className={styles.infoList}>
            <li>Exibe todos os eventos cadastrados no mês atual.</li>
            <li>Clique em um evento para ver seus detalhes completos.</li>
            <li>Use as setas para navegar entre os meses.</li>
            <li>O contador mostra quantos eventos há no mês em exibição.</li>
          </ul>
        </div>
      </div>
      <div className={styles.modalFooter}>
        <span />
        <Button variant="primary" onClick={onClose}>
          Entendido
        </Button>
      </div>
    </Modal>
  );
}
