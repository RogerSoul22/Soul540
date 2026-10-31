import styles from '../styles/Tarefas.module.scss';
import { formatR$ } from '../support/task-formatters';
import ProductionIngredientRows from './ProductionIngredientRows';
import ProductionInsumoRows from './ProductionInsumoRows';
import type { Ingredient, Insumo } from '../types/task-types';

type Props = {
  ingredients: Ingredient[];
  insumos: Insumo[];
  onAddIngredient: () => void;
  onUpdateIngredient: (id: string, field: keyof Ingredient, value: string | number) => void;
  onRemoveIngredient: (id: string) => void;
  onAddInsumo: () => void;
  onUpdateInsumo: (id: string, field: keyof Insumo, value: string | number) => void;
  onRemoveInsumo: (id: string) => void;
};

export default function ProductionRecipeGrid({
  ingredients,
  insumos,
  onAddIngredient,
  onUpdateIngredient,
  onRemoveIngredient,
  onAddInsumo,
  onUpdateInsumo,
  onRemoveInsumo,
}: Props) {
  const ingredientTotal = ingredients.reduce((sum, item) => sum + item.quantity * item.cost, 0);
  return (
    <div className={styles.receitasGrid}>
      <div className={styles.recipeBlock}>
        <div className={styles.blockHeader}>
          <span className={styles.blockTitle}>Ingredientes da Massa</span>
          <span className={styles.blockSub}>por kg de massa</span>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Massa</th>
                <th>Medida</th>
                <th>Quantidade</th>
                <th>Custo (R$/un)</th>
                <th>Custo Massa</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <ProductionIngredientRows
                items={ingredients}
                onUpdate={onUpdateIngredient}
                onRemove={onRemoveIngredient}
              />
            </tbody>
          </table>
        </div>
        <div className={styles.totalRow}>
          <span>Custo total por kg</span>
          <strong>R$ {formatR$(ingredientTotal)}</strong>
        </div>
        <button className={styles.btnAdd} onClick={onAddIngredient}>
          ï¼‹ Adicionar ingrediente
        </button>
      </div>
      <div className={styles.recipeBlock}>
        <div className={styles.blockHeader}>
          <span className={styles.blockTitle}>Insumos</span>
          <span className={styles.blockSub}>materiais e embalagens</span>
        </div>
        <div className={`${styles.tableWrap} ${styles.insumosTableWrap}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Medida</th>
                <th>Custo (R$/un)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <ProductionInsumoRows items={insumos} onUpdate={onUpdateInsumo} onRemove={onRemoveInsumo} />
            </tbody>
          </table>
        </div>
        <button className={styles.btnAdd} onClick={onAddInsumo}>
          ï¼‹ Adicionar insumo
        </button>
      </div>
    </div>
  );
}
