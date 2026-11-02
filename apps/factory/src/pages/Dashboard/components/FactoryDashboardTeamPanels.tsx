import { Fragment } from 'react';
import OpsEventLink from './OpsEventLink';
import { formatDashboardEventDate as formatEventDate } from '../../../../../../packages/screens/src/index';
import type { EmployeeScheduleItem, EventFinancialClosing } from '../../../../../../shared/events/eventOperations';
import type { PizzaEvent } from '../../../../../../shared/contracts/types';
import styles from '../styles/Dashboard.module.scss';

type Props = {
  teamSchedule: EmployeeScheduleItem[];
  financialClosings: Array<{ event: PizzaEvent; closing: EventFinancialClosing }>;
  onNavigate: (path: string) => void;
};

// Agenda da equipe e fechamento financeiro: cada evento listado abre os detalhes do evento.
export default function FactoryDashboardTeamPanels({ teamSchedule, financialClosings, onNavigate }: Props) {
  return (
    <>
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
          <p className={styles.opsSubtitle}>Estimado x realizado para conferência</p>
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
                    Est. R$ {closing.estimatedRevenue.toLocaleString('pt-BR')} | Real. R${' '}
                    {closing.realizedResult.toLocaleString('pt-BR')}
                  </span>
                </div>
              </OpsEventLink>
            ))
          )}
        </div>
      </div>
    </>
  );
}
