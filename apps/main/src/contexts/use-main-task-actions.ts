import { useCallback } from 'react';
import { apiFetch } from '../lib/api';
import type { Task, TaskHistoryEntry } from '@soul540/contracts';
import type { AppDataState } from './app-context-types';

const buildHeaders = (withBody = false): HeadersInit => ({
  ...(withBody ? { 'Content-Type': 'application/json' } : {}),
  'X-System': 'main',
});

export function useMainTaskActions(state: AppDataState) {
  const addTask = useCallback(
    async (data: Omit<Task, 'id' | 'createdAt'>) => {
      const response = await apiFetch('/api/tasks', {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Falha ao criar tarefa');
      const created: Task = await response.json();
      state.setTasks((previous) => [...previous, created]);
      return created;
    },
    [state.setTasks],
  );

  const updateTask = useCallback(
    async (id: string, data: Partial<Task>) => {
      const response = await apiFetch('/api/tasks/' + id, {
        method: 'PUT',
        headers: buildHeaders(true),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Falha ao atualizar tarefa');
      const updated: Task = await response.json();
      state.setTasks((previous) => previous.map((task) => (task.id === id ? updated : task)));
      if (data.status === 'done') state.refreshTaskHistory();
    },
    [state.setTasks, state.refreshTaskHistory],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const response = await apiFetch('/api/tasks/' + id, {
        method: 'DELETE',
        headers: buildHeaders(),
      });
      if (!response.ok) throw new Error('Falha ao excluir tarefa');
      state.setTasks((previous) => previous.filter((task) => task.id !== id));
    },
    [state.setTasks],
  );

  const addTaskHistory = useCallback(
    async (data: Omit<TaskHistoryEntry, 'id'>) => {
      const response = await apiFetch('/api/task-history', {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Falha ao criar histórico');
      const created: TaskHistoryEntry = await response.json();
      state.setTaskHistory((previous) => [created, ...previous]);
    },
    [state.setTaskHistory],
  );

  const deleteTaskHistory = useCallback(
    async (id: string) => {
      const response = await apiFetch('/api/task-history/' + id, {
        method: 'DELETE',
        headers: buildHeaders(),
      });
      if (!response.ok) throw new Error('Falha ao excluir histórico');
      state.setTaskHistory((previous) => previous.filter((entry) => entry.id !== id));
    },
    [state.setTaskHistory],
  );

  return { addTask, updateTask, deleteTask, addTaskHistory, deleteTaskHistory };
}
