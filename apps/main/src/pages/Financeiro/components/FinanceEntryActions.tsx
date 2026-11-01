import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '../../../../../../packages/pentagono/src/index';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';

export function formatDate(date: string | undefined | null): string {
  if (!date) return '-';
  try {
    return format(new Date(date + 'T12:00:00'), 'dd/MM/yy', { locale: ptBR });
  } catch {
    return date;
  }
}
export function originLabel(entry: { automatic?: boolean; origin?: string }): string {
  if (entry.automatic) return 'Evento automático';
  if (entry.origin === 'factory_order') return 'Pedido da fábrica';
  if (entry.origin === 'bank_import') return 'Extrato OFX';
  return 'Manual';
}
export function FinanceEntryActions({
  controller,
  entry,
}: {
  controller: FinanceiroController;
  entry: FinanceiroController['filtered'][number];
}) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <Button
        variant="outline"
        className={styles.actionBtn}
        onClick={(event) => {
          event.stopPropagation();
          controller.handleFinanceEditAction(entry);
        }}
        title="Editar lançamento"
      >
        Editar
      </Button>
      <Button
        variant="danger"
        size="sm"
        className={styles.actionBtn + ' ' + styles.actionBtnDanger}
        onClick={(event) => {
          event.stopPropagation();
          controller.requestFinanceDelete(entry);
        }}
        title="Excluir lançamento"
      >
        Excluir
      </Button>
    </div>
  );
}
