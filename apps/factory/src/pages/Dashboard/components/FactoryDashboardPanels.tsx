import { formatDashboardEventDate as formatEventDate } from '@soul540/screens';
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
            <button className={styles.opsAction} onClick={() => onNavigate('/eventos')}>
              Ver eventos
            </button>
          </div>
          <div className={styles.opsList}>
            {operationalAlerts.map((alert) => (
              <div key={alert.event.id} className={styles.opsItem}>
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
        <div className={styles.opsPanel}>
          <div className={styles.opsHeader}>
            <p className={styles.opsTitle}>Agenda da equipe</p>
            <p className={styles.opsSubtitle}>Quem está escalado em cada evento</p>
          </div>
          <div className={styles.opsList}>
            {teamSchedule.length === 0 ? (
              <span className={styles.opsEmpty}>Nenhuma escala futura.</span>
            ) : (
              teamSchedule.map((item) => (
                <div key={item.employeeId} className={styles.opsItem}>
                  <div className={styles.opsItemMain}>
                    <span className={styles.opsEventName}>{item.employeeName}</span>
                    <span className={styles.opsEventDate}>
                      {item.events.map((event) => formatEventDate(event.date, 'dd/MM') + ' ' + event.name).join(' | ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className={styles.opsPanel}>
          <div className={styles.opsHeader}>
            <p className={styles.opsTitle}>Fechamento financeiro</p>
            <p className={styles.opsSubtitle}>Estimado x realizado para conferência</p>
          </div>
          <div className={styles.opsList}>
            {financialClosings.length === 0 ? (
              <span className={styles.opsEmpty}>Nenhum evento finalizado para comparar.</span>
            ) : (
              financialClosings.map(({ event, closing }) => (
                <div key={event.id} className={styles.opsItem}>
                  <div className={styles.opsItemMain}>
                    <span className={styles.opsEventName}>{event.name}</span>
                    <span className={styles.opsEventDate}>
                      Est. R$ {closing.estimatedRevenue.toLocaleString('pt-BR')} | Real. R${' '}
                      {closing.realizedResult.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
