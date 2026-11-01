import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CalendarView from '../../components/CalendarView/CalendarView';
import { SkeletonContent } from '../../../../../packages/pentagono/src/index';
import styles from './styles/Dashboard.module.scss';
import FactoryDashboardHeader from './components/FactoryDashboardHeader';
import FactoryDashboardInfoModal from './components/FactoryDashboardInfoModal';
import FactoryDashboardPanels from './components/FactoryDashboardPanels';
import { useFactoryDashboardController } from './hooks/use-factory-dashboard-controller';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const controller = useFactoryDashboardController();
  const dataLoading = controller.dataLoading;
  const { now } = controller;
  const today = format(now, "EEEE, d 'de' MMMM", { locale: ptBR });
  const currentMonth = format(now, 'MMMM', { locale: ptBR });

  return (
    <div className={styles.page}>
      <FactoryDashboardHeader
        today={today}
        greeting={controller.greeting}
        urgentTaskCount={controller.urgentTaskCount}
        onInfo={() => setShowInfo(true)}
      />
      <div className={styles.calendarSection}>
        <div className={styles.calendarHeader}>
          <span className={styles.calendarMonth}>{currentMonth}</span>
          <span className={styles.calendarCount}>
            {controller.monthEventCount} evento{controller.monthEventCount !== 1 ? 's' : ''}
          </span>
        </div>
        {dataLoading ? (
          <SkeletonContent variant="cards" label="Carregando painéis..." />
        ) : (
          <FactoryDashboardPanels
            operationalAlerts={controller.operationalAlerts}
            activeProductionOrders={controller.activeProductionOrders}
            teamSchedule={controller.teamSchedule}
            financialClosings={controller.financialClosings}
            onNavigate={navigate}
          />
        )}
        <div data-skeleton={dataLoading}>
          <CalendarView events={controller.events} />
        </div>
      </div>
      {showInfo && <FactoryDashboardInfoModal onClose={() => setShowInfo(false)} />}
    </div>
  );
}
