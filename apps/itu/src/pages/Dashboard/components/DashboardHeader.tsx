import { Button, InfoButton, PageHeader } from '../../../../../../packages/pentagono/src/index';
import styles from '../styles/Dashboard.module.scss';

type Props = {
  today: string;
  greeting: string;
  urgentTaskCount: number;
  onInfo: () => void;
  onNewEvent: () => void;
};

export default function DashboardHeader({ today, greeting, urgentTaskCount, onInfo, onNewEvent }: Props) {
  const plural = urgentTaskCount > 1 ? 's' : '';

  return (
    <PageHeader
      variant="greeting"
      className={styles.header}
      eyebrow={today}
      title={greeting}
      titleExtra={<InfoButton label="Sobre o Dashboard" onClick={onInfo} />}
      subtitle={
        urgentTaskCount > 0 ? (
          <>
            Você tem{' '}
            <strong>
              {urgentTaskCount} tarefa{plural} urgente{plural}
            </strong>{' '}
            pendente{plural} hoje.
          </>
        ) : (
          'Nenhuma urgência no momento — tudo sob controle.'
        )
      }
      actions={
        <Button variant="primary" onClick={onNewEvent}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo Evento
        </Button>
      }
    />
  );
}
