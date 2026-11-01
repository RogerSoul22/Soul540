import { Button, EmptyState, Input } from '../../../../../../packages/pentagono/src/index';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Contract, ContractEvents } from '../types/contract-types';
import styles from '../styles/Contratos.module.scss';

type Props = {
  contracts: Contract[];
  events: ContractEvents;
  search: string;
  onSearchChange: (value: string) => void;
  onView: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
  onDelete: (id: string) => void;
};

function formatDate(value: string) {
  try {
    return format(parseISO(value), 'dd/MM/yy', { locale: ptBR });
  } catch {
    return value;
  }
}

export default function ContractList({ contracts, events, search, onSearchChange, onView, onEdit, onDelete }: Props) {
  const eventMap = new Map(events.map((event) => [event.id, event.name]));
  return (
    <>
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">
            ⌕
          </span>
          <Input
            variant="search"
            className={styles.searchInput}
            placeholder="Buscar por cliente ou descricao..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>
      {contracts.length === 0 ? (
        <EmptyState title="Nenhum contrato encontrado." />
      ) : (
        <div className={styles.tableWrap}>
          <div className={styles.tableHead}>
            <span className={styles.thCell}>Cliente / Descricao</span>
            <span className={styles.thCell}>Evento / Vigencia</span>
            <span className={styles.thCell}>Valor</span>
            <span className={styles.thCell} style={{ textAlign: 'right' }}>
              Acoes
            </span>
          </div>
          {contracts.map((contract) => (
            <div key={contract.id} className={styles.row}>
              <div className={styles.cellMain}>
                <div className={styles.cellIcon}>▧</div>
                <div className={styles.cellBody}>
                  <div className={styles.cellRef}>#{contract.id.split('-').pop()?.toUpperCase()}</div>
                  <div className={styles.cellClient}>{contract.clientName}</div>
                  <div className={styles.cellDesc}>{contract.description}</div>
                </div>
              </div>
              <div className={styles.cellMeta}>
                {contract.eventId && (
                  <span className={styles.cellEvent}>{eventMap.get(contract.eventId) || contract.eventId}</span>
                )}
                <div className={styles.cellDates}>
                  ▣ {formatDate(contract.startDate)}
                  {contract.endDate && (
                    <>
                      <span className={styles.dateSep}>→</span>
                      {formatDate(contract.endDate)}
                    </>
                  )}
                </div>
              </div>
              <div className={styles.cellValue}>R$ {contract.value.toLocaleString('pt-BR')}</div>
              <div className={styles.cellActions}>
                <Button variant="secondary" size="sm" onClick={() => onView(contract)}>
                  Ver
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onEdit(contract)}>
                  Editar
                </Button>
                <Button variant="danger" onClick={() => onDelete(contract.id)}>
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
