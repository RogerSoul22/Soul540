import { Button, Input } from '../../../../../../packages/pentagono/src/index';
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
          <Button
            variant="chip"
            key={type}
            className={styles.filterBtn + ' ' + (filterType === type ? styles.filterBtnActive : '')}
            onClick={() => changeFilter(type)}
          >
            {labels[type]}
          </Button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        {(['all', 'feirinha', 'evento_avulso'] as const).map((modality) => (
          <Button
            variant="chip"
            key={modality}
            className={styles.filterBtn + ' ' + (modalityFilter === modality ? styles.filterBtnActive : '')}
            onClick={() => {
              setModalityFilter(modality);
              setLancamentosPage(1);
            }}
          >
            {modality === 'all' ? 'Todas modalidades' : modality === 'feirinha' ? 'Feirinhas' : 'Eventos'}
          </Button>
        ))}
      </div>
      <Input
        variant="search"
        type="text"
        className={styles.searchInput}
        placeholder="Buscar por descrição, categoria..."
        value={search}
        onChange={(event) => changeSearch(event.target.value)}
      />
      <Button variant="secondary" onClick={exportCSV} title="Exportar lançamentos filtrados">
        Exportar CSV
      </Button>
      <Button variant="secondary" onClick={exportDRE} title="Exportar no padrão DRE">
        Exportar DRE
      </Button>
    </div>
  );
}
