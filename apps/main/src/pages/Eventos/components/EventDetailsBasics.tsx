import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';
import { ptBR } from 'date-fns/locale';
import { safeFormat } from '../support/event-formatters';
import styles from '../styles/Eventos.module.scss';

export default function EventDetailsBasics({ event }: { event: PizzaEvent }) {
  return (
    <>
      {/* Informações */}
      <div className={styles.detailSection}>
        <p className={styles.detailSectionTitle}>Informações</p>
        <div className={styles.detailGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Data</span>
            <span className={styles.detailValue}>
              {safeFormat(event.date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              {event.endDate && ` → ${safeFormat(event.endDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}`}
            </span>
          </div>
          {event.celebration && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Celebração</span>
              <span className={styles.detailValue}>{event.celebration}</span>
            </div>
          )}
          {event.time && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Horário de Início</span>
              <span className={styles.detailValue}>{event.time}</span>
            </div>
          )}
          {event.teamArrivalTime && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Equipe chega</span>
              <span className={styles.detailValue}>{event.teamArrivalTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Local */}
      <div className={styles.detailSection}>
        <p className={styles.detailSectionTitle}>Local</p>
        <div className={styles.detailGrid}>
          {event.city && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Cidade</span>
              <span className={styles.detailValue}>{event.city}</span>
            </div>
          )}
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Endereço</span>
            <span className={styles.detailValue}>{event.location}</span>
          </div>
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

      {/* Convidados */}
      <div className={styles.detailSection}>
        <p className={styles.detailSectionTitle}>Convidados</p>
        <div className={styles.detailGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Total</span>
            <span className={styles.detailValue}>{event.guestCount}</span>
          </div>
          {event.guestsAdult != null && event.guestsAdult > 0 && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Acima de 12 anos</span>
              <span className={styles.detailValue}>{event.guestsAdult}</span>
            </div>
          )}
          {event.guestsTeen != null && event.guestsTeen > 0 && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>De 8 até 12 anos</span>
              <span className={styles.detailValue}>{event.guestsTeen}</span>
            </div>
          )}
          {event.guestsChild != null && event.guestsChild > 0 && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Abaixo de 7 anos</span>
              <span className={styles.detailValue}>{event.guestsChild}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cardápio */}
      {event.menu && event.menu.length > 0 && (
        <div className={styles.detailSection}>
          <p className={styles.detailSectionTitle}>Cardápio</p>
          <div className={styles.menuTags}>
            {event.menu.map((item: string, i: number) => (
              <span key={i} className={styles.menuTag}>
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
