import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { ALL_STATUSES, getOrderKey, sortOrdersAlphabetically, sortOrdersByNumber } from '../support/task-formatters';
import { useProductionRecipeController } from './use-production-recipe-controller';
import type { AvailableEvent, OrderSearchMode, Pedido, PedidoStatus } from '../types/task-types';

export function useProductionOrdersController() {
  const recipeController = useProductionRecipeController();
  const [availableEvents, setAvailableEvents] = useState<AvailableEvent[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [showNovoPedido, setShowNovoPedido] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [orderSearchMode, setOrderSearchMode] = useState<OrderSearchMode>('typing');
  const [loading, setLoading] = useState(true);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<PedidoStatus | null>(null);

  useEffect(() => {
    apiFetch('/api/production-orders')
      .then((response) => response.json() as Promise<Pedido[]>)
      .then(setPedidos)
      .catch(() => {})
      .finally(() => setLoading(false));
    apiFetch('/api/production-orders/available-events')
      .then((response) => (response.ok ? (response.json() as Promise<AvailableEvent[]>) : []))
      .then((events) => setAvailableEvents(Array.isArray(events) ? events : []))
      .catch(() => {});
  }, []);

  const filteredOrders = useMemo(() => {
    if (orderSearchMode === 'alphabetical')
      return selectedOrderId ? pedidos.filter((order) => getOrderKey(order) === selectedOrderId) : pedidos;
    const search = orderSearchTerm.trim().replace(/^#/, '').toLocaleLowerCase('pt-BR');
    if (!search) return pedidos;
    return pedidos.filter(
      (order) =>
        String(order.orderNumber ?? '').includes(search) || order.filial.toLocaleLowerCase('pt-BR').includes(search),
    );
  }, [orderSearchMode, orderSearchTerm, pedidos, selectedOrderId]);
  const pedidosByStatus = useMemo(() => {
    const map: Record<PedidoStatus, Pedido[]> = { a_preparar: [], a_enviar: [], entregue: [] };
    filteredOrders.forEach((order) => map[order.status].push(order));
    ALL_STATUSES.forEach(({ id }) => map[id].sort(sortOrdersByNumber));
    return map;
  }, [filteredOrders]);
  const ordersForAlphabeticalSelection = useMemo(() => [...pedidos].sort(sortOrdersAlphabetically), [pedidos]);
  const handleOrderSearchModeChange = (mode: OrderSearchMode) => {
    setOrderSearchMode(mode);
    setOrderSearchTerm('');
    setSelectedOrderId('');
  };
  const handleClearOrderFilters = () => {
    setOrderSearchTerm('');
    setSelectedOrderId('');
  };
  const hasActiveOrderFilter =
    orderSearchMode === 'typing' ? Boolean(orderSearchTerm.trim()) : Boolean(selectedOrderId);
  const handleCreatePedido = async (pedido: Pedido) => {
    const saved = (await (
      await apiFetch('/api/production-orders', { method: 'POST', body: JSON.stringify(pedido) })
    ).json()) as Pedido;
    setPedidos((current) => [saved, ...current]);
  };
  const handleMove = async (pedidoId: string, newStatus: PedidoStatus) => {
    const pedido = pedidos.find((order) => getOrderKey(order) === pedidoId);
    if (!pedido || pedido.status === newStatus) return;
    const updated = (await (
      await apiFetch(`/api/production-orders/${pedido.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...pedido, status: newStatus }),
      })
    ).json()) as Pedido;
    setPedidos((current) =>
      current.map((order) => (getOrderKey(order) === pedidoId ? updated : order)),
    );
  };
  const handleDeletePedido = async (pedidoId: string) => {
    const pedido = pedidos.find((order) => getOrderKey(order) === pedidoId);
    if (!pedido) return;
    const unit = pedido?.unit || 'factory';
    await apiFetch(`/api/production-orders/${pedido.id}?unit=${unit}`, { method: 'DELETE' });
    setPedidos((current) => current.filter((order) => getOrderKey(order) !== pedidoId));
  };
  return {
    ...recipeController,
    loading,
    availableEvents,
    pedidos,
    pedidosByStatus,
    ordersForAlphabeticalSelection,
    orderSearchMode,
    orderSearchTerm,
    selectedOrderId,
    setOrderSearchTerm,
    setSelectedOrderId,
    handleOrderSearchModeChange,
    handleClearOrderFilters,
    hasActiveOrderFilter,
    showNovoPedido,
    setShowNovoPedido,
    deleteConfirmId,
    setDeleteConfirmId,
    handleCreatePedido,
    handleMove,
    handleDeletePedido,
    draggedId,
    setDraggedId,
    dragOverCol,
    setDragOverCol,
  };
}
