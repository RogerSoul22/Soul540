import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CalendarView from '@/components/CalendarView/CalendarView';
import { getUpcomingOperationalAlerts } from '@shared/eventInsights';
import { buildEmployeeSchedule, getEventFinancialClosing, getEventSupplyForecast, type OperationalEmployee } from '@shared/eventOperations';
import { apiFetch } from '@/lib/api';
import styles from './Dashboard.module.scss';

function getGreeting(name?: string): string {
  const hour = new Date().getHours();
  const firstName = name?.split(' ')[0] || '';
  const suffix = firstName ? `, ${firstName}` : '';
  if (hour < 12) return `Bom dia${suffix}`;
  if (hour < 18) return `Boa tarde${suffix}`;
  return `Boa noite${suffix}`;
}

export default function Dashboard() {
  const { events, tasks, finances } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [employees, setEmployees] = useState<OperationalEmployee[]>([]);

  useEffect(() => {
    apiFetch('/api/employees')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setEmployees(data))
      .catch(() => {});
  }, []);

  const urgentTasks = useMemo(() => tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done'), [tasks]);

  const monthEventCount = useMemo(() => {
    return events.filter((e) => {
      const d = parseISO(e.date);
      return d.getMonth() === calendarMonth.getMonth() && d.getFullYear() === calendarMonth.getFullYear();
    }).length;
  }, [events, calendarMonth]);

  const operationalAlerts = useMemo(
    () => getUpcomingOperationalAlerts(events, { limit: 4 }),
    [events],
  );

  const teamSchedule = useMemo(
    () => buildEmployeeSchedule(events, employees, { limit: 3 }).slice(0, 4),
    [events, employees],
  );

  const financialClosings = useMemo(
    () => events
      .filter((event) => event.status === 'completed')
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3)
      .map((event) => ({ event, closing: getEventFinancialClosing(event, finances) })),
    [events, finances],
  );

  const supplyForecasts = useMemo(
    () => events
      .filter((event) => event.status !== 'completed' && event.status !== 'cancelled')
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3)
      .map((event) => ({ event, forecast: getEventSupplyForecast(event) })),
    [events],
  );

  const now = new Date();
  const today = format(now, "EEEE, d 'de' MMMM", { locale: ptBR });
  const currentMonth = format(calendarMonth, 'MMMM', { locale: ptBR });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.dateLabel}>{today}</p>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{getGreeting(user?.name)}</h1>
            <button className={styles.btnInfo} onClick={() => setShowInfo(true)} title="Sobre o Dashboard">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </button>
          </div>
          {urgentTasks.length > 0 ? (
            <p className={styles.subtitle}>
              Você tem <strong>{urgentTasks.length} tarefa{urgentTasks.length > 1 ? 's' : ''} urgente{urgentTasks.length > 1 ? 's' : ''}</strong> pendente{urgentTasks.length > 1 ? 's' : ''} hoje.
            </p>
          ) : (
            <p className={styles.subtitle}>Nenhuma urgência no momento — tudo sob controle.</p>
          )}
        </div>
      </div>


