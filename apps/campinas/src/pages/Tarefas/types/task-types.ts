import type { Task, TaskPriority, TaskStatus } from '../../../../../../shared/contracts/types';

export type ViewMode = 'kanban' | 'list';

export type TaskFormData = {
  title: string;
  description: string;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  eventId: string;
};

export const EMPTY_TASK_FORM: TaskFormData = {
  title: '',
  description: '',
  priority: 'medium',
  assignee: '',
  dueDate: '',
  eventId: '',
};

export const STATUS_COLORS: Record<TaskStatus, 'gray' | 'blue' | 'amber' | 'green'> = {
  backlog: 'gray',
  todo: 'blue',
  in_progress: 'amber',
  review: 'blue',
  done: 'green',
};

export const PRIORITY_COLORS: Record<TaskPriority, 'gray' | 'blue' | 'amber' | 'red'> = {
  low: 'gray',
  medium: 'blue',
  high: 'amber',
  urgent: 'red',
};

export type TaskGroups = Record<TaskStatus, Task[]>;
