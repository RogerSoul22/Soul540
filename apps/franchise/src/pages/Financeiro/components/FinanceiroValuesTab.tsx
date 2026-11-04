import { Card, Heading } from '../../../../../../packages/pentagono/src/index';
import type { useFinanceiroController } from '../hooks/use-financeiro-controller';

type Controller = ReturnType<typeof useFinanceiroController>;
type Props = { controller: Controller };
import { formatCurrencyPtBr as formatBRL } from '../../../../../../packages/domain/src/index';
import { ptBR } from 'date-fns/locale';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceiroValuesTab({ controller }: Props) {
  const { activeTab, eventsWithFinalValue, totalFinalValue, margin, setSelectedFinancialEvent, safeFormatDate } =
    controller;
  return (
    <>
      {activeTab === 'valores' && (
        <div className={styles.tabContent}>
          <Card className={styles.agendamentosCard}>
            <div className={styles.agendamentosHeader}>
              <Heading level={3} variant="section" className={styles.sectionTitle} style={{ margin: 0 }}>
                Financeiro dos Eventos
              </Heading>
              <div className={styles.agendamentosPills}>
                <div className={styles.agendamentosPill}>
                  <span className={styles.agendamentosPillLabel}>Total Final</span>
                  <span className={`${styles.agendamentosPillValue} ${styles.green}`}>
                    {formatBRL(totalFinalValue)}
                  </span>
                </div>
              </div>
            </div>
            {eventsWithFinalValue.length === 0 ? (
              <p className={styles.agendamentosEmpty}>Nenhum agendamento com valor final cadastrado.</p>
            ) : (
              <div className={styles.agendamentosList}>
                {eventsWithFinalValue.map((event) => (
                  <div
                    key={event.id}
                    className={styles.agendamentoRow}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedFinancialEvent(event)}
                    onKeyDown={(keyEvent) => {
                      if (keyEvent.key === 'Enter') setSelectedFinancialEvent(event);
                    }}
                  >
                    <div className={styles.agendamentoInfo}>
                      <span className={styles.agendamentoName}>{event.name}</span>
                      <span className={styles.agendamentoDate}>
                        {safeFormatDate(event.date, "dd 'de' MMM yyyy", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <div className={styles.agendamentoRight}>
                      <span className={styles.agendamentoValue} style={{ color: 'var(--text-muted)' }}>
                        Est: {formatBRL(event.budget ?? 0)}
                      </span>
                      <span className={styles.agendamentoValue} style={{ color: '#16a34a' }}>
                        Sinal: {formatBRL(event.depositValue || 0)}
                      </span>
                      <span className={styles.agendamentoValue} style={{ color: '#f59e0b' }}>
                        Desloc.: {formatBRL(event.travelCost || 0)}
                      </span>
                      <span className={`${styles.agendamentoValue} ${styles.green}`}>
                        Final: {formatBRL(event.finalValue || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ===== TAB: LANCAMENTOS ===== */}
    </>
  );
}
