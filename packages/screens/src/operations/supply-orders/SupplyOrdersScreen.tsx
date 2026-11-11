import { useSupplyOrders } from './use-supply-orders';
import SupplyOrderForm from './SupplyOrderForm';
import SupplyOrderCard from './SupplyOrderCard';
import type { SupplyOrderMode } from './supply-order-view';
import { Button } from '../../../../pentagono/src';
import styles from './SupplyOrdersScreen.module.scss';

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
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <span className={styles.eyebrow}>Estoque e abastecimento</span>
          <h1>Pedidos de insumos</h1>
          <p>
            {mode === 'factory'
              ? 'Revise solicitações, prepare e registre os despachos.'
              : 'Solicite insumos à Fábrica e confirme o que foi recebido.'}
          </p>
        </div>
      </header>
      {!!state.error && (
        <div className={styles.error} role="alert">
          <span>{state.error}</span>
          <Button variant="secondary" size="sm" onClick={() => void state.refresh()}>
            Tentar novamente
          </Button>
        </div>
      )}
      {mode === 'franchise' && (
        <SupplyOrderForm catalog={state.catalog} saving={state.saving} onSubmit={(input) => state.create(input)} />
      )}
      {state.loading ? (
        <div className={styles.loading} role="status">
          <span className={styles.spinner} />
          <span>Carregando pedidos...</span>
        </div>
      ) : state.orders.length === 0 ? (
        <section className={styles.emptyState} aria-live="polite">
          <span className={styles.emptyIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
              <path d="m4.5 7.7 7.5 4.4 7.5-4.4M12 12v8.5M8 5.3l8 4.5" />
            </svg>
          </span>
          <h2>Nenhum pedido por aqui ainda</h2>
          <p>
            {mode === 'factory'
              ? 'Quando uma franquia solicitar insumos, o pedido aparecerá nesta lista.'
              : 'Monte seu primeiro pedido acima e acompanhe por aqui cada etapa até o recebimento.'}
          </p>
        </section>
      ) : (
        <section className={styles.ordersSection} aria-label="Pedidos realizados">
          <div className={styles.ordersHeading}>
            <h2>Pedidos realizados</h2>
            <span>{state.orders.length} {state.orders.length === 1 ? 'pedido' : 'pedidos'}</span>
          </div>
          {state.orders.map((order) => (
            <SupplyOrderCard
              key={order.id}
              order={order}
              mode={mode}
              appearance={mode === 'factory' ? 'kanban' : 'default'}
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
