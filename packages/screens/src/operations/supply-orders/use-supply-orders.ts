import { useCallback, useEffect, useState } from 'react';
import type {
  ConfirmSupplyOrderReceiptInput,
  CreateSupplyOrderInput,
  DispatchSupplyOrderInput,
  SupplyOrderSummary,
} from '@soul540/contracts';

export type FactorySupplyOption = { id: string; name: string; measureUnit: string; availableQuantity: number };
export type FranchiseSupplyOption = {
  id: string;
  name: string;
  measureUnit: string;
  quantity: number;
  factorySupplyId?: string;
};
type ApiFetch = (path: string, init?: RequestInit) => Promise<Response>;

export function useSupplyOrders(apiFetch: ApiFetch, mode: 'franchise' | 'factory') {
  const [orders, setOrders] = useState<SupplyOrderSummary[]>([]);
  const [catalog, setCatalog] = useState<FactorySupplyOption[]>([]);
  const [localSupplies, setLocalSupplies] = useState<FranchiseSupplyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [orderResponse, catalogResponse, localResponse] = await Promise.all([
        apiFetch('/api/supply-orders'),
        mode === 'franchise' ? apiFetch('/api/supply-orders/catalog') : Promise.resolve(null),
        mode === 'franchise' ? apiFetch('/api/supply-orders/local-supplies') : Promise.resolve(null),
      ]);
      for (const response of [orderResponse, catalogResponse, localResponse]) {
        if (response && !response.ok) throw new Error('Falha ao consultar dados dos pedidos.');
      }
      const loadedOrders = await orderResponse.json();
      setOrders(
        Array.isArray(loadedOrders) ? loadedOrders.map((order) => ({ ...order, id: order.id || order._id })) : [],
      );
      if (catalogResponse)
        setCatalog(
          (await catalogResponse.json()).map((item: FactorySupplyOption & { _id?: string }) => ({
            ...item,
            id: item.id || item._id,
          })),
        );
      if (localResponse)
        setLocalSupplies(
          (await localResponse.json()).map((item: FranchiseSupplyOption & { _id?: string }) => ({
            ...item,
            id: item.id || item._id,
          })),
        );
    } catch {
      setError('Não foi possível carregar os pedidos de insumos.');
    } finally {
      setLoading(false);
    }
  }, [apiFetch, mode]);

  useEffect(() => void refresh(), [refresh]);

  const mutate = useCallback(
    async (path: string, method: string, body?: unknown) => {
      setSaving(true);
      setError('');
      try {
        const response = await apiFetch(path, {
          method,
          ...(body && { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
        });
        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error || 'Não foi possível salvar o pedido.');
        }
        await refresh();
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Não foi possível salvar o pedido.';
        setError(message);
        throw cause;
      } finally {
        setSaving(false);
      }
    },
    [apiFetch, refresh],
  );

  return {
    orders,
    catalog,
    localSupplies,
    loading,
    saving,
    error,
    setError,
    refresh,
    create: (input: CreateSupplyOrderInput) => mutate('/api/supply-orders', 'POST', input),
    prepare: (id: string) => mutate(`/api/supply-orders/${id}/preparing`, 'POST', {}),
    dispatch: (id: string, input: DispatchSupplyOrderInput) =>
      mutate(`/api/supply-orders/${id}/dispatch`, 'POST', input),
    receive: (id: string, input: ConfirmSupplyOrderReceiptInput) =>
      mutate(`/api/supply-orders/${id}/receipt`, 'POST', input),
    cancel: (id: string) => mutate(`/api/supply-orders/${id}/cancel`, 'POST', {}),
  };
}
