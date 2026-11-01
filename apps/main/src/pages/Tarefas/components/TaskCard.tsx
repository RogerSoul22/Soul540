import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Task, TaskStatus } from '../../../../../../packages/contracts/src/index';
import { Badge, Button } from '../../../../../../packages/pentagono/src/index';
import {
  taskPriorityLabels as priorityLabels,
  taskStatusLabels as statusLabels,
} from '../../../../../../packages/screens/src/index';
import { PRIORITY_COLORS } from '../types/task-types';
import styles from '../styles/Tarefas.module.scss';

type Props = {
  task: Task;
  eventName?: string;
  columns: readonly { id: TaskStatus; label: string }[];
  onDelete: () => void;
  onMove: (status: TaskStatus) => void;
  onArchive: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  dragging: boolean;
};

export default function TaskCard({
  task,
  eventName,
  columns,
  onDelete,
  onMove,
  onArchive,
  onDragStart,
  onDragEnd,
  dragging,
}: Props) {
  const index = columns.findIndex((column) => column.id === task.status);
  const previous = columns[index - 1];
  const next = columns[index + 1];

  return (
    <div
      className={styles.taskCard + (dragging ? ' ' + styles.taskCardDragging : '')}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className={styles.taskTop}>
        <Badge variant={PRIORITY_COLORS[task.priority]}>{priorityLabels[task.priority]}</Badge>
        <Button variant="danger" size="sm" className={styles.taskDelete} onClick={onDelete} title="Excluir">
          ×
        </Button>
      </div>
      <p className={styles.taskTitle}>{task.title}</p>
      {task.description && <p className={styles.taskDesc}>{task.description}</p>}
      <div className={styles.taskMeta}>
        {task.assignee && <span>{task.assignee}</span>}
        {task.dueDate && <span>{format(parseISO(task.dueDate), 'dd/MM', { locale: ptBR })}</span>}
        {task.eventId && <span className={styles.taskEvent}>{eventName || ''}</span>}
      </div>
      <TaskMoveControls task={task} previous={previous} next={next} onMove={onMove} onArchive={onArchive} />
    </div>
  );
}

export function TaskMoveControls({
  task,
  previous,
  next,
  onMove,
  onArchive,
}: {
  task: Task;
  previous?: { id: TaskStatus; label: string };
  next?: { id: TaskStatus; label: string };
  onMove: (status: TaskStatus) => void;
  onArchive?: () => void;
}) {
  return (
    <div className={styles.taskMoveRow}>
      <Button
        variant="outline"
        className={styles.taskMoveBtn}
        disabled={!previous}
        onClick={() => previous && onMove(previous.id)}
      >
        ‹
      </Button>
      <span className={styles.taskMoveLabel}>{statusLabels[task.status]}</span>
      {task.status === 'done' && onArchive ? (
        <Button variant="outline" className={styles.taskArchiveBtn} onClick={onArchive}>
          Histórico
        </Button>
      ) : (
        <Button
          variant="outline"
          className={styles.taskMoveBtn}
          disabled={!next}
          onClick={() => next && onMove(next.id)}
        >
          ›
        </Button>
      )}
    </div>
  );
}
