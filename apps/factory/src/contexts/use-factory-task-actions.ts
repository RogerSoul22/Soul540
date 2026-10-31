import { useCallback } from 'react';
import { apiFetch } from '../lib/api';
import type { Task } from '../../../../shared/contracts/types';
import type { FactoryState } from './factory-context-types';

export function useFactoryTaskActions(state: FactoryState) {
  const addTask = useCallback(
    async (data: Omit<Task, 'id' | 'createdAt'>) => {
      const res = await apiFetch('/api/tasks', { method: 'POST', body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Falha ao criar tarefa');
      const created: Task = await res.json();
      state.setTasks((prev) => [...prev, created]);
      return created;
    },
    [state.setTasks],
  );

  const updateTask = useCallback(
    async (id: string, data: Partial<Task>) => {
      const res = await apiFetch('/api/tasks/' + id, { method: 'PUT', body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Falha ao atualizar tarefa');
      const updated: Task = await res.json();
      state.setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
    },
    [state.setTasks],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const res = await apiFetch('/api/tasks/' + id, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir tarefa');
      state.setTasks((prev) => prev.filter((task) => task.id !== id));
    },
    [state.setTasks],
  );

  return { addTask, updateTask, deleteTask };
}
