import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';
import { ptBR } from 'date-fns/locale';
import { safeFormatDate } from '../support/event-formatters';
import styles from '../styles/Eventos.module.scss';

export default function FactoryEventDetailsBasics({ event }: { event: PizzaEvent }) {
  return (
    <>
      <div className={styles.detailSection}>
        <p className={styles.detailSectionTitle}>Informações</p>
        <div className={styles.detailGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Origem</span>
            <span className={styles.detailValue}>
              {(event as any).source === 'franchise' ? 'Franquia' : 'Principal'}
            </span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Data</span>
            <span className={styles.detailValue}>
              {safeFormatDate(event.date, "dd 'de' MMMM, yyyy", { locale: ptBR })}
              {event.endDate && ` → ${safeFormatDate(event.endDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}`}
            </span>
          </div>
          {event.time && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Horário</span>
              <span className={styles.detailValue}>{event.time}</span>
            </div>
          )}
          {event.teamArrivalTime && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Chegada da equipe</span>
              <span className={styles.detailValue}>{event.teamArrivalTime}</span>
            </div>
          )}
          {event.duration && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Duração</span>
              <span className={styles.detailValue}>{event.duration}</span>
            </div>
          )}
          {event.celebration && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Comemoração</span>
              <span className={styles.detailValue}>{event.celebration}</span>
            </div>
          )}
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Local</span>
            <span className={styles.detailValue}>
              {event.location}
              {event.outOfCity && ' (fora da cidade)'}
            </span>
          </div>
          {event.city && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Cidade</span>
              <span className={styles.detailValue}>{event.city}</span>
            </div>
          )}
          {event.phone && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Telefone</span>
              <span className={styles.detailValue}>{event.phone}</span>
            </div>
          )}
        </div>
        {event.locationImageData && (
          <div className={styles.detailImageWrap}>
            <img src={event.locationImageData} alt="Local do evento" className={styles.detailImage} />
          </div>
        )}
      </div>

      <div className={styles.detailSection}>
        <p className={styles.detailSectionTitle}>Convidados</p>
        <div className={styles.detailGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Total</span>
            <span className={styles.detailValue}>{event.guestCount}</span>
          </div>
          {(event.guestsAdult != null || event.guestsTeen != null || event.guestsChild != null) && (
            <>
              {event.guestsAdult != null && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Adultos</span>
                  <span className={styles.detailValue}>{event.guestsAdult}</span>
                </div>
              )}
              {event.guestsTeen != null && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Adolescentes (12-17)</span>
                  <span className={styles.detailValue}>{event.guestsTeen}</span>
                </div>
              )}
              {event.guestsChild != null && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Crianças (até 11)</span>
                  <span className={styles.detailValue}>{event.guestsChild}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
