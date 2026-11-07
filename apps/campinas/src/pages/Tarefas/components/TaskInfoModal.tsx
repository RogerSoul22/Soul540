import { Button, Modal } from '../../../../../../packages/pentagono/src/index';
import styles from '../styles/Tarefas.module.scss';

export default function TaskInfoModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Sobre esta página" onClose={onClose} closeOnOverlay maxWidth={500} flush>
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
        <Button variant="primary" onClick={onClose}>
          Entendido
        </Button>
      </div>
    </Modal>
  );
}
