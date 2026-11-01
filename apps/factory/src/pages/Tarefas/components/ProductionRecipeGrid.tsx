import {
  Button,
  Table,
  TableBody,
  TableHead,
  TableHeadCell,
  TableRow,
} from '../../../../../../packages/pentagono/src/index';
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
          <Table variant="plain" className={styles.table}>
            <TableHead>
              <TableRow>
                <TableHeadCell>Massa</TableHeadCell>
                <TableHeadCell>Medida</TableHeadCell>
                <TableHeadCell>Quantidade</TableHeadCell>
                <TableHeadCell>Custo (R$/un)</TableHeadCell>
                <TableHeadCell>Custo Massa</TableHeadCell>
                <TableHeadCell />
              </TableRow>
            </TableHead>
            <TableBody>
              <ProductionIngredientRows
                items={ingredients}
                onUpdate={onUpdateIngredient}
                onRemove={onRemoveIngredient}
              />
            </TableBody>
          </Table>
        </div>
        <div className={styles.totalRow}>
          <span>Custo total por kg</span>
          <strong>R$ {formatR$(ingredientTotal)}</strong>
        </div>
        <Button variant="dashed" className={styles.btnAdd} onClick={onAddIngredient}>
          ï¼‹ Adicionar ingrediente
        </Button>
      </div>
      <div className={styles.recipeBlock}>
        <div className={styles.blockHeader}>
          <span className={styles.blockTitle}>Insumos</span>
          <span className={styles.blockSub}>materiais e embalagens</span>
        </div>
        <div className={`${styles.tableWrap} ${styles.insumosTableWrap}`}>
          <Table variant="plain" className={styles.table}>
            <TableHead>
              <TableRow>
                <TableHeadCell>Insumo</TableHeadCell>
                <TableHeadCell>Medida</TableHeadCell>
                <TableHeadCell>Custo (R$/un)</TableHeadCell>
                <TableHeadCell />
              </TableRow>
            </TableHead>
            <TableBody>
              <ProductionInsumoRows items={insumos} onUpdate={onUpdateInsumo} onRemove={onRemoveInsumo} />
            </TableBody>
          </Table>
        </div>
        <Button variant="dashed" className={styles.btnAdd} onClick={onAddInsumo}>
          ï¼‹ Adicionar insumo
        </Button>
      </div>
    </div>
  );
}
