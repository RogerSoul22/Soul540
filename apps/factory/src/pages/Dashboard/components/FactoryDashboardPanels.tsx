import FactoryDashboardTeamPanels from './FactoryDashboardTeamPanels';
import OpsEventLink from './OpsEventLink';
import { Button } from '../../../../../../packages/pentagono/src/index';
import { formatDashboardEventDate as formatEventDate } from '../../../../../../packages/screens/src/index';
import type { EmployeeScheduleItem, EventFinancialClosing } from '../../../../../../shared/events/eventOperations';
import type { PizzaEvent } from '../../../../../../shared/contracts/types';
import styles from '../styles/Dashboard.module.scss';
import type { ProductionOrder } from '../types/dashboard-types';

type AlertItem = {
  event: PizzaEvent;
  paymentSeverity: string;
  paymentLabel: string;
  issues: Array<{ key: string; severity: string; label: string }>;
};

type Props = {
  operationalAlerts: AlertItem[];
  activeProductionOrders: ProductionOrder[];
  teamSchedule: EmployeeScheduleItem[];
  financialClosings: Array<{ event: PizzaEvent; closing: EventFinancialClosing }>;
  onNavigate: (path: string) => void;
};

export default function FactoryDashboardPanels({
  operationalAlerts,
  activeProductionOrders,
  teamSchedule,
  financialClosings,
  onNavigate,
}: Props) {
  return (
    <>
      {operationalAlerts.length > 0 && (
        <div className={styles.opsPanel}>
          <div className={styles.opsHeader}>
            <div>
              <p className={styles.opsTitle}>Atenção operacional</p>
              <p className={styles.opsSubtitle}>Eventos próximos com pendências para revisar</p>
            </div>
            <Button variant="outline" className={styles.opsAction} onClick={() => onNavigate('/eventos')}>
              Ver eventos
            </Button>
          </div>
          <div className={styles.opsList}>
            {operationalAlerts.map((alert) => (
              <div
                key={alert.event.id}
                className={`${styles.opsItem} ${styles.opsItemLink}`}
                role="link"
                tabIndex={0}
                aria-label={`Abrir evento ${alert.event.name}`}
                onClick={() => onNavigate(`/eventos?view=${alert.event.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onNavigate(`/eventos?view=${alert.event.id}`);
                  }
                }}
              >
                <div className={styles.opsItemMain}>
                  <span className={styles.opsEventName}>{alert.event.name}</span>
                  <span className={styles.opsEventDate}>{formatEventDate(alert.event.date, 'dd/MM/yyyy')}</span>
                </div>
                <div className={styles.opsBadges}>
                  <span className={styles.opsBadge + ' ' + styles['opsBadge' + alert.paymentSeverity]}>
                    {alert.paymentLabel}
                  </span>
                  {alert.issues.slice(0, 3).map((issue) => (
                    <span key={issue.key} className={styles.opsBadge + ' ' + styles['opsBadge' + issue.severity]}>
                      {issue.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className={styles.opsGrid}>
        <div className={styles.opsPanel}>
          <div className={styles.opsHeader}>
            <p className={styles.opsTitle}>Modo fábrica</p>
            <p className={styles.opsSubtitle}>Pedidos ativos de produção</p>
          </div>
          <div className={styles.opsList}>
            {activeProductionOrders.length === 0 ? (
              <span className={styles.opsEmpty}>Nenhum pedido ativo para produzir.</span>
            ) : (
              activeProductionOrders.slice(0, 4).map((order) => (
                <div key={order.id} className={styles.opsItem}>
                  <div className={styles.opsItemMain}>
                    <span className={styles.opsEventName}>
                      {order.orderNumber ? '#' + order.orderNumber + ' ' : ''}
                      {order.filial}
                    </span>
                    <span className={styles.opsEventDate}>
                      {order.itens.map((item) => item.nome + ' ' + item.quantidade + ' ' + item.measure).join(' | ')}
                    </span>
                  </div>
                  <span className={styles.opsBadge + ' ' + styles.opsBadgeinfo}>
                    {order.status === 'a_preparar' ? 'A preparar' : 'A enviar'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        <FactoryDashboardTeamPanels
          teamSchedule={teamSchedule}
          financialClosings={financialClosings}
          onNavigate={onNavigate}
        />
      </div>
    </>
  );
}
