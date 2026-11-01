import { Button, InfoButton, PageHeader } from '../../../../pentagono/src/index';
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
      <PageHeader
        title="Funcionários"
        subtitle="Gerencie equipe e colaboradores"
        titleExtra={
          <>
            <InfoButton label="Como funciona esta página" onClick={onOpenInfo} />
          </>
        }
        actions={
          <>
            <Button variant="primary" onClick={onCreate}>
              <PlusIcon />
              Novo Funcionário
            </Button>
          </>
        }
      />

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
