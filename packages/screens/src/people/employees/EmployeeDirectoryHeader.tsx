import styles from './styles/EmployeeDirectoryHeader.module.scss';

interface EmployeeDirectoryHeaderProps {
  onCreate: () => void;
  onOpenInfo: () => void;
  totalActive: number;
  totalEmployees: number;
}

export default function EmployeeDirectoryHeader({
  onCreate,
  onOpenInfo,
  totalActive,
  totalEmployees,
}: EmployeeDirectoryHeaderProps) {
  return (
    <>
      <header className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Funcionários</h1>
            <button className={styles.infoButton} onClick={onOpenInfo} title="Como funciona esta página">
              <InfoIcon />
            </button>
          </div>
          <p className={styles.subtitle}>Gerencie equipe e colaboradores</p>
        </div>
        <button className={styles.primaryButton} onClick={onCreate}>
          <PlusIcon />
          Novo Funcionário
        </button>
      </header>

      <div className={styles.summaryGrid}>
        <SummaryCard color="blue" label="Total" value={totalEmployees} />
        <SummaryCard color="green" label="Ativos" value={totalActive} />
      </div>
    </>
  );
}

function SummaryCard({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className={`${styles.summaryCard} ${styles[color]}`}>
      <div className={styles.summaryLabel}>{label}</div>
      <div className={styles.summaryValue}>{value}</div>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
