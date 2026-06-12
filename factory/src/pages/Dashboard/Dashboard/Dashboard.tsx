import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CalendarView from '@/components/CalendarView/CalendarView';
import { getUpcomingOperationalAlerts } from '@shared/eventInsights';
import { buildEmployeeSchedule, getEventFinancialClosing, type OperationalEmployee } from '@shared/eventOperations';
import { apiFetch } from '@/lib/api';
import styles from './Dashboard.module.scss';

type ProductionOrderStatus = 'a_preparar' | 'a_enviar' | 'entregue';

type ProductionOrder = {
  id: string;
  orderNumber?: number;
  filial: string;
  itens: Array<{ nome: string; measure: string; quantidade: number }>;
  totalCost: number;
  status: ProductionOrderStatus;
};

function getGreeting(name?: string): string {
  const hour = new Date().getHours();
  const firstName = name?.split(' ')[0] || '';
  const suffix = firstName ? `, ${firstName}` : '';
  if (hour < 12) return `Bom dia${suffix}`;
  if (hour < 18) return `Boa tarde${suffix}`;
  return `Boa noite${suffix}`;
}

function parseEventDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

function formatEventDate(value: string | undefined | null, pattern: string): string {
  const parsed = parseEventDate(value);
  return parsed ? format(parsed, pattern) : 'Sem data';
}

export default function Dashboard() {
  const { events, tasks, finances } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const [employees, setEmployees] = useState<OperationalEmployee[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);

  useEffect(() => {
    apiFetch('/api/employees')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setEmployees(data))
      .catch(() => {});
    apiFetch('/api/production-orders')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setProductionOrders(data))
      .catch(() => {});
  }, []);

  const urgentTasks = useMemo(() => tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done'), [tasks]);

  const now = new Date();
  const monthEventCount = useMemo(() => {
    return events.filter((e) => {
      const d = parseEventDate(e.date);
      if (!d) return false;
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [events]);

  const today = format(now, "EEEE, d 'de' MMMM", { locale: ptBR });
  const currentMonth = format(now, 'MMMM', { locale: ptBR });
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
      .filter((event) => parseEventDate(event.date))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 3)
      .map((event) => ({ event, closing: getEventFinancialClosing(event, finances) })),
    [events, finances],
  );

  const activeProductionOrders = useMemo(
    () => productionOrders
      .filter((order) => order.status === 'a_preparar' || order.status === 'a_enviar')
      .sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0)),
    [productionOrders],
  );

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
          <span className={styles.calendarMonth}>{currentMonth}</span>
          <span className={styles.calendarCount}>
            {monthEventCount} evento{monthEventCount !== 1 ? 's' : ''}
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
                    <span className={styles.opsEventDate}>{formatEventDate(alert.event.date, 'dd/MM/yyyy')}</span>
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
                <p className={styles.opsTitle}>Modo fabrica</p>
                <p className={styles.opsSubtitle}>Pedidos ativos de producao</p>
              </div>
            </div>
            <div className={styles.opsList}>
              {activeProductionOrders.length === 0 ? (
                <span className={styles.opsEmpty}>Nenhum pedido ativo para produzir.</span>
              ) : activeProductionOrders.slice(0, 4).map((order) => (
                <div key={order.id} className={styles.opsItem}>
                  <div className={styles.opsItemMain}>
                    <span className={styles.opsEventName}>
                      {order.orderNumber ? `#${order.orderNumber} ` : ''}{order.filial}
                    </span>
                    <span className={styles.opsEventDate}>
                      {order.itens.map((item) => `${item.nome} ${item.quantidade} ${item.measure}`).join(' | ')}
                    </span>
                  </div>
                  <span className={`${styles.opsBadge} ${styles.opsBadgeinfo}`}>
                    {order.status === 'a_preparar' ? 'A preparar' : 'A enviar'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.opsPanel}>
            <div className={styles.opsHeader}>
              <div>
                <p className={styles.opsTitle}>Agenda da equipe</p>
                <p className={styles.opsSubtitle}>Quem esta escalado em cada evento</p>
              </div>
            </div>
            <div className={styles.opsList}>
              {teamSchedule.length === 0 ? (
                <span className={styles.opsEmpty}>Nenhuma escala futura.</span>
              ) : teamSchedule.map((item) => (
                <div key={item.employeeId} className={styles.opsItem}>
                  <div className={styles.opsItemMain}>
                    <span className={styles.opsEventName}>{item.employeeName}</span>
                    <span className={styles.opsEventDate}>{item.events.map((event) => `${formatEventDate(event.date, 'dd/MM')} ${event.name}`).join(' | ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.opsPanel}>
            <div className={styles.opsHeader}>
              <div>
                <p className={styles.opsTitle}>Fechamento financeiro</p>
                <p className={styles.opsSubtitle}>Estimado x realizado para conferencia</p>
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
                </div>
              ))}
            </div>
          </div>
        </div>
        <CalendarView events={events} />
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
