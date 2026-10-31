import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { TaskHistoryEntry } from '../../../../../../shared/contracts/types';
import { Badge } from '../../../../../../packages/ui/src/index';
import { taskPriorityLabels as priorityLabels } from '../../../../../../packages/screens/src/index';
import { PRIORITY_COLORS } from '../types/task-types';
import styles from '../styles/Tarefas.module.scss';

type Props = {
  entries: TaskHistoryEntry[];
  eventMap: Record<string, string>;
  expanded: boolean;
  onToggle: () => void;
  onReopen: (entry: TaskHistoryEntry) => void;
  onDelete: (id: string) => void;
};

export default function TaskHistory({ entries, eventMap, expanded, onToggle, onReopen, onDelete }: Props) {
  return (
    <div className={styles.historySection}>
      <button className={styles.historyToggle} onClick={onToggle}>
        {expanded ? '⌃' : '⌄'} Histórico de Concluídas <span className={styles.historyCount}>{entries.length}</span>
      </button>
      {expanded && (
        <div className={styles.historyList}>
          {entries.length === 0 ? (
            <div className={styles.historyEmpty}>Nenhuma tarefa concluída ainda.</div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className={styles.historyItem}>
                <div className={styles.historyItemLeft}>
                  <span>✓</span>
                  <div className={styles.historyItemInfo}>
                    <span className={styles.historyItemTitle}>{entry.title}</span>
                    <span className={styles.historyItemMeta}>
                      {entry.assignee && <span>{entry.assignee}</span>}
                      {entry.eventId && <span> · {eventMap[entry.eventId]}</span>}
                      {entry.completedAt && (
                        <span>
                          {' '}
                          · Concluída em{' '}
                          {format(parseISO(entry.completedAt), "dd/MM/yy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <div className={styles.historyItemActions}>
                  <Badge variant={PRIORITY_COLORS[entry.priority]}>{priorityLabels[entry.priority]}</Badge>
                  <button className={styles.historyReopenBtn} onClick={() => onReopen(entry)}>
                    Reabrir
                  </button>
                  <button className={styles.taskDelete} onClick={() => onDelete(entry.id)} title="Remover do histórico">
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
