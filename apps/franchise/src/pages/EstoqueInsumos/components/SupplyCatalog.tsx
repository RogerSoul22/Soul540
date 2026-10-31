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
        <input
          className={styles.searchInput}
          placeholder="Buscar por nome ou categoria"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className={styles.select}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | SupplyStatus)}
        >
          <option value="all">Todos os status</option>
          <option value="em_estoque">Em estoque</option>
          <option value="estoque_baixo">Estoque baixo</option>
          <option value="sem_estoque">Sem estoque</option>
          <option value="vencido">Vencido</option>
        </select>
      </div>
      <div className={styles.categories}>
        <button
          className={selectedCategory === null ? styles.categoryActive : styles.category}
          onClick={() => setSelectedCategory(null)}
        >
          Todos ({supplies.length})
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={selectedCategory === category ? styles.categoryActive : styles.category}
            onClick={() => setSelectedCategory(category)}
          >
            {category} ({supplies.filter((supply) => supply.category === category).length})
          </button>
        ))}
      </div>
      {!filtered.length ? (
        <div className={styles.emptyState}>Nenhum insumo encontrado.</div>
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
                    <h3 className={styles.cardTitle}>{supply.name}</h3>
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
                  <button
                    className={styles.btnEdit}
                    onClick={(event) => {
                      event.stopPropagation();
                      openEdit(supply);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className={styles.btnDelete}
                    onClick={(event) => {
                      event.stopPropagation();
                      setDeleteSupply(supply.id);
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <button className={styles.cardAdd} onClick={openCreate}>
        + Adicionar insumo
      </button>
    </>
  );
}
