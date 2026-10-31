import styles from '../styles/Dashboard.module.scss';

type Props = {
  today: string;
  greeting: string;
  urgentTaskCount: number;
  onInfo: () => void;
};

export default function DashboardHeader({ today, greeting, urgentTaskCount, onInfo }: Props) {
  return (
    <div className={styles.header}>
      <p className={styles.dateLabel}>{today}</p>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{greeting}</h1>
        <button className={styles.btnInfo} onClick={onInfo} title="Sobre o Dashboard" aria-label="Sobre o Dashboard">
          <span aria-hidden="true">i</span>
        </button>
      </div>
      {urgentTaskCount > 0 ? (
        <p className={styles.subtitle}>
          Você tem{' '}
          <strong>
            {urgentTaskCount} tarefa{urgentTaskCount > 1 ? 's' : ''} urgente
            {urgentTaskCount > 1 ? 's' : ''}
          </strong>{' '}
          pendente{urgentTaskCount > 1 ? 's' : ''} hoje.
        </p>
      ) : (
        <p className={styles.subtitle}>Nenhuma urgência no momento — tudo sob controle.</p>
      )}
    </div>
  );
}
