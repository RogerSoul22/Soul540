import { EmptyState, Input, Select, SkeletonContent } from '../../../../pentagono/src/index';
import UtensilCard from './UtensilCard';
import type { Utensil } from './utensil-types';
import styles from './styles/UtensilsInventoryList.module.scss';

interface UtensilsInventoryListProps {
  items: Utensil[];
  loading: boolean;
  onDelete: (id: string) => void;
  onEdit: (utensil: Utensil) => void;
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (status: string) => void;
  onView: (utensil: Utensil) => void;
  search: string;
  statusFilter: string;
}

export default function UtensilsInventoryList({
  items,
  loading,
  onDelete,
  onEdit,
  onSearchChange,
  onStatusFilterChange,
  onView,
  search,
  statusFilter,
}: UtensilsInventoryListProps) {
  return (
    <>
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <Input
            label="Buscar utensílios"
            className={styles.searchInput}
            placeholder="Buscar utensílios..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <Select
          label="Status"
          className={styles.select}
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value)}
        >
          <option value="all">Todos os status</option>
          <option value="disponivel">Disponível</option>
          <option value="em_uso">Em Uso</option>
          <option value="manutencao">Manutenção</option>
          <option value="descartado">Descartado</option>
        </Select>
      </div>

      {loading ? (
        <SkeletonContent variant="cards" count={6} label="Carregando utensílios..." />
      ) : items.length === 0 ? (
        <EmptyState title="Nenhum utensílio encontrado." />
      ) : (
        <div className={styles.grid}>
          {items.map((utensil) => (
            <UtensilCard key={utensil.id} utensil={utensil} onDelete={onDelete} onEdit={onEdit} onView={onView} />
          ))}
        </div>
      )}
    </>
  );
}
