import styles from '../styles/Tarefas.module.scss';
import { formatR$, MEASURES } from '../support/task-formatters';
import ProductionRemoveButton from './ProductionRemoveButton';
import type { Ingredient } from '../types/task-types';

type Props = {
  items: Ingredient[];
  onUpdate: (id: string, field: keyof Ingredient, value: string | number) => void;
  onRemove: (id: string) => void;
};

export default function ProductionIngredientRows({ items, onUpdate, onRemove }: Props) {
  return (
    <>
      {items.map((item) => (
        <tr key={item.id}>
          <td>
            <input
              className={styles.cellInput}
              value={item.name}
              onChange={(event) => onUpdate(item.id, 'name', event.target.value)}
              placeholder="Ex: Farinha"
            />
          </td>
          <td>
            <select
              className={styles.cellSelect}
              value={item.measure}
              onChange={(event) => onUpdate(item.id, 'measure', event.target.value)}
            >
              {MEASURES.map((measure) => (
                <option key={measure} value={measure}>
                  {measure}
                </option>
              ))}
            </select>
          </td>
          <td>
            <input
              className={`${styles.cellInput} ${styles.cellNumber}`}
              type="number"
              value={item.quantity || ''}
              onChange={(event) => onUpdate(item.id, 'quantity', parseFloat(event.target.value) || 0)}
              placeholder="0"
            />
          </td>
          <td>
            <input
              className={`${styles.cellInput} ${styles.cellNumber}`}
              type="number"
              step="0.01"
              value={item.cost || ''}
              onChange={(event) => onUpdate(item.id, 'cost', parseFloat(event.target.value) || 0)}
              placeholder="0,00"
            />
          </td>
          <td className={styles.cellCalc}>R$ {formatR$(item.quantity * item.cost)}</td>
          <td>
            <ProductionRemoveButton onClick={() => onRemove(item.id)} />
          </td>
        </tr>
      ))}
    </>
  );
}
