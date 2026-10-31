import { ptBR } from 'date-fns/locale';
import { buildWhatsAppUrl } from './calendar-utils';
import { safeFormat, WHATSAPP_ICON_PATH } from './calendar-event-factory-utils';
import type { PizzaEvent } from '@soul540/contracts';
import styles from './styles/CalendarView.module.scss';

export function FactoryCalendarEventView({ event, onClose }: { event: PizzaEvent; onClose: () => void }) {
  const endDate = event.endDate ? ' → ' + safeFormat(event.endDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : '';

  return (
    <>
      <div className={styles.panelBody}>
        <div className={styles.detailSection}>
          <p className={styles.detailSectionTitle}>Informações</p>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Data</span>
              <span className={styles.detailValue}>
                {safeFormat(event.date, "d 'de' MMMM 'de' yyyy", { locale: ptBR }) + endDate}
              </span>
            </div>
            {event.time && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Horário</span>
                <span className={styles.detailValue}>{event.time}</span>
              </div>
            )}
            {event.duration && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Duração</span>
                <span className={styles.detailValue}>{event.duration}</span>
              </div>
            )}
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Local</span>
              <span className={styles.detailValue}>
                {event.location}
                {event.outOfCity && ' (fora da cidade)'}
              </span>
            </div>
            {event.phone && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Telefone</span>
                <span className={styles.detailValue}>{event.phone}</span>
              </div>
            )}
          </div>
        </div>
        <div className={styles.detailSection}>
          <p className={styles.detailSectionTitle}>Financeiro</p>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Valor</span>
              <span className={styles.detailValue}>R$ {(event.budget ?? 0).toLocaleString('pt-BR')}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Convidados</span>
              <span className={styles.detailValue}>{event.guestCount}</span>
            </div>
          </div>
        </div>
        {event.staffCount != null && event.staffCount > 0 && (
          <div className={styles.detailSection}>
            <p className={styles.detailSectionTitle}>Equipe</p>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Funcionários</span>
                <span className={styles.detailValue}>{event.staffCount} pessoas</span>
              </div>
            </div>
          </div>
        )}
        {event.notes && (
          <div className={styles.detailSection}>
            <p className={styles.detailSectionTitle}>Observações</p>
            <p className={styles.notesBox}>{event.notes}</p>
          </div>
        )}
        {(event.menu ?? []).length > 0 && (
          <div className={styles.detailSection}>
            <p className={styles.detailSectionTitle}>Cardápio</p>
            <div className={styles.menuList}>
              {(event.menu ?? []).map((item) => (
                <span key={item} className={styles.menuTag}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
        {(event.paymentProofName || event.contractPdfName) && (
          <div className={styles.detailSection}>
            <p className={styles.detailSectionTitle}>Documentos</p>
            <div className={styles.docList}>
              {event.paymentProofName && <span className={styles.docTag}>{event.paymentProofName}</span>}
              {event.contractPdfName && <span className={styles.docTag}>{event.contractPdfName}</span>}
            </div>
          </div>
        )}
        <div className={styles.detailSection}>
          <p className={styles.detailSectionTitle}>Criado por</p>
          <span className={styles.detailValue}>{event.createdBy || safeFormat(event.createdAt, 'dd/MM/yyyy')}</span>
        </div>
      </div>
      <div className={styles.panelActions}>
        {event.phone && (
          <a
            className={styles.btnWhatsapp}
            href={buildWhatsAppUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            title="WhatsApp"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d={WHATSAPP_ICON_PATH} />
            </svg>
            WhatsApp
          </a>
        )}
        <button className={styles.btnCancel} onClick={onClose}>
          Fechar
        </button>
      </div>
    </>
  );
}
