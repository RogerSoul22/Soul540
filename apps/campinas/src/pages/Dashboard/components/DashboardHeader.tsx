import { Button, InfoButton, PageHeader } from '../../../../../../packages/pentagono/src/index';
import styles from '../styles/Dashboard.module.scss';

type Props = {
  today: string;
  greeting: string;
  urgentTaskCount: number;
  onInfo: () => void;
};

export default function DashboardHeader({ today, greeting, urgentTaskCount, onInfo }: Props) {
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
    />
  );
}
