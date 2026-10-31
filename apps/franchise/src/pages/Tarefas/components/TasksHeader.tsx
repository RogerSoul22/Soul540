import { ROUTES } from '../../../routes';
import { getFranchiseBasePath } from '../../../franchise-path';
import type { ViewMode } from '../types/task-types';
import styles from '../styles/Tarefas.module.scss';

type Props = {
  viewMode: ViewMode;
  onViewMode: (mode: ViewMode) => void;
  onCreate: () => void;
  onInfo: () => void;
};

export default function TasksHeader({ viewMode, onViewMode, onCreate, onInfo }: Props) {
  return (
    <div className={styles.header}>
      <div>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Tarefas</h1>
          <button className={styles.btnInfo} onClick={onInfo} title="Como usar esta página">
            i
          </button>
        </div>
        <p className={styles.subtitle}>Gerencie e acompanhe o progresso das tarefas</p>
      </div>
      <div className={styles.headerActions}>
        <div className={styles.viewToggle}>
          <button
            className={styles.viewBtn + (viewMode === 'kanban' ? ' ' + styles.viewBtnActive : '')}
            onClick={() => onViewMode('kanban')}
          >
            Kanban
          </button>
          <button
            className={styles.viewBtn + (viewMode === 'list' ? ' ' + styles.viewBtnActive : '')}
            onClick={() => onViewMode('list')}
          >
            Lista
          </button>
        </div>
        <button className={styles.btnPrimary} onClick={onCreate}>
          + Nova Tarefa
        </button>
        <button
          className={styles.btnSecondary}
          onClick={() => window.open(getFranchiseBasePath() + ROUTES.CHECKLIST_ENVIO, '_blank', 'noopener,noreferrer')}
        >
          Checklist envio
        </button>
      </div>
    </div>
  );
}
