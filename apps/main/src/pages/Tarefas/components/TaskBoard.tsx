import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Task, TaskStatus } from '../../../../../../packages/contracts/src/index';
import { Badge } from '../../../../../../packages/ui/src/index';
import {
  taskPriorityLabels as priorityLabels,
  taskStatusLabels as statusLabels,
} from '../../../../../../packages/screens/src/index';
import TaskCard, { TaskMoveControls } from './TaskCard';
import { PRIORITY_COLORS, STATUS_COLORS, type TaskGroups, type ViewMode } from '../types/task-types';
import styles from '../styles/Tarefas.module.scss';

type Props = {
  viewMode: ViewMode;
  groups: TaskGroups;
  filtered: Task[];
  eventMap: Record<string, string>;
  columns: readonly { id: TaskStatus; label: string }[];
  draggedId: string | null;
  dragOverColumn: TaskStatus | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (status: TaskStatus) => void;
  onDrop: (status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: TaskStatus) => void;
  onArchive: (task: Task) => void;
};

export default function TaskBoard(props: Props) {
  if (props.viewMode === 'list') {
    return <TaskList {...props} />;
  }
  return (
    <div className={styles.kanban}>
      {props.columns.map((column) => (
        <div key={column.id} className={styles.column}>
          <div className={styles.columnHeader}>
            <span className={styles.columnTitle}>{column.label}</span>
            <span className={styles.columnCount}>{props.groups[column.id].length}</span>
          </div>
          <div
            className={styles.columnBody + (props.dragOverColumn === column.id ? ' ' + styles.columnBodyOver : '')}
            onDragOver={(event) => {
              event.preventDefault();
              props.onDragOver(column.id);
            }}
            onDrop={(event) => {
              event.preventDefault();
              props.onDrop(column.id);
            }}
          >
            {props.groups[column.id].length === 0 ? (
              <div className={styles.colEmpty}>Arraste uma tarefa aqui</div>
            ) : (
              props.groups[column.id].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  eventName={props.eventMap[task.eventId || '']}
                  columns={props.columns}
                  onDelete={() => props.onDelete(task.id)}
                  onMove={(status) => props.onMove(task.id, status)}
                  onArchive={() => props.onArchive(task)}
                  onDragStart={() => props.onDragStart(task.id)}
                  onDragEnd={props.onDragEnd}
                  dragging={props.draggedId === task.id}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskList(props: Props) {
  return (
    <div className={styles.listView}>
      {props.filtered.length === 0 ? (
        <div className={styles.empty}>Nenhuma tarefa encontrada.</div>
      ) : (
        props.filtered.map((task) => {
          const index = props.columns.findIndex((column) => column.id === task.status);
          return (
            <div key={task.id} className={styles.listItem}>
              <div className={styles.listItemInfo}>
                <p className={styles.listItemTitle}>{task.title}</p>
                <p className={styles.listItemSub}>
                  {task.assignee && <span>{task.assignee}</span>}
                  {task.eventId && <span> · {props.eventMap[task.eventId]}</span>}
                  {task.dueDate && (
                    <span> · Prazo: {format(parseISO(task.dueDate), "dd 'de' MMM", { locale: ptBR })}</span>
                  )}
                </p>
              </div>
              <div className={styles.listItemBadges}>
                <Badge variant={PRIORITY_COLORS[task.priority]}>{priorityLabels[task.priority]}</Badge>
                <TaskMoveControls
                  task={task}
                  previous={props.columns[index - 1]}
                  next={props.columns[index + 1]}
                  onMove={(status) => props.onMove(task.id, status)}
                />
                <Badge variant={STATUS_COLORS[task.status]}>{statusLabels[task.status]}</Badge>
                <button className={styles.btnDelete} onClick={() => props.onDelete(task.id)}>
                  Excluir
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
