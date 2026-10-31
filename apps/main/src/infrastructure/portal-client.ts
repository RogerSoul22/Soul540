import { createApiFetch } from '../../../../packages/api-client/src/index';

export type PortalSystem = 'factory' | 'franchise';

export function createPortalClient(baseUrl: string, system: PortalSystem, franchiseId?: string) {
  const apiFetch = createApiFetch({ baseUrl: baseUrl.replace(/\/+$/, ''), system, franchiseId });
  const request = (path: string) => apiFetch(path, { signal: AbortSignal.timeout(3000) });

  return {
    getEventCount: () => request('/api/events/count'),
    listTasks: () => request('/api/tasks'),
    listEmployees: () => request('/api/employees'),
    listFinances: () => request('/api/finances'),
  };
}
