import { Button } from '../../../../../../packages/pentagono/src/index';
import type { UnitFilter } from '../types/dashboard-types';
import styles from '../styles/Dashboard.module.scss';

type Props = {
  currentMonth: string;
  monthEventCount: number;
  onNavigate: (path: string) => void;
  unitFilter: UnitFilter;
  onUnitFilterChange: (filter: UnitFilter) => void;
};

export default function DashboardCalendarHeader({
  currentMonth,
  monthEventCount,
  onNavigate,
  unitFilter,
  onUnitFilterChange,
}: Props) {
  return (
    <>
      <div className={styles.calendarHeader}>
        <div className={styles.calendarHeaderLeft}>
          <span className={styles.calendarMonth}>{currentMonth}</span>
          <span className={styles.calendarCount}>
            {monthEventCount} evento{monthEventCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className={styles.calendarHeaderRight}>
          <Button variant="dashed" className={styles.btnNewSchedule} onClick={() => onNavigate('/eventos?action=new')}>
            Novo Agendamento
          </Button>
          <Button
            variant="dashed"
            className={styles.btnNewEntry}
            onClick={() => onNavigate('/financeiro?action=new&type=cost')}
          >
            Lançar Despesa
          </Button>
          <div className={styles.unitFilter}>
            {(['all', 'main', 'franchise'] as UnitFilter[]).map((filter) => (
              <Button
                variant="chip"
                key={filter}
                className={styles.unitFilterBtn + (unitFilter === filter ? ' ' + styles.unitFilterBtnActive : '')}
                onClick={() => onUnitFilterChange(filter)}
              >
                {filter === 'all' ? 'Todos' : filter === 'main' ? 'Sorocaba' : 'Itu'}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.legend}>
        {[
          ['#3b82f6', 'Orçamento'],
          ['#f59e0b', 'Fechado'],
          ['#22c55e', 'Finalizado'],
          ['#ef4444', 'Com observação'],
        ].map(([color, label]) => (
          <span key={label} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </>
  );
}
