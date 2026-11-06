import { Button, Input } from '../../../../../../packages/pentagono/src/index';
import type { EventosController } from '../hooks/use-eventos-controller';
import styles from '../styles/Eventos.module.scss';

export default function EventosFilters({ controller }: { controller: EventosController }) {
  const {
    search,
    setSearch,
    sourceFilter,
    setSourceFilter,
    dateFilter,
    setDateFilter,
    dateFilterMode,
    setDateFilterMode,
  } = controller;
  return (
    <div className={styles.controls}>
      <div className={styles.searchWrap}>
        <svg
          className={styles.searchIcon}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <Input
          variant="search"
          className={styles.searchInput}
          placeholder="Buscar eventos..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className={styles.unitFilter}>
        {(['all', 'main', 'franchise'] as const).map((filter) => (
          <Button
            variant="chip"
            key={filter}
            className={`${styles.unitFilterBtn} ${sourceFilter === filter ? styles.unitFilterBtnActive : ''}`}
            onClick={() => setSourceFilter(filter)}
          >
            {filter === 'all' ? 'Todos' : filter === 'main' ? 'Sorocaba' : 'Campinas'}
          </Button>
        ))}
      </div>
      <div className={styles.unitFilter}>
        {(['all', 'feirinha', 'evento_avulso'] as const).map((filter) => (
          <Button
            variant="chip"
            key={filter}
            className={`${styles.unitFilterBtn} ${
              controller.modalityFilter === filter ? styles.unitFilterBtnActive : ''
            }`}
            onClick={() => controller.setModalityFilter(filter)}
          >
            {filter === 'all' ? 'Todas modalidades' : filter === 'feirinha' ? 'Feirinhas' : 'Eventos avulsos'}
          </Button>
        ))}
      </div>
      <div className={styles.dateFilterWrap}>
        <div className={styles.dateFilterToggle}>
          {(['month', 'date'] as const).map((mode) => (
            <Button
              variant="chip"
              key={mode}
              className={`${styles.dateFilterModeBtn} ${dateFilterMode === mode ? styles.dateFilterModeBtnActive : ''}`}
              onClick={() => {
                setDateFilterMode(mode);
                setDateFilter('');
              }}
            >
              {mode === 'month' ? 'Mês' : 'Data'}
            </Button>
          ))}
        </div>
        <Input
          type={dateFilterMode}
          className={styles.filterDate}
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          title={dateFilterMode === 'month' ? 'Filtrar por mês' : 'Filtrar por data'}
        />
        {dateFilter && (
          <Button
            variant="ghost"
            size="sm"
            className={styles.clearDateBtn}
            onClick={() => setDateFilter('')}
            title="Limpar filtro"
          >
            ✕
          </Button>
        )}
      </div>
    </div>
  );
}
