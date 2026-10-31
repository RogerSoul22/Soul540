import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';

type FilterType = 'all' | 'revenue' | 'cost' | 'pending';

const labels: Record<FilterType, string> = {
  all: 'Todos',
  revenue: 'Receitas',
  cost: 'Custos',
  pending: 'Pendentes',
};

export default function FinanceEntriesFilters({ controller }: { controller: FinanceiroController }) {
  const {
    filterType,
    setFilterType,
    modalityFilter,
    setModalityFilter,
    search,
    setSearch,
    setLancamentosPage,
    exportCSV,
    exportDRE,
  } = controller;

  const changeFilter = (type: FilterType) => {
    setFilterType(type);
    setLancamentosPage(1);
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    setLancamentosPage(1);
  };

  return (
    <div className={styles.filterRow}>
      <div className={styles.filterGroup}>
        {(Object.keys(labels) as FilterType[]).map((type) => (
          <button
            key={type}
            className={styles.filterBtn + ' ' + (filterType === type ? styles.filterBtnActive : '')}
            onClick={() => changeFilter(type)}
          >
            {labels[type]}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        {(['all', 'feirinha', 'evento_avulso'] as const).map((modality) => (
          <button
            key={modality}
            className={styles.filterBtn + ' ' + (modalityFilter === modality ? styles.filterBtnActive : '')}
            onClick={() => {
              setModalityFilter(modality);
              setLancamentosPage(1);
            }}
          >
            {modality === 'all' ? 'Todas modalidades' : modality === 'feirinha' ? 'Feirinhas' : 'Eventos avulsos'}
          </button>
        ))}
      </div>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Buscar por descrição, categoria..."
        value={search}
        onChange={(event) => changeSearch(event.target.value)}
      />
      <button className={styles.btnExport} onClick={exportCSV} title="Exportar lançamentos filtrados">
        Exportar CSV
      </button>
      <button className={styles.btnExport} onClick={exportDRE} title="Exportar no padrão DRE">
        Exportar DRE
      </button>
    </div>
  );
}
