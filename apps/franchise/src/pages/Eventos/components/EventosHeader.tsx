import type { EventosController } from '../hooks/use-eventos-controller';
import styles from '../styles/Eventos.module.scss';

export default function EventosHeader({ controller }: { controller: EventosController }) {
  const { openCreate, setShowInfo } = controller;
  return (
    <div className={styles.header}>
      <div>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Eventos</h1>
          <button className={styles.btnInfo} onClick={() => setShowInfo(true)} title="Como usar esta página">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        </div>
        <p className={styles.subtitle}>Gerencie seus agendamentos e eventos de pizza</p>
      </div>
      <button className={styles.btnPrimary} onClick={openCreate}>
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
        Novo Agendamento
      </button>
    </div>
  );
}
