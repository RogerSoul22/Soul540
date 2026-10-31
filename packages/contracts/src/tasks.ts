export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate?: string;
  eventId?: string;
  createdAt: string;
}

export interface TaskHistoryEntry {
  id: string;
  taskId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  assignee: string;
  dueDate?: string;
  eventId?: string;
  completedAt: string;
  source?: string;
}
