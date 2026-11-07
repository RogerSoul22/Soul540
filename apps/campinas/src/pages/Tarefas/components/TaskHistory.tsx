import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { TaskHistoryEntry } from '../../../../../../shared/contracts/types';
import { Badge, Button } from '../../../../../../packages/pentagono/src/index';
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
      <Button variant="ghost" size="sm" className={styles.historyToggle} onClick={onToggle}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ flexShrink: 0, transform: expanded ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        Histórico de Concluídas <span className={styles.historyCount}>{entries.length}</span>
      </Button>
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
                  <Button variant="ghost" size="sm" className={styles.historyReopenBtn} onClick={() => onReopen(entry)}>
                    Reabrir
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className={styles.taskDelete}
                    onClick={() => onDelete(entry.id)}
                    title="Remover do histórico"
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
