import { useCallback, useEffect, useState } from 'react';
import { createPortalClient } from '../../../infrastructure/portal-client';
import type { PortalStats, PortalSystem } from '../types/franchise-types';

export function usePortalController(system: PortalSystem, defaultUrl: string, franchiseId?: string) {
  const storageKey = 'soul540_' + system + '_' + (franchiseId || 'default') + '_url';
  const [url] = useState(() => localStorage.getItem(storageKey) || defaultUrl);
  const [online, setOnline] = useState<boolean | null>(null);
  const [stats, setStats] = useState<PortalStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const parseResponses = async (responses: Response[]) => {
      const [events, tasks, employees, finances] = await Promise.all(responses.map((response) => response.json()));
      const revenue = Array.isArray(finances)
        ? finances
            .filter((finance: { type?: string }) => finance.type === 'revenue')
            .reduce((sum: number, finance: { amount?: number }) => sum + (finance.amount || 0), 0)
        : 0;
      return {
        events: events?.count || 0,
        tasks: Array.isArray(tasks) ? tasks.length : 0,
        employees: Array.isArray(employees) ? employees.length : 0,
        revenue,
      };
    };
    const isSameOrigin = (portalUrl: string) => {
      try {
        return new URL(portalUrl).origin === window.location.origin;
      } catch {
        return true;
      }
    };

    try {
      const base = url.replace(/\/$/, '');
      if (!isSameOrigin(base)) {
        try {
          const client = createPortalClient(base, system, franchiseId);
          const responses = await Promise.all([
            client.getEventCount(),
            client.listTasks(),
            client.listEmployees(),
            client.listFinances(),
          ]);
          if (!responses[0].ok || !(responses[0].headers.get('content-type') || '').includes('json')) {
            throw new Error('portal unavailable');
          }
          setStats(await parseResponses(responses));
          setOnline(true);
          return;
        } catch {
          // Fall back to the local API when the portal cannot be reached.
        }
      }
      const client = createPortalClient('', system, franchiseId);
      const responses = await Promise.all([
        client.getEventCount(),
        client.listTasks(),
        client.listEmployees(),
        client.listFinances(),
      ]);
      if (!responses[0].ok) throw new Error('local api error');
      setStats(await parseResponses(responses));
      setOnline(true);
    } catch {
      setOnline(false);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [franchiseId, system, url]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return {
    online,
    stats,
    loading,
  };
}
