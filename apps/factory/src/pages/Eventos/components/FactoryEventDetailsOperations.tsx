import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';
import { safeFormatDate } from '../support/event-formatters';
import styles from '../styles/Eventos.module.scss';

type Props = { event: PizzaEvent; employeeMap: Record<string, string> };

export default function FactoryEventDetailsOperations({ event, employeeMap }: Props) {
  return (
    <>
      <div className={styles.detailSection}>
        <p className={styles.detailSectionTitle}>Financeiro</p>
        <div className={styles.detailGrid}>
          {event.finalValue != null && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Valor Final</span>
              <span className={styles.detailValue}>R$ {event.finalValue.toLocaleString('pt-BR')}</span>
            </div>
          )}
          {event.budget != null && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Orçamento</span>
              <span className={styles.detailValue}>R$ {event.budget.toLocaleString('pt-BR')}</span>
            </div>
          )}
          {event.travelCost != null && event.travelCost > 0 && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Deslocamento</span>
              <span className={styles.detailValue}>R$ {event.travelCost.toLocaleString('pt-BR')}</span>
            </div>
          )}
          {event.depositValue != null && event.depositValue > 0 && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Sinal Recebido</span>
              <span className={styles.detailValue}>
                R$ {event.depositValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {event.paymentMethod && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Forma de Pagamento</span>
              <span className={styles.detailValue}>
                {event.paymentMethod === 'pix_parcelado'
                  ? 'Pix - 30% na reserva e restante ate o dia'
                  : event.paymentMethod === 'cartao'
                    ? 'Cartão - até 2x sem juros na reserva'
                    : event.paymentMethod === 'pix_total'
                      ? 'Pix - valor total'
                      : event.paymentMethod}
              </span>
            </div>
          )}
          {event.pixKey && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Chave PIX</span>
              <span className={styles.detailValue}>{event.pixKey}</span>
            </div>
          )}
        </div>
      </div>

      {(event.responsibleEmployeeId ||
        event.staffCount ||
        (event.selectedEmployeeIds && event.selectedEmployeeIds.length > 0) ||
        event.teamPizzaiolo ||
        event.teamHelper ||
        event.teamGarcon ||
        event.extrasLoucas ||
        event.extrasBebidas) && (
        <div className={styles.detailSection}>
          <p className={styles.detailSectionTitle}>Equipe Soul540</p>
          <div className={styles.detailGrid}>
            {event.teamPizzaiolo && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Pizzaio</span>
                <span className={styles.detailValue}>{employeeMap[event.teamPizzaiolo] || event.teamPizzaiolo}</span>
              </div>
            )}
            {event.teamHelper && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Ajudante</span>
                <span className={styles.detailValue}>{employeeMap[event.teamHelper] || event.teamHelper}</span>
              </div>
            )}
            {event.teamGarcon && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Garçon</span>
                <span className={styles.detailValue}>{employeeMap[event.teamGarcon] || event.teamGarcon}</span>
              </div>
            )}
            {event.responsibleEmployeeId && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Responsável</span>
                <span className={styles.detailValue}>
                  {employeeMap[event.responsibleEmployeeId] || event.responsibleEmployeeId}
                </span>
              </div>
            )}
            {event.staffCount && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Funcionários</span>
                <span className={styles.detailValue}>{event.staffCount} pessoas</span>
              </div>
            )}
            {event.extrasLoucas != null && event.extrasLoucas > 0 && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Extras - Loucas</span>
                <span className={styles.detailValue}>
                  {event.extrasLoucas} pessoa{event.extrasLoucas > 1 ? 's' : ''}
                </span>
              </div>
            )}
            {event.extrasBebidas != null && event.extrasBebidas > 0 && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Extras - Bebidas</span>
                <span className={styles.detailValue}>
                  {event.extrasBebidas} pessoa{event.extrasBebidas > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
          {event.selectedEmployeeIds && event.selectedEmployeeIds.length > 0 && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Equipe escalada</span>
              <div className={styles.menuTags}>
                {event.selectedEmployeeIds.map((id) => (
                  <span key={id} className={styles.menuTag}>
                    {employeeMap[id] || id}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {(event.estimatedPizzas || event.actualPizzas) && (
        <div className={styles.detailSection}>
          <p className={styles.detailSectionTitle}>Pizzas</p>
          <div className={styles.detailGrid}>
            {event.estimatedPizzas != null && event.estimatedPizzas > 0 && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Estimado</span>
                <span className={styles.detailValue}>{event.estimatedPizzas} pizzas</span>
              </div>
            )}
            {event.actualPizzas != null && event.actualPizzas > 0 && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Realizado</span>
                <span className={styles.detailValue}>{event.actualPizzas} pizzas</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
