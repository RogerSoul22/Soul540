import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@frontend/contexts/AppContext';
import { useAuth } from '@frontend/hooks/useAuth';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CalendarView from '@frontend/components/CalendarView/CalendarView';
import styles from './Dashboard.module.scss';

function getGreeting(name?: string): string {
  const hour = new Date().getHours();
  const firstName = name?.split(' ')[0] || '';
  const suffix = firstName ? `, ${firstName}` : '';
  if (hour < 12) return `Bom dia${suffix}`;
  if (hour < 18) return `Boa tarde${suffix}`;
  return `Boa noite${suffix}`;
}

type UnitFilter = 'all' | 'main' | 'franchise';

export default function Dashboard() {
  const { events, tasks } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const [unitFilter, setUnitFilter] = useState<UnitFilter>('all');
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const urgentTasks = useMemo(() => tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done'), [tasks]);

  const filteredEvents = useMemo(() => {
    if (unitFilter === 'main') return events.filter((e) => !e.source || e.source === 'main');
    if (unitFilter === 'franchise') return events.filter((e) => e.source === 'franchise');
    return events;
  }, [events, unitFilter]);

  const monthEventCount = useMemo(() => {
    return filteredEvents.filter((e) => {
      const d = parseISO(e.date);
      return d.getMonth() === calendarMonth.getMonth() && d.getFullYear() === calendarMonth.getFullYear();
    }).length;
  }, [filteredEvents, calendarMonth]);

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
            <div className={styles.unitFilter}>
              <button
                className={`${styles.unitFilterBtn} ${unitFilter === 'all' ? styles.unitFilterBtnActive : ''}`}
                onClick={() => setUnitFilter('all')}
              >
                Todos
              </button>
              <button
                className={`${styles.unitFilterBtn} ${unitFilter === 'main' ? styles.unitFilterBtnActive : ''}`}
                onClick={() => setUnitFilter('main')}
              >
                Sorocaba
              </button>
              <button
                className={`${styles.unitFilterBtn} ${unitFilter === 'franchise' ? styles.unitFilterBtnActive : ''}`}
                onClick={() => setUnitFilter('franchise')}
              >
                Campinas
              </button>
            </div>
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
        <CalendarView events={filteredEvents} month={calendarMonth} onMonthChange={setCalendarMonth} />
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
