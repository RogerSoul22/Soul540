import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyPtBr as formatBRL } from '../../../../../../packages/domain/src/index';
import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';
import type { FinanceEntry } from '../../../../../../packages/contracts/src/index';
import styles from '../styles/Financeiro.module.scss';

type FinanceValuesTableProps = {
  events: PizzaEvent[];
  finances: FinanceEntry[];
  onSelect: (event: PizzaEvent) => void;
};

function safeDate(value: string) {
  try {
    return format(new Date(value + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return value;
  }
}

export default function FinanceValuesTable({ events, finances, onSelect }: FinanceValuesTableProps) {
  if (events.length === 0) return <div className={styles.emptyState}>Nenhum evento com valor cadastrado.</div>;
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Evento</th>
            <th>Situação</th>
            <th>Data</th>
            <th>Valor Estimado</th>
            <th>Deslocamento</th>
            <th>Sinal Recebido</th>
            <th>Valor Final</th>
            <th>Custos vinculados</th>
            <th>Resultado</th>
            <th>Pagamento</th>
            <th>Diferença</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            const estimated = event.budget || 0;
            const travel = event.travelCost || 0;
            const deposit = event.depositValue || 0;
            const finalValue = event.finalValue || 0;
            const costs = finances
              .filter((entry) => entry.eventId === event.id && entry.type === 'cost')
              .reduce((sum, entry) => sum + entry.amount, 0);
            const result = (finalValue || estimated) - costs;
            const difference = finalValue - estimated;
            return (
              <tr
                key={event.id}
                className={styles.clickableRow}
                onClick={() => onSelect(event)}
                tabIndex={0}
                role="button"
                onKeyDown={(keyEvent) => {
                  if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
                    keyEvent.preventDefault();
                    onSelect(event);
                  }
                }}
              >
                <td>{event.name}</td>
                <td>
                  <span className={styles.financialStatus}>
                    {event.financialStatus === 'closed'
                      ? 'Fechado'
                      : event.financialStatus === 'settled'
                        ? 'Quitado'
                        : event.financialStatus === 'partial'
                          ? 'Parcial'
                          : 'Em aberto'}
                  </span>
                </td>
                <td>{safeDate(event.date)}</td>
                <td>{estimated > 0 ? formatBRL(estimated) : '—'}</td>
                <td>{travel > 0 ? <span className={styles.amber}>{formatBRL(travel)}</span> : '—'}</td>
                <td>{deposit > 0 ? <span className={styles.green}>{formatBRL(deposit)}</span> : '—'}</td>
                <td>{finalValue > 0 ? <span className={styles.green}>{formatBRL(finalValue)}</span> : '—'}</td>
                <td>{costs > 0 ? <span className={styles.red}>{formatBRL(costs)}</span> : '—'}</td>
                <td>
                  <span className={result >= 0 ? styles.green : styles.red}>{formatBRL(result)}</span>
                </td>
                <td>{event.paymentMethod || '—'}</td>
                <td>
                  {estimated > 0 && finalValue > 0 ? (
                    <span className={difference >= 0 ? styles.green : styles.red}>
                      {difference >= 0 ? '+' : ''}
                      {formatBRL(difference)}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
