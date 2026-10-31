import type { SuppliesController } from '../hooks/use-supplies-controller';
import styles from '../styles/EstoqueInsumos.module.scss';

export default function SupplyInfoModal({ controller }: { controller: SuppliesController }) {
  if (!controller.showInfo) return null;
  return (
    <div className={styles.overlay} onClick={() => controller.setShowInfo(false)}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Sobre esta página</h2>
          <button className={styles.modalClose} onClick={() => controller.setShowInfo(false)}>
            ×
          </button>
        </div>
        <div className={styles.infoContent}>
          <p>Cadastre insumos, acompanhe estoque mínimo e importe itens de uma NF-e.</p>
          <p>Itens vencidos ou abaixo do mínimo aparecem sinalizados no catálogo.</p>
        </div>
        <div className={styles.formActions}>
          <button className={styles.btnPrimary} onClick={() => controller.setShowInfo(false)}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
