import { Button, Modal } from '../../../../../../packages/pentagono/src/index';
import type { EventosController } from '../hooks/use-eventos-controller';
import styles from '../styles/Eventos.module.scss';

export default function EventosInfoModal({ controller }: { controller: EventosController }) {
  const { showInfo, setShowInfo } = controller;
  if (!showInfo) return null;
  return (
    <Modal title="Sobre esta página" onClose={() => setShowInfo(false)} closeOnOverlay maxWidth={480} flush>
      <div className={styles.modalBody}>
        <div className={styles.infoSection}>
          <p className={styles.infoSectionTitle}>O que é esta página?</p>
          <p className={styles.infoText}>
            A página de <strong>Eventos</strong> centraliza todos os eventos de pizza. Cada evento contém informações
            completas: data, local, equipe, valor do contrato, cardápio e documentos.
          </p>
        </div>
        <div className={styles.infoSection}>
          <p className={styles.infoSectionTitle}>Como criar um evento</p>
          <ol className={styles.infoList}>
            <li>
              Clique em <strong>Novo Evento</strong> no canto superior direito.
            </li>
            <li>Preencha nome do evento, data, local e demais informações.</li>
            <li>Selecione os funcionários da equipe e o responsável.</li>
            <li>
              Informe o valor do contrato — ele será registrado automaticamente no <strong>Financeiro</strong>.
            </li>
            <li>
              Clique em <strong>Criar Evento</strong> para salvar.
            </li>
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
