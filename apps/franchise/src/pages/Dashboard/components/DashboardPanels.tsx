import { formatDashboardEventDate as formatEventDate } from '@soul540/screens';
import type { EmployeeScheduleItem, EventFinancialClosing } from '../../../../../../shared/events/eventOperations';
import type { PizzaEvent } from '../../../../../../shared/contracts/types';
import styles from '../styles/Dashboard.module.scss';

type AlertItem = {
  event: PizzaEvent;
  paymentSeverity: string;
  paymentLabel: string;
  issues: Array<{ key: string; severity: string; label: string }>;
};

type Props = {
  operationalAlerts: AlertItem[];
  teamSchedule: EmployeeScheduleItem[];
  financialClosings: Array<{
    event: PizzaEvent;
    closing: EventFinancialClosing;
  }>;
  onNavigate: (path: string) => void;
};

export default function DashboardPanels({ operationalAlerts, teamSchedule, financialClosings, onNavigate }: Props) {
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
        <DashboardSchedulePanel teamSchedule={teamSchedule} />
        <DashboardFinancePanel financialClosings={financialClosings} />
        <DashboardSupplyPanel />
      </div>
    </>
  );
}

function DashboardSchedulePanel({ teamSchedule }: { teamSchedule: EmployeeScheduleItem[] }) {
  return (
    <section className={styles.opsPanel}>
      <div className={styles.opsHeader}>
        <p className={styles.opsTitle}>Agenda da equipe</p>
        <p className={styles.opsSubtitle}>Funcionários escalados nos próximos eventos</p>
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
    </section>
  );
}

function DashboardFinancePanel({
  financialClosings,
}: {
  financialClosings: Array<{
    event: PizzaEvent;
    closing: EventFinancialClosing;
  }>;
}) {
  return (
    <section className={styles.opsPanel}>
      <div className={styles.opsHeader}>
        <p className={styles.opsTitle}>Fechamento financeiro</p>
        <p className={styles.opsSubtitle}>Estimado x realizado nos eventos finalizados</p>
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
              <span
                className={
                  styles.opsBadge + ' ' + (closing.difference >= 0 ? styles.opsBadgeinfo : styles.opsBadgewarning)
                }
              >
                {closing.statusLabel}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function DashboardSupplyPanel() {
  return (
    <section className={styles.opsPanel}>
      <div className={styles.opsHeader}>
        <p className={styles.opsTitle}>Previsão de insumos</p>
        <p className={styles.opsSubtitle}>Baseada em convidados e cardápio</p>
      </div>
      <div className={styles.opsList}>
        <span className={styles.opsEmpty}>Os insumos são revisados nos eventos futuros.</span>
      </div>
    </section>
  );
}
