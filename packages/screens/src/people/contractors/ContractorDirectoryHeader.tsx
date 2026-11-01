import { Button, InfoButton, PageHeader } from '../../../../pentagono/src/index';
import styles from './styles/ContractorDirectoryScreen.module.scss';

interface ContractorDirectoryHeaderProps {
  exportFileName: string;
  onCreate: () => void;
  onExport: () => void;
  onOpenInfo: () => void;
  totalActive: number;
  totalContractors: number;
}

export default function ContractorDirectoryHeader({
  exportFileName,
  onCreate,
  onExport,
  onOpenInfo,
  totalActive,
  totalContractors,
}: ContractorDirectoryHeaderProps) {
  return (
    <>
      <PageHeader
        title="Contratantes"
        subtitle="Gerencie clientes e contratantes"
        titleExtra={
          <>
            <InfoButton label="Como usar esta página" onClick={onOpenInfo} />
          </>
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              className={styles.exportButton}
              onClick={onExport}
              title={exportFileName}
            >
              Exportar
            </Button>
            <Button variant="primary" onClick={onCreate}>
              + Novo Contratante
            </Button>
          </>
        }
      />
      <section className={styles.kpiGrid} aria-label="Indicadores de contratantes">
        <div className={`${styles.kpiCard} ${styles.blue}`}>
          <span>Total</span>
          <strong>{totalContractors}</strong>
        </div>
        <div className={`${styles.kpiCard} ${styles.green}`}>
          <span>Ativos</span>
          <strong>{totalActive}</strong>
        </div>
      </section>
    </>
  );
}
