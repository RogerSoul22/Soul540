import { Button, InfoButton, PageHeader } from '../../../../../../packages/pentagono/src/index';
import type { EventosController } from '../hooks/use-eventos-controller';
import styles from '../styles/Eventos.module.scss';

export default function EventosHeader({ controller }: { controller: EventosController }) {
  const { openCreate, setShowInfo } = controller;
  return (
    <PageHeader
      title="Eventos"
      subtitle="Gerencie seus eventos de pizza"
      titleExtra={
        <>
          <InfoButton label="Como usar esta página" onClick={() => setShowInfo(true)} />
        </>
      }
      actions={
        <>
          <Button variant="primary" onClick={openCreate}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Novo Evento
          </Button>
        </>
      }
    />
  );
}
