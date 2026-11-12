import { Button, Input, Select } from '../../../../../../packages/pentagono/src/index';
import type { Dispatch, SetStateAction } from 'react';
import styles from '../styles/Tarefas.module.scss';
import { formatQty } from '../support/task-formatters';
import type { Ingredient, Insumo } from '../types/task-types';

type ItemOption = { key: string; id: string; name: string; measure: string; cost: number };
type OrderItem = { id: string; nome: string; measure: string; quantidade: number };

type Props = {
  allItems: ItemOption[];
  ingredients: Ingredient[];
  insumos: Insumo[];
  itemKey: string;
  itemQtd: number;
  setItemKey: Dispatch<SetStateAction<string>>;
  setItemQtd: Dispatch<SetStateAction<number>>;
  addItem: () => void;
  itens: OrderItem[];
  removeItem: (index: number) => void;
};

export default function OrderItemsFields({
  allItems,
  ingredients,
  insumos,
  itemKey,
  itemQtd,
  setItemKey,
  setItemQtd,
  addItem,
  itens,
  removeItem,
}: Props) {
  return (
    <div className={styles.formGroup}>
      <div className={styles.label}>Itens do pedido</div>
      <div className={styles.formGrid2}>
        <Select
          className={styles.input}
          searchable
          value={itemKey}
          onChange={(event) => setItemKey(event.target.value)}
          disabled={!allItems.length}
        >
          {!allItems.length ? (
            <option value="">Cadastre ingredientes ou insumos antes de criar o pedido</option>
          ) : (
            <>
              {!!ingredients.filter((item) => item.name.trim()).length && (
                <optgroup label="Ingredientes da Massa">
                  {ingredients
                    .filter((item) => item.name.trim())
                    .map((item) => (
                      <option key={`ing:${item.id}`} value={`ing:${item.id}`}>
                        {item.name} ({item.measure})
                      </option>
                    ))}
                </optgroup>
              )}
              {!!insumos.filter((item) => item.name.trim()).length && (
                <optgroup label="Insumos">
                  {insumos
                    .filter((item) => item.name.trim())
                    .map((item) => (
                      <option key={`ins:${item.id}`} value={`ins:${item.id}`}>
                        {item.name} ({item.measure})
                      </option>
                    ))}
                </optgroup>
              )}
            </>
          )}
        </Select>
        <Input
          className={styles.input}
          type="number"
          min={0}
          value={itemQtd}
          onChange={(event) => setItemQtd(Number(event.target.value) || 0)}
        />
        <Button variant="primary" type="button" onClick={addItem} disabled={!itemKey || !allItems.length}>
          Adicionar
        </Button>
      </div>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {itens.map((item, index) => (
          <li
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <span style={{ color: 'var(--text-primary, #fff)' }}>
              {item.nome}{' '}
              <small style={{ color: 'var(--accent, #7dd3fc)' }}>
                {formatQty(item.quantidade)} {item.measure}
              </small>
            </span>
            <Button variant="danger" type="button" onClick={() => removeItem(index)}>
              Remover
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
