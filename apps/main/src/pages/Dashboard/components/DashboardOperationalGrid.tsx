import { Fragment } from 'react';
import OpsEventLink from './OpsEventLink';
import { formatDashboardEventDate as formatEventDate } from '../../../../../../packages/screens/src/index';
import type {
  EmployeeScheduleItem,
  EventFinancialClosing,
  EventSupplyForecast,
} from '../../../../../../shared/events/eventOperations';
import type { PizzaEvent } from '../../../../../../shared/contracts/types';
import styles from '../styles/Dashboard.module.scss';

type Props = {
  teamSchedule: EmployeeScheduleItem[];
  financialClosings: Array<{ event: PizzaEvent; closing: EventFinancialClosing }>;
  supplyForecasts: Array<{ event: PizzaEvent; forecast: EventSupplyForecast }>;
  onNavigate: (path: string) => void;
};

// Agenda da equipe, fechamento financeiro e previsão de insumos: cada evento listado abre o evento.
export default function DashboardOperationalGrid({
  teamSchedule,
  financialClosings,
  supplyForecasts,
  onNavigate,
}: Props) {
  return (
    <div className={styles.opsGrid}>
      <div className={styles.opsPanel}>
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
                    {item.events.map((event, index) => (
                      <Fragment key={event.id}>
                        {index > 0 && ' | '}
                        <OpsEventLink
                          as="span"
                          eventId={event.id}
                          eventName={event.name}
                          onNavigate={onNavigate}
                          className={styles.opsEventChip}
                        >
                          {formatEventDate(event.date, 'dd/MM') + ' ' + event.name}
                        </OpsEventLink>
                      </Fragment>
                    ))}
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
          <p className={styles.opsSubtitle}>Estimado x realizado nos eventos finalizados</p>
        </div>
        <div className={styles.opsList}>
          {financialClosings.length === 0 ? (
            <span className={styles.opsEmpty}>Nenhum evento finalizado para comparar.</span>
          ) : (
            financialClosings.map(({ event, closing }) => (
              <OpsEventLink
                key={event.id}
                eventId={event.id}
                eventName={event.name}
                onNavigate={onNavigate}
                className={styles.opsItem + ' ' + styles.opsItemLink}
              >
                <div className={styles.opsItemMain}>
                  <span className={styles.opsEventName}>{event.name}</span>
                  <span className={styles.opsEventDate}>
                    Est. R$ {closing.estimatedRevenue.toLocaleString('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})} | Real. R
                    {closing.realizedResult.toLocaleString('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}
                  </span>
                </div>
                <span
                  className={
                    styles.opsBadge + ' ' + (closing.difference >= 0 ? styles.opsBadgeinfo : styles.opsBadgewarning)
                  }
                >
                  {closing.statusLabel}
                </span>
              </OpsEventLink>
            ))
          )}
        </div>
      </div>

      <div className={styles.opsPanel}>
        <div className={styles.opsHeader}>
          <p className={styles.opsTitle}>Previsão de insumos</p>
          <p className={styles.opsSubtitle}>Baseada em convidados e cardápio</p>
        </div>
        <div className={styles.opsList}>
          {supplyForecasts.length === 0 ? (
            <span className={styles.opsEmpty}>Nenhum evento futuro para prever.</span>
          ) : (
            supplyForecasts.map(({ event, forecast }) => (
              <OpsEventLink
                key={event.id}
                eventId={event.id}
                eventName={event.name}
                onNavigate={onNavigate}
                className={styles.opsItem + ' ' + styles.opsForecastItem + ' ' + styles.opsItemLink}
              >
                <div className={styles.opsForecastHeader}>
                  <span className={styles.opsEventName}>{event.name}</span>
                  <span className={styles.opsEventDate}>{formatEventDate(event.date, 'dd/MM/yyyy')}</span>
                </div>
                <div className={styles.opsForecastMeta}>
                  <span>{forecast.pizzas} pizzas</span>
                  <span>{forecast.flourKg} kg farinha</span>
                  <span>{forecast.cheeseKg} kg queijo</span>
                </div>
              </OpsEventLink>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
