import styles from '../styles/Dashboard.module.scss';

export default function DashboardInfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Sobre o Dashboard</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>
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
              <li>Exibe todos os agendamentos cadastrados no mês atual.</li>
              <li>Clique em um evento para ver seus detalhes completos.</li>
              <li>Use as setas para navegar entre os meses.</li>
              <li>O contador mostra quantos eventos há no mês em exibição.</li>
            </ul>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <span />
          <button className={styles.btnPrimary} onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