{/* Calendar */}
      <div className={styles.calendarSection}>
        <div className={styles.calendarHeader}>
          <div className={styles.calendarHeaderLeft}>
            <span className={styles.calendarMonth}>{currentMonth}</span>
            <span className={styles.calendarCount}>
              {monthEventCount} evento{monthEventCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className={styles.calendarHeaderRight}>
          <button
            className={styles.btnNewSchedule}
            onClick={() => navigate('/eventos?action=new')}
            title="Criar novo agendamento"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>
            Novo Agendamento
          </button>
          <button
            className={styles.btnNewEntry}
            onClick={() => navigate('/financeiro?action=new&type=cost')}
            title="Lançar nova despesa"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Lançar Despesa
          </button>
          </div>
        </div>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#3b82f6' }} />
            Orçamento
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#f59e0b' }} />
            Fechado
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#22c55e' }} />
            Finalizado
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#ef4444' }} />
            Com observação
          </span>
        </div>
        {operationalAlerts.length > 0 && (
          <div className={styles.opsPanel}>
            <div className={styles.opsHeader}>
              <div>
                <p className={styles.opsTitle}>Atenção operacional</p>
                <p className={styles.opsSubtitle}>Eventos próximos com pendências para revisar</p>
              </div>
              <button className={styles.opsAction} onClick={() => navigate('/eventos')}>
                Ver eventos
              </button>
            </div>
            <div className={styles.opsList}>
              {operationalAlerts.map((alert) => (
                <div key={alert.event.id} className={styles.opsItem}>
                  <div className={styles.opsItemMain}>
                    <span className={styles.opsEventName}>{alert.event.name}</span>
                    <span className={styles.opsEventDate}>{format(parseISO(alert.event.date), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className={styles.opsBadges}>
                    <span className={`${styles.opsBadge} ${styles[`opsBadge${alert.paymentSeverity}`]}`}>
                      {alert.paymentLabel}
                    </span>
                    {alert.issues.slice(0, 3).map((issue) => (
                      <span key={issue.key} className={`${styles.opsBadge} ${styles[`opsBadge${issue.severity}`]}`}>
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
              <div>
                <p className={styles.opsTitle}>Agenda da equipe</p>
                <p className={styles.opsSubtitle}>Funcionarios escalados nos proximos eventos</p>
              </div>
            </div>
            <div className={styles.opsList}>
              {teamSchedule.length === 0 ? (
                <span className={styles.opsEmpty}>Nenhuma escala futura.</span>
              ) : teamSchedule.map((item) => (
                <div key={item.employeeId} className={styles.opsItem}>
                  <div className={styles.opsItemMain}>
                    <span className={styles.opsEventName}>{item.employeeName}</span>
                    <span className={styles.opsEventDate}>{item.events.map((event) => `${format(parseISO(event.date), 'dd/MM')} ${event.name}`).join(' | ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.opsPanel}>
            <div className={styles.opsHeader}>
              <div>
                <p className={styles.opsTitle}>Fechamento financeiro</p>
                <p className={styles.opsSubtitle}>Estimado x realizado nos eventos finalizados</p>
              </div>
            </div>
            <div className={styles.opsList}>
              {financialClosings.length === 0 ? (
                <span className={styles.opsEmpty}>Nenhum evento finalizado para comparar.</span>
              ) : financialClosings.map(({ event, closing }) => (
                <div key={event.id} className={styles.opsItem}>
                  <div className={styles.opsItemMain}>
                    <span className={styles.opsEventName}>{event.name}</span>
                    <span className={styles.opsEventDate}>
                      Est. R$ {closing.estimatedRevenue.toLocaleString('pt-BR')} | Real. R$ {closing.realizedResult.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <span className={`${styles.opsBadge} ${closing.difference >= 0 ? styles.opsBadgeinfo : styles.opsBadgewarning}`}>
                    {closing.statusLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.opsPanel}>
            <div className={styles.opsHeader}>
              <div>
                <p className={styles.opsTitle}>Previsao de insumos</p>
                <p className={styles.opsSubtitle}>Baseada em convidados e cardapio</p>
              </div>
            </div>
            <div className={styles.opsList}>
              {supplyForecasts.length === 0 ? (
                <span className={styles.opsEmpty}>Nenhum evento futuro para prever.</span>
              ) : supplyForecasts.map(({ event, forecast }) => (
                <div key={event.id} className={styles.opsItem}>
                  <div className={styles.opsItemMain}>
                    <span className={styles.opsEventName}>{event.name}</span>
                    <span className={styles.opsEventDate}>
                      {forecast.pizzas} pizzas | {forecast.flourKg} kg farinha | {forecast.cheeseKg} kg queijo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <CalendarView events={events} month={calendarMonth} onMonthChange={setCalendarMonth} />
      </div>

      {showInfo && (
        <div className={styles.overlay} onClick={() => setShowInfo(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Sobre o Dashboard</h2>
              <button className={styles.modalClose} onClick={() => setShowInfo(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.infoSection}>
                <p className={styles.infoSectionTitle}>O que é o Dashboard?</p>
                <p className={styles.infoText}>
                  O <strong>Dashboard</strong> é a tela inicial do sistema. Ele exibe uma visão geral dos eventos do mês em um calendário interativo, alertas de tarefas urgentes e as principais métricas do negócio.
                </p>
              </div>
              <div className={styles.infoSection}>
                <p className={styles.infoSectionTitle}>Calendário de eventos</p>
                <ul className={styles.infoList}>
                  <li>Exibe todos os agendamentos cadastrados no mês atual.</li>
                  <li>Clique em um evento para ver seus detalhes completos.</li>
                  <li>Use as setas para navegar entre os meses.</li>
                  <li>O contador acima mostra quantos eventos há no mês em exibição.</li>
                </ul>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <span />
              <button className={styles.btnPrimary} onClick={() => setShowInfo(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
