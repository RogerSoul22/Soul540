import { useSupplyOrders } from './use-supply-orders';
import SupplyOrderForm from './SupplyOrderForm';
import SupplyOrderCard from './SupplyOrderCard';
import type { SupplyOrderMode } from './supply-order-view';

type Props = { apiFetch(path: string, init?: RequestInit): Promise<Response>; mode: SupplyOrderMode };
export default function SupplyOrdersScreen({ apiFetch, mode }: Props) {
  const state = useSupplyOrders(apiFetch, mode);
  async function run(action: () => Promise<unknown>) {
    try {
      await action();
    } catch {
      /* the hook exposes the API error */
    }
  }
  return (
    <main style={{ display: 'grid', gap: 16, padding: 24 }}>
      <header>
        <h1>Pedidos de insumos</h1>
        <p>
          {mode === 'factory'
            ? 'Revise solicitações, prepare e registre os despachos.'
            : 'Solicite insumos à Fábrica e confirme o que foi recebido.'}
        </p>
      </header>
      {!!state.error && (
        <div role="alert" style={{ color: '#a11' }}>
          {state.error} <button onClick={() => void state.refresh()}>Tentar novamente</button>
        </div>
      )}
      {mode === 'franchise' && (
        <SupplyOrderForm catalog={state.catalog} saving={state.saving} onSubmit={(input) => state.create(input)} />
      )}
      {state.loading ? (
        <p>Carregando pedidos…</p>
      ) : state.orders.length === 0 ? (
        <p>Nenhum pedido de insumos encontrado.</p>
      ) : (
        <section style={{ display: 'grid', gap: 12 }}>
          {state.orders.map((order) => (
            <SupplyOrderCard
              key={order.id}
              order={order}
              mode={mode}
              localSupplies={state.localSupplies}
              saving={state.saving}
              onPrepare={(id) => run(() => state.prepare(id))}
              onDispatch={(id, items) => run(() => state.dispatch(id, { items }))}
              onReceive={(id, items) => run(() => state.receive(id, { items }))}
              onCancel={(id) => run(() => state.cancel(id))}
            />
          ))}
        </section>
      )}
    </main>
  );
}
