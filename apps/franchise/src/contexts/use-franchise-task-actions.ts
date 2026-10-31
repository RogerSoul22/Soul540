import { useCallback } from 'react';
import { apiFetch } from '../lib/api';
import type { Task, TaskHistoryEntry } from '../../../../shared/contracts/types';
import type { FranchiseState } from './franchise-context-types';

export function useFranchiseTaskActions(state: FranchiseState) {
  const addTask = useCallback(
    async (data: Omit<Task, 'id' | 'createdAt'>) => {
      const res = await apiFetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Falha ao criar tarefa');
      const created: Task = await res.json();
      state.setTasks((prev) => [...prev, created]);
      return created;
    },
    [state.setTasks],
  );

  const updateTask = useCallback(
    async (id: string, data: Partial<Task>) => {
      const res = await apiFetch('/api/tasks/' + id, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Falha ao atualizar tarefa');
      const updated: Task = await res.json();
      state.setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
      if (data.status === 'done') state.refreshTaskHistory();
    },
    [state.setTasks, state.refreshTaskHistory],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const res = await apiFetch('/api/tasks/' + id, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir tarefa');
      state.setTasks((prev) => prev.filter((task) => task.id !== id));
    },
    [state.setTasks],
  );

  const addTaskHistory = useCallback(
    async (data: Omit<TaskHistoryEntry, 'id'>) => {
      const res = await apiFetch('/api/task-history', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Falha ao criar histórico');
      const created: TaskHistoryEntry = await res.json();
      state.setTaskHistory((prev) => [created, ...prev]);
    },
    [state.setTaskHistory],
  );

  const deleteTaskHistory = useCallback(
    async (id: string) => {
      const res = await apiFetch('/api/task-history/' + id, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Falha ao excluir histórico');
      state.setTaskHistory((prev) => prev.filter((entry) => entry.id !== id));
    },
    [state.setTaskHistory],
  );

  return { addTask, updateTask, deleteTask, addTaskHistory, deleteTaskHistory };
}
