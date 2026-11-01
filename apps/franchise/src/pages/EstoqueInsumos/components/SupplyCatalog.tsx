import { Button, EmptyState, Heading, Input, Select } from '../../../../../../packages/pentagono/src/index';
import type { SuppliesController } from '../hooks/use-supplies-controller';
import { statusConfig, type SupplyStatus } from '../types/supply-types';
import styles from '../styles/EstoqueInsumos.module.scss';

export default function SupplyCatalog({ controller }: { controller: SuppliesController }) {
  const {
    supplies,
    categories,
    filtered,
    selectedCategory,
    search,
    statusFilter,
    setSelectedCategory,
    setSearch,
    setStatusFilter,
    setViewingItem,
    setDeleteSupply,
    openCreate,
    openEdit,
  } = controller;
  return (
    <>
      <div className={styles.filters}>
        <Input
          variant="search"
          className={styles.searchInput}
          placeholder="Buscar por nome ou categoria"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select
          className={styles.select}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | SupplyStatus)}
        >
          <option value="all">Todos os status</option>
          <option value="em_estoque">Em estoque</option>
          <option value="estoque_baixo">Estoque baixo</option>
          <option value="sem_estoque">Sem estoque</option>
          <option value="vencido">Vencido</option>
        </Select>
      </div>
      <div className={styles.categories}>
        <Button
          variant="chip"
          className={selectedCategory === null ? styles.categoryActive : styles.category}
          onClick={() => setSelectedCategory(null)}
        >
          Todos ({supplies.length})
        </Button>
        {categories.map((category) => (
          <Button
            variant="chip"
            key={category}
            className={selectedCategory === category ? styles.categoryActive : styles.category}
            onClick={() => setSelectedCategory(category)}
          >
            {category} ({supplies.filter((supply) => supply.category === category).length})
          </Button>
        ))}
      </div>
      {!filtered.length ? (
        <EmptyState title="Nenhum insumo encontrado." />
      ) : (
        <div className={styles.grid}>
          {filtered.map((supply) => {
            const status = statusConfig[supply.status];
            return (
              <article
                key={supply.id}
                className={styles.card + ' ' + (supply.status === 'sem_estoque' ? styles.cardAlert : '')}
                onClick={() => setViewingItem(supply)}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <Heading level={3} variant="section" className={styles.cardTitle}>
                      {supply.name}
                    </Heading>
                    <p className={styles.cardCategory}>{supply.category || 'Sem categoria'}</p>
                  </div>
                  <span className={styles.statusPill + ' ' + styles[status.color]}>{status.label}</span>
                </div>
                <div className={styles.cardStats}>
                  <span>
                    Quantidade
                    <strong>
                      {supply.quantity} {supply.measureUnit}
                    </strong>
                  </span>
                  <span>
                    Mínimo
                    <strong>
                      {supply.minStock} {supply.measureUnit}
                    </strong>
                  </span>
                  <span>
                    Valor
                    <strong>R$ {(supply.quantity * supply.costPerUnit).toFixed(2)}</strong>
                  </span>
                </div>
                <div className={styles.cardActions}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      openEdit(supply);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={(event) => {
                      event.stopPropagation();
                      setDeleteSupply(supply.id);
                    }}
                  >
                    Excluir
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <Button variant="dashed" className={styles.cardAdd} onClick={openCreate}>
        + Adicionar insumo
      </Button>
    </>
  );
}
