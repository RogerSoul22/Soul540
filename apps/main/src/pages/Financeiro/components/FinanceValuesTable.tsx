import {
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from '../../../../../../packages/pentagono/src/index';
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
  if (events.length === 0) return <EmptyState title="Nenhum evento com valor cadastrado." />;
  return (
    <div className={styles.tableWrap}>
      <Table variant="plain" className={styles.table}>
        <TableHead>
          <TableRow>
            <TableHeadCell>Evento</TableHeadCell>
            <TableHeadCell>Situação</TableHeadCell>
            <TableHeadCell>Data</TableHeadCell>
            <TableHeadCell>Valor Estimado</TableHeadCell>
            <TableHeadCell>Deslocamento</TableHeadCell>
            <TableHeadCell>Sinal Recebido</TableHeadCell>
            <TableHeadCell>Valor Final</TableHeadCell>
            <TableHeadCell>Custos vinculados</TableHeadCell>
            <TableHeadCell>Resultado</TableHeadCell>
            <TableHeadCell>Pagamento</TableHeadCell>
            <TableHeadCell>Diferença</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
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
              <TableRow
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
                <TableCell>{event.name}</TableCell>
                <TableCell>
                  <span className={styles.financialStatus}>
                    {event.financialStatus === 'closed'
                      ? 'Fechado'
                      : event.financialStatus === 'settled'
                        ? 'Quitado'
                        : event.financialStatus === 'partial'
                          ? 'Parcial'
                          : 'Em aberto'}
                  </span>
                </TableCell>
                <TableCell>{safeDate(event.date)}</TableCell>
                <TableCell>{estimated > 0 ? formatBRL(estimated) : '—'}</TableCell>
                <TableCell>{travel > 0 ? <span className={styles.amber}>{formatBRL(travel)}</span> : '—'}</TableCell>
                <TableCell>{deposit > 0 ? <span className={styles.green}>{formatBRL(deposit)}</span> : '—'}</TableCell>
                <TableCell>
                  {finalValue > 0 ? <span className={styles.green}>{formatBRL(finalValue)}</span> : '—'}
                </TableCell>
                <TableCell>{costs > 0 ? <span className={styles.red}>{formatBRL(costs)}</span> : '—'}</TableCell>
                <TableCell>
                  <span className={result >= 0 ? styles.green : styles.red}>{formatBRL(result)}</span>
                </TableCell>
                <TableCell>{event.paymentMethod || '—'}</TableCell>
                <TableCell>
                  {estimated > 0 && finalValue > 0 ? (
                    <span className={difference >= 0 ? styles.green : styles.red}>
                      {difference >= 0 ? '+' : ''}
                      {formatBRL(difference)}
                    </span>
                  ) : (
                    '—'
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
