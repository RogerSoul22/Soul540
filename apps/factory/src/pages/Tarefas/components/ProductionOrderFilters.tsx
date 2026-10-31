import styles from '../styles/Tarefas.module.scss';
import type { OrderSearchMode, Pedido } from '../types/task-types';

type Props = {
  mode: OrderSearchMode;
  term: string;
  selectedId: string;
  orders: Pedido[];
  hasFilter: boolean;
  onTermChange: (value: string) => void;
  onSelectedChange: (value: string) => void;
  onModeChange: (mode: OrderSearchMode) => void;
  onClear: () => void;
};

export default function ProductionOrderFilters({
  mode,
  term,
  selectedId,
  orders,
  hasFilter,
  onTermChange,
  onSelectedChange,
  onModeChange,
  onClear,
}: Props) {
  return (
    <div className={styles.orderFilterBar}>
      <label className={styles.orderFilterLabel} htmlFor="order-search-mode">
        Localizar pedido
      </label>
      <select
        id="order-search-mode"
        className={styles.orderFilterMode}
        value={mode}
        onChange={(event) => onModeChange(event.target.value as OrderSearchMode)}
      >
        <option value="typing">Digitar</option>
        <option value="alphabetical">Lista alfabética</option>
      </select>
      {mode === 'typing' ? (
        <input
          className={styles.orderFilterInput}
          type="search"
          value={term}
          onChange={(event) => onTermChange(event.target.value)}
          placeholder="Digite o número ou filial"
          aria-label="Digite o número ou filial"
        />
      ) : (
        <select
          className={styles.orderFilterSelect}
          value={selectedId}
          onChange={(event) => onSelectedChange(event.target.value)}
          aria-label="Selecionar pedido por ordem alfabética"
        >
          <option value="">Todos os pedidos</option>
          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              {order.filial} — #{order.orderNumber ?? 'Sem número'}
            </option>
          ))}
        </select>
      )}
      <button type="button" className={styles.orderFilterClear} onClick={onClear} disabled={!hasFilter}>
        Limpar filtros
      </button>
    </div>
  );
}
