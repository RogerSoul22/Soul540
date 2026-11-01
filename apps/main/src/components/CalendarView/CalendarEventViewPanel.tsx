import { Button } from '../../../../../packages/pentagono/src/index';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ReactNode } from 'react';
import type { PizzaEvent } from '../../../../../packages/contracts/src/index';
import styles from './styles/CalendarView.module.scss';
import { buildWhatsAppUrl } from './calendar-utils';

type Props = {
  event: PizzaEvent;
  onEdit: () => void;
  onDelete: () => void;
  onFinalize: () => void;
};

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{children}</span>
    </div>
  );
}

export default function CalendarEventViewPanel({ event, onEdit, onDelete, onFinalize }: Props) {
  const endDate = event.endDate
    ? ' → ' + format(parseISO(event.endDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : '';
  return (
    <>
      <div className={styles.panelBody}>
        <div className={styles.detailSection}>
          <p className={styles.detailSectionTitle}>Informações</p>
          <div className={styles.detailGrid}>
            <Detail label="Data">
              {format(parseISO(event.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR }) + endDate}
            </Detail>
            {event.time && <Detail label="Horário">{event.time}</Detail>}
            {event.duration && <Detail label="Duração">{event.duration}</Detail>}
            <Detail label="Local">
              {event.location}
              {event.outOfCity && ' (fora da cidade)'}
            </Detail>
            {event.phone && <Detail label="Telefone">{event.phone}</Detail>}
          </div>
        </div>
        <div className={styles.detailSection}>
          <p className={styles.detailSectionTitle}>Financeiro</p>
          <div className={styles.detailGrid}>
            <Detail label="Valor">R$ {event.budget.toLocaleString('pt-BR')}</Detail>
            <Detail label="Convidados">{event.guestCount}</Detail>
          </div>
        </div>
        {event.staffCount != null && event.staffCount > 0 && (
          <div className={styles.detailSection}>
            <p className={styles.detailSectionTitle}>Equipe</p>
            <div className={styles.detailGrid}>
              <Detail label="Funcionários">{event.staffCount} pessoas</Detail>
            </div>
          </div>
        )}
        {!!event.menu.length && (
          <div className={styles.detailSection}>
            <p className={styles.detailSectionTitle}>Cardápio</p>
            <div className={styles.menuList}>
              {event.menu.map((item) => (
                <span key={item} className={styles.menuTag}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
        {event.notes && (
          <div className={styles.detailSection}>
            <p className={styles.detailSectionTitle}>Observações</p>
            <p className={styles.notesBox}>{event.notes}</p>
          </div>
        )}
        {(event.paymentProofName || event.contractPdfName) && (
          <div className={styles.detailSection}>
            <p className={styles.detailSectionTitle}>Documentos</p>
            <div className={styles.docList}>
              {event.paymentProofName && <span className={styles.docTag}>↑ {event.paymentProofName}</span>}
              {event.contractPdfName && <span className={styles.docTag}>▣ {event.contractPdfName}</span>}
            </div>
          </div>
        )}
        <div className={styles.detailSection}>
          <p className={styles.detailSectionTitle}>Criado por</p>
          <span className={styles.detailValue}>
            {event.createdBy || format(parseISO(event.createdAt), 'dd/MM/yyyy')}
          </span>
        </div>
      </div>
      <div className={styles.panelActions}>
        <Button variant="danger" onClick={onDelete}>
          Excluir
        </Button>
        {event.phone && (
          <a className={styles.btnWhatsapp} href={buildWhatsAppUrl(event)} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        )}
        {event.status !== 'completed' && (
          <Button variant="primary" size="sm" className={styles.btnFinalize} onClick={onFinalize}>
            ✓ Finalizar
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Editar
        </Button>
      </div>
    </>
  );
}
