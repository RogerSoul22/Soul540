import { Button, Input, Label, Select } from '../../../../../../packages/pentagono/src/index';
import styles from '../styles/Tarefas.module.scss';
import { getOrderKey } from '../support/task-formatters';
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
      <Label className={styles.orderFilterLabel} htmlFor="order-search-mode">
        Localizar pedido
      </Label>
      <Select
        variant="compact"
        id="order-search-mode"
        className={styles.orderFilterMode}
        value={mode}
        onChange={(event) => onModeChange(event.target.value as OrderSearchMode)}
      >
        <option value="typing">Digitar</option>
        <option value="alphabetical">Lista alfabética</option>
      </Select>
      {mode === 'typing' ? (
        <Input
          className={styles.orderFilterInput}
          type="search"
          value={term}
          onChange={(event) => onTermChange(event.target.value)}
          placeholder="Digite o número ou filial"
          aria-label="Digite o número ou filial"
        />
      ) : (
        <Select
          variant="compact"
          className={styles.orderFilterSelect}
          value={selectedId}
          onChange={(event) => onSelectedChange(event.target.value)}
          aria-label="Selecionar pedido por ordem alfabética"
        >
          <option value="">Todos os pedidos</option>
          {orders.map((order) => (
            <option key={getOrderKey(order)} value={getOrderKey(order)}>
              {order.filial} — #{order.orderNumber ?? 'Sem número'}
            </option>
          ))}
        </Select>
      )}
      <Button
        variant="ghost"
        size="sm"
        type="button"
        className={styles.orderFilterClear}
        onClick={onClear}
        disabled={!hasFilter}
      >
        Limpar filtros
      </Button>
    </div>
  );
}
