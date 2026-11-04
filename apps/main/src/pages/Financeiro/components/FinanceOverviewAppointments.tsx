import { Card, Heading } from '../../../../../../packages/pentagono/src/index';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyPtBr as formatBRL } from '../../../../../../packages/domain/src/index';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceOverviewAppointments({ controller }: { controller: FinanceiroController }) {
  const { eventsWithFinalValue, totalFinalValue } = controller;
  return (
    <Card className={styles.agendamentosCard}>
      <div className={styles.agendamentosHeader}>
        <Heading level={3} variant="section" className={styles.sectionTitle}>
          Valores dos agendamentos
        </Heading>
        <div className={styles.agendamentosPills}>
          <div className={styles.agendamentosPill}>
            <span className={styles.agendamentosPillLabel}>Total final</span>
            <span className={styles.agendamentosPillValue + ' ' + styles.green}>{formatBRL(totalFinalValue)}</span>
          </div>
        </div>
      </div>
      {!eventsWithFinalValue.length ? (
        <p className={styles.agendamentosEmpty}>Nenhum agendamento com valor final cadastrado.</p>
      ) : (
        <div className={styles.agendamentosList}>
          {eventsWithFinalValue.map((event) => (
            <div key={event.id} className={styles.agendamentoRow}>
              <div className={styles.agendamentoInfo}>
                <span className={styles.agendamentoName}>{event.name}</span>
                <span className={styles.agendamentoDate}>
                  {format(new Date(event.date + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
              <span className={styles.agendamentoValue + ' ' + styles.green}>{formatBRL(event.finalValue || 0)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
