import { useState, useMemo, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import type { PizzaEvent } from '@/types/Event';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from './Eventos.module.scss';

type Employee = {
  id: string;
  name: string;
  role: string;
  phone: string;
  status: string;
  createdAt: string;
};

const roleLabels: Record<string, string> = {
  pizzaiolo: 'Pizzaiolo',
  auxiliar: 'Auxiliar',
  garcom: 'Garcom',
  gerente: 'Gerente',
  entregador: 'Entregador',
  administrativo: 'Administrativo',
};

function buildWhatsAppUrl(ev: PizzaEvent): string {
  const digits = ev.phone?.replace(/\D/g, '') || '';
  if (!digits) return '';
  const dateStr = format(parseISO(ev.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const lines = [
    `Olá! Segue o resumo do evento *${ev.name}*:`,
    '',
    `Data: ${dateStr}${ev.time ? ` às ${ev.time}` : ''}`,
    `Local: ${ev.location}${ev.outOfCity ? ' (fora da cidade)' : ''}`,
    `Convidados: ${ev.guestCount}`,
    `Valor: R$ ${(ev.budget ?? 0).toLocaleString('pt-BR')}`,
    ...(ev.notes ? [`Obs: ${ev.notes}`] : []),
  ];
  return `https://wa.me/55${digits}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function EventCard({ ev, employeeMap, onView }: {
  ev: PizzaEvent;
  employeeMap: Record<string, string>;
  onView: (ev: PizzaEvent) => void;
}) {
  return (
    <div className={styles.card} onClick={() => onView(ev)}>
      <div className={styles.cardTop}>
        <div>
          <h3 className={styles.cardTitle}>{ev.name}</h3>
          <p className={styles.cardSub}>
            {format(parseISO(ev.date), "dd 'de' MMM, yyyy", { locale: ptBR })}
            {ev.endDate && ` → ${format(parseISO(ev.endDate), "dd 'de' MMM", { locale: ptBR })}`}
            {ev.time && ` · ${ev.time}`}
          </p>
        </div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardRow}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {ev.location}{ev.outOfCity && ' (fora da cidade)'}
        </div>
        <div className={styles.cardRow}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          {ev.guestCount} convidados{ev.staffCount ? ` · ${ev.staffCount} funcionarios` : ''}
        </div>
        <div className={styles.cardRow}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          R$ {(ev.budget ?? 0).toLocaleString('pt-BR')}
        </div>
        {ev.responsibleEmployeeId && (
          <div className={styles.cardRow}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Resp: {employeeMap[ev.responsibleEmployeeId] || ev.responsibleEmployeeId}
          </div>
        )}
      </div>
      {ev.notes && <p className={styles.cardNotes}>{ev.notes}</p>}
      <div className={styles.cardActions}>
        {ev.phone && (
          <a className={styles.btnWhatsapp} href={buildWhatsAppUrl(ev)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} title="WhatsApp">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
          </a>
        )}
      </div>
    </div>
  );
}

export default function Eventos() {
  const { events } = useApp();
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    apiFetch('/api/employees').then(r => r.json()).then(setEmployees).catch(() => {});
  }, []);

  const [search, setSearch] = useState('');
  const [viewingEvent, setViewingEvent] = useState<PizzaEvent | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const employeeMap = useMemo(() => {
    const m: Record<string, string> = {};
    employees.forEach((e) => { m[e.id] = e.name; });
    return m;
  }, [employees]);

  const filtered = useMemo(() => {
    const all = events
      .filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return {
      fechados: all.filter((e) => e.status !== 'planning'),
      orcamentos: all.filter((e) => e.status === 'planning'),
    };
  }, [events, search]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Eventos</h1>
            <button className={styles.btnInfo} onClick={() => setShowInfo(true)} title="Como usar esta página">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </button>
          </div>
          <p className={styles.subtitle}>Visualize os agendamentos e eventos de pizza</p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            className={styles.searchInput}
            placeholder="Buscar eventos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.fechados.length === 0 && filtered.orcamentos.length === 0 ? (
        <div className={styles.empty}>
          <p>Nenhum evento encontrado.</p>
        </div>
      ) : (
        <div className={styles.sections}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Orçamentos</h2>
            {filtered.orcamentos.length === 0 ? (
              <p className={styles.sectionEmpty}>Nenhum orçamento.</p>
            ) : (
              <div className={styles.grid}>
                {filtered.orcamentos.map((ev) => <EventCard key={ev.id} ev={ev} employeeMap={employeeMap} onView={setViewingEvent} />)}
              </div>
            )}
          </div>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Eventos Fechados</h2>
            {filtered.fechados.length === 0 ? (
              <p className={styles.sectionEmpty}>Nenhum evento fechado.</p>
            ) : (
              <div className={styles.grid}>
                {filtered.fechados.map((ev) => <EventCard key={ev.id} ev={ev} employeeMap={employeeMap} onView={setViewingEvent} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {viewingEvent && (
        <div className={styles.overlay} onClick={() => setViewingEvent(null)}>
          <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{viewingEvent.name}</h2>
              <button className={styles.modalClose} onClick={() => setViewingEvent(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className={styles.detailBody}>

              <div className={styles.detailSection}>
                <p className={styles.detailSectionTitle}>Informações</p>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Data</span>
                    <span className={styles.detailValue}>
                      {format(parseISO(viewingEvent.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                      {viewingEvent.endDate && ` → ${format(parseISO(viewingEvent.endDate), "dd 'de' MMMM, yyyy", { locale: ptBR })}`}
                    </span>
                  </div>
                  {viewingEvent.time && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Horário</span>
                      <span className={styles.detailValue}>{viewingEvent.time}</span>
                    </div>
                  )}
                  {viewingEvent.duration && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Duração</span>
                      <span className={styles.detailValue}>{viewingEvent.duration}</span>
                    </div>
                  )}
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Local</span>
                    <span className={styles.detailValue}>{viewingEvent.location}{viewingEvent.outOfCity && ' (fora da cidade)'}</span>
                  </div>
                  {viewingEvent.phone && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Telefone</span>
                      <span className={styles.detailValue}>{viewingEvent.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.detailSection}>
                <p className={styles.detailSectionTitle}>Financeiro</p>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Valor</span>
                    <span className={styles.detailValue}>R$ {(viewingEvent.budget ?? 0).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Convidados</span>
                    <span className={styles.detailValue}>{viewingEvent.guestCount}</span>
                  </div>
                </div>
              </div>

              {(viewingEvent.responsibleEmployeeId || viewingEvent.staffCount || (viewingEvent.selectedEmployeeIds && viewingEvent.selectedEmployeeIds.length > 0)) && (
                <div className={styles.detailSection}>
                  <p className={styles.detailSectionTitle}>Equipe</p>
                  <div className={styles.detailGrid}>
                    {viewingEvent.responsibleEmployeeId && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Responsável</span>
                        <span className={styles.detailValue}>{employeeMap[viewingEvent.responsibleEmployeeId] || viewingEvent.responsibleEmployeeId}</span>
                      </div>
                    )}
                    {viewingEvent.staffCount && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Funcionários</span>
                        <span className={styles.detailValue}>{viewingEvent.staffCount} pessoas</span>
                      </div>
                    )}
                  </div>
                  {viewingEvent.selectedEmployeeIds && viewingEvent.selectedEmployeeIds.length > 0 && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Equipe escalada</span>
                      <div className={styles.menuTags}>
                        {viewingEvent.selectedEmployeeIds.map((id) => (
                          <span key={id} className={styles.menuTag}>{employeeMap[id] || id}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {viewingEvent.menu && viewingEvent.menu.length > 0 && (
                <div className={styles.detailSection}>
                  <p className={styles.detailSectionTitle}>Cardápio</p>
                  <div className={styles.menuTags}>
                    {viewingEvent.menu.map((item, i) => (
                      <span key={i} className={styles.menuTag}>{item}</span>
                    ))}
                  </div>
                </div>
              )}

              {viewingEvent.notes && (
                <div className={styles.detailSection}>
                  <p className={styles.detailSectionTitle}>Observações</p>
                  <p className={styles.detailValue}>{viewingEvent.notes}</p>
                </div>
              )}

              {(viewingEvent.paymentProofName || viewingEvent.contractPdfName) && (
                <div className={styles.detailSection}>
                  <p className={styles.detailSectionTitle}>Documentos</p>
                  <div className={styles.detailGrid}>
                    {viewingEvent.paymentProofName && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Comprovante</span>
                        <span className={styles.detailValue}>{viewingEvent.paymentProofName}</span>
                      </div>
                    )}
                    {viewingEvent.contractPdfName && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Contrato</span>
                        <span className={styles.detailValue}>{viewingEvent.contractPdfName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {viewingEvent.createdBy && (
                <div className={styles.detailSection}>
                  <p className={styles.detailSectionTitle}>Criado por</p>
                  <p className={styles.detailValue}>{viewingEvent.createdBy}</p>
                </div>
              )}

            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setViewingEvent(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {showInfo && (
        <div className={styles.overlay} onClick={() => setShowInfo(false)}>
          <div className={styles.modal} style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Sobre esta página</h2>
              <button className={styles.modalClose} onClick={() => setShowInfo(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.infoSection}>
                <p className={styles.infoSectionTitle}>O que é esta página?</p>
                <p className={styles.infoText}>
                  A página de <strong>Eventos</strong> exibe todos os agendamentos de pizza da unidade principal e das franquias. A fábrica tem acesso somente de leitura — não é possível criar, editar ou excluir eventos por aqui.
                </p>
              </div>
              <div className={styles.infoSection}>
                <p className={styles.infoSectionTitle}>Como visualizar um evento</p>
                <ol className={styles.infoList}>
                  <li>Clique em qualquer card de evento para ver os detalhes completos.</li>
                  <li>Use a barra de busca para filtrar eventos por nome.</li>
                  <li>Os eventos são divididos em <strong>Orçamentos</strong> e <strong>Eventos Fechados</strong>.</li>
                </ol>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <span />
              <button className={styles.btnPrimary} onClick={() => setShowInfo(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
