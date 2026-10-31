import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CalendarView from '../../components/CalendarView/CalendarView';
import styles from './styles/Dashboard.module.scss';
import DashboardHeader from './components/DashboardHeader';
import DashboardInfoModal from './components/DashboardInfoModal';
import DashboardPanels from './components/DashboardPanels';
import { useDashboardController } from './hooks/use-dashboard-controller';

export default function Dashboard() {
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();
  const controller = useDashboardController();
  const currentMonth = format(controller.calendarMonth, 'MMMM', {
    locale: ptBR,
  });
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className={styles.page}>
      <DashboardHeader
        today={today}
        greeting={controller.greeting}
        urgentTaskCount={controller.urgentTaskCount}
        onInfo={() => setShowInfo(true)}
      />
      <div className={styles.calendarSection}>
        <div className={styles.calendarHeader}>
          <span className={styles.calendarMonth}>{currentMonth}</span>
          <span className={styles.calendarCount}>
            {controller.monthEventCount} evento
            {controller.monthEventCount !== 1 ? 's' : ''}
          </span>
        </div>
        <DashboardPanels
          operationalAlerts={controller.operationalAlerts}
          teamSchedule={controller.teamSchedule}
          financialClosings={controller.financialClosings}
          onNavigate={() => {}}
        />
        <CalendarView
          events={controller.events}
          month={controller.calendarMonth}
          onMonthChange={controller.setCalendarMonth}
        />
      </div>
      {showInfo && <DashboardInfoModal onClose={() => setShowInfo(false)} />}
    </div>
  );
}
