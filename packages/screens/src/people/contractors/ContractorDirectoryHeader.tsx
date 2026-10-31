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
      <header className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Contratantes</h1>
            <button className={styles.infoButton} onClick={onOpenInfo} title="Como usar esta página">
              i
            </button>
          </div>
          <p className={styles.subtitle}>Gerencie clientes e contratantes</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.exportButton} onClick={onExport} title={exportFileName}>
            Exportar
          </button>
          <button className={styles.primaryButton} onClick={onCreate}>
            + Novo Contratante
          </button>
        </div>
      </header>
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
