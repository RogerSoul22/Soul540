import styles from '../styles/Tarefas.module.scss';

export default function TaskInfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Sobre esta página</h2>
          <button className={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.infoSection}>
            <p className={styles.infoSectionTitle}>O que é esta página?</p>
            <p className={styles.infoText}>
              A página de <strong>Tarefas</strong> permite gerenciar atividades em um quadro Kanban ou em lista.
            </p>
          </div>
          <div className={styles.infoSection}>
            <p className={styles.infoSectionTitle}>Como mover tarefas</p>
            <ol className={styles.infoList}>
              <li>
                No <strong>Kanban</strong>, arraste o card para a coluna desejada.
              </li>
              <li>
                Na <strong>Lista</strong>, use os controles de status.
              </li>
              <li>Colunas: Backlog → A Fazer → Em Andamento → Revisão → Concluído.</li>
            </ol>
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
