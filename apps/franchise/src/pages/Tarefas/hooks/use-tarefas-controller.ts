import { useMemo, useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import type { Task, TaskPriority, TaskStatus } from '../../../../../../shared/contracts/types';
import { taskColumns as columns } from '../../../../../../packages/screens/src/index';
import { EMPTY_TASK_FORM, type TaskFormData, type ViewMode, type TaskGroups } from '../types/task-types';

export function useTarefasController() {
  const { tasks, events, taskHistory, addTaskHistory, deleteTaskHistory, addTask, updateTask, deleteTask } = useApp();
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [showModal, setShowModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [form, setForm] = useState<TaskFormData>(EMPTY_TASK_FORM);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const eventMap = useMemo(() => Object.fromEntries(events.map((event) => [event.id, event.name])), [events]);
  const filtered = useMemo(
    () =>
      tasks.filter(
        (task) =>
          (eventFilter === 'all' || task.eventId === eventFilter) &&
          (!search || task.title.toLowerCase().includes(search.toLowerCase())),
      ),
    [eventFilter, search, tasks],
  );
  const tasksByStatus = useMemo(() => {
    const groups = {
      backlog: [],
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    } as TaskGroups;
    filtered.forEach((task) => groups[task.status].push(task));
    return groups;
  }, [filtered]);

  async function createTask() {
    if (!form.title.trim()) return;
    await addTask({
      title: form.title,
      description: form.description,
      status: 'backlog',
      priority: form.priority,
      assignee: form.assignee,
      dueDate: form.dueDate || undefined,
      eventId: form.eventId || undefined,
    });
    setShowModal(false);
    setForm(EMPTY_TASK_FORM);
  }

  function moveTask(taskId: string, status: TaskStatus) {
    updateTask(taskId, { status });
  }

  async function archiveTask(task: Task) {
    await addTaskHistory({
      taskId: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignee: task.assignee,
      dueDate: task.dueDate,
      eventId: task.eventId,
      completedAt: new Date().toISOString(),
    });
    await deleteTask(task.id);
  }

  async function reopenTask(entry: (typeof taskHistory)[number]) {
    await addTask({
      title: entry.title,
      description: entry.description,
      status: 'todo',
      priority: entry.priority,
      assignee: entry.assignee,
      dueDate: entry.dueDate,
      eventId: entry.eventId,
    });
    await deleteTaskHistory(entry.id);
  }

  async function confirmDelete() {
    if (deleteTargetId) await deleteTask(deleteTargetId);
    setDeleteTargetId(null);
  }

  function updateForm<Key extends keyof TaskFormData>(key: Key, value: TaskFormData[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return {
    tasks,
    events,
    taskHistory,
    eventMap,
    filtered,
    tasksByStatus,
    columns,
    form,
    search,
    eventFilter,
    viewMode,
    showModal,
    showInfo,
    showHistory,
    deleteTargetId,
    draggedId,
    dragOverColumn,
    doneCount: taskHistory.length,
    urgentCount: tasks.filter((task) => task.priority === 'urgent' && task.status !== 'done').length,
    setSearch,
    setEventFilter,
    setViewMode,
    setShowModal,
    setShowInfo,
    setShowHistory,
    setForm,
    setDeleteTargetId,
    setDraggedId,
    setDragOverColumn,
    updateForm,
    createTask,
    moveTask,
    archiveTask,
    reopenTask,
    confirmDelete,
    deleteTaskHistory,
  };
}
