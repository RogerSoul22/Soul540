export type KanbanTaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type KanbanTaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export const taskColumns: { id: KanbanTaskStatus; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'A Fazer' },
  { id: 'in_progress', label: 'Em Andamento' },
  { id: 'review', label: 'Revisão' },
  { id: 'done', label: 'Concluído' },
];

export const taskStatusLabels: Record<KanbanTaskStatus, string> = Object.fromEntries(
  taskColumns.map((column) => [column.id, column.label]),
) as Record<KanbanTaskStatus, string>;

export const taskPriorityLabels: Record<KanbanTaskPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};
