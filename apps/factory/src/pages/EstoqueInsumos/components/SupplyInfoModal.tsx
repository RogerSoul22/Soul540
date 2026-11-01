import { Button, Modal } from '../../../../../../packages/pentagono/src/index';
import type { SuppliesController } from '../hooks/use-supplies-controller';
import styles from '../styles/EstoqueInsumos.module.scss';

export default function SupplyInfoModal({ controller }: { controller: SuppliesController }) {
  if (!controller.showInfo) return null;
  return (
    <Modal title="Sobre esta página" onClose={() => controller.setShowInfo(false)} closeOnOverlay maxWidth={520} flush>
      <div className={styles.infoContent}>
        <p>Cadastre insumos, acompanhe estoque mínimo e importe itens de uma NF-e.</p>
        <p>Itens vencidos ou abaixo do mínimo aparecem sinalizados no catálogo.</p>
      </div>
      <div className={styles.formActions}>
        <Button variant="primary" onClick={() => controller.setShowInfo(false)}>
          Entendido
        </Button>
      </div>
    </Modal>
  );
}
