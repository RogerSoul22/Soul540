import type { EventosController } from '../hooks/use-eventos-controller';
import styles from '../styles/Eventos.module.scss';

export default function EventosInfoModal({ controller }: { controller: EventosController }) {
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
              A página de <strong>Eventos</strong> centraliza todos os agendamentos de pizza. Cada evento contém
              informações completas: data, local, equipe, valor do contrato, cardápio e documentos.
            </p>
          </div>
          <div className={styles.infoSection}>
            <p className={styles.infoSectionTitle}>Como criar um agendamento</p>
            <ol className={styles.infoList}>
              <li>
                Clique em <strong>Novo Agendamento</strong> no canto superior direito.
              </li>
              <li>Preencha nome do evento, data, local e demais informações.</li>
              <li>Selecione os funcionários da equipe e o responsável.</li>
              <li>
                Informe o valor do contrato — ele será registrado automaticamente no <strong>Financeiro</strong>.
              </li>
              <li>
                Clique em <strong>Criar Agendamento</strong> para salvar.
              </li>
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
