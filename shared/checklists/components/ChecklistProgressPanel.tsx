import styles from '../styles/ChecklistEnvioPage.module.scss';

type Props = {
  eventName: string;
  progress: number;
  completed: number;
  totalItems: number;
  feedback: string;
};

export function ChecklistProgressPanel({ eventName, progress, completed, totalItems, feedback }: Props) {
  return (
    <div className={`${styles.panel} ${styles.progressPanel}`}>
      <div className={styles.panelBody}>
        <div className={styles.progressTop}>
          <span className={styles.progressLabel}>{eventName}</span>
          <span className={styles.progressNumber}>{progress}%</span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <p className={styles.progressText}>
          {completed} de {totalItems} itens conferidos{feedback ? ` - ${feedback}` : ''}
        </p>
      </div>
    </div>
  );
}
