import { Button, InfoButton, PageHeader } from '../../../../../../packages/pentagono/src/index';
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
    <PageHeader
      title="Tarefas"
      subtitle="Gerencie e acompanhe o progresso das tarefas"
      titleExtra={
        <>
          <InfoButton label="Como usar esta página" onClick={onInfo} />
        </>
      }
      actions={
        <>
          <div className={styles.viewToggle}>
            <Button
              variant="chip"
              className={styles.viewBtn + (viewMode === 'kanban' ? ' ' + styles.viewBtnActive : '')}
              onClick={() => onViewMode('kanban')}
            >
              Kanban
            </Button>
            <Button
              variant="chip"
              className={styles.viewBtn + (viewMode === 'list' ? ' ' + styles.viewBtnActive : '')}
              onClick={() => onViewMode('list')}
            >
              Lista
            </Button>
          </div>
          <Button variant="primary" onClick={onCreate}>
            + Nova Tarefa
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              window.open(getFranchiseBasePath() + ROUTES.CHECKLIST_ENVIO, '_blank', 'noopener,noreferrer')
            }
          >
            Checklist envio
          </Button>
        </>
      }
    />
  );
}
