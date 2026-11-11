import type { useFinanceiroController } from '../hooks/use-financeiro-controller';

type Controller = ReturnType<typeof useFinanceiroController>;
type Props = { controller: Controller };
import { Badge, Button, Heading, Input } from '../../../../../../packages/pentagono/src/index';
import { formatCurrencyPtBr as formatBRL } from '../../../../../../packages/domain/src/index';
import styles from '../styles/Financeiro.module.scss';
import FinanceiroEntriesTable from './FinanceiroEntriesTable';
import type { FilterType } from '../types/finance-controller-types';

export default function FinanceiroEntriesTab({ controller }: Props) {
  const {
    activeTab,
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
  const isAvulsoTab = activeTab === 'eventos-avulsos';
  if (activeTab !== 'lancamentos' && !isAvulsoTab) return null;
  return (
    <div className={styles.tabContent}>
      {isAvulsoTab && (
        <Heading level={3} variant="section" className={styles.sectionTitle}>
          Lançamentos de Eventos Avulsos
        </Heading>
      )}
      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          {(['all', 'revenue', 'cost', 'pending'] as FilterType[]).map((type) => (
            <Button
              variant="chip"
              key={type}
              className={`${styles.filterBtn} ${filterType === type ? styles.filterBtnActive : ''}`}
              onClick={() => {
                setFilterType(type);
                setLancamentosPage(1);
              }}
            >
              {type === 'all' ? 'Todos' : type === 'revenue' ? 'Receitas' : type === 'pending' ? 'Pendentes' : 'Custos'}
            </Button>
          ))}
        </div>
        {!isAvulsoTab && (
          <div className={styles.filterGroup}>
            {(['all', 'feirinha', 'evento_avulso'] as const).map((modality) => (
              <Button
                variant="chip"
                key={modality}
                className={`${styles.filterBtn} ${modalityFilter === modality ? styles.filterBtnActive : ''}`}
                onClick={() => {
                  setModalityFilter(modality);
                  setLancamentosPage(1);
                }}
              >
                {modality === 'all' ? 'Todas modalidades' : modality === 'feirinha' ? 'Feirinhas' : 'Eventos'}
              </Button>
            ))}
          </div>
        )}
        <Input
          variant="search"
          type="text"
          className={styles.searchInput}
          placeholder="Buscar por descrição, categoria..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setLancamentosPage(1);
          }}
        />
        <Button variant="secondary" onClick={exportCSV} title="Exportar lançamentos filtrados para CSV">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Exportar CSV
        </Button>
        <Button variant="secondary" onClick={exportDRE} title="Exportar no padrão DRE (mensal, por seção)">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Exportar DRE
        </Button>
      </div>

      <FinanceiroEntriesTable controller={controller} />
    </div>
  );
}
