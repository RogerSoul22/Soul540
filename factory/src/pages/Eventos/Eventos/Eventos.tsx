import { useState, useMemo, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import type { PizzaEvent } from '@/types/Event';
import { format, parseISO, isValid } from 'date-fns';
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

function safeFormatDate(date: string | undefined | null, fmt: string, options?: Parameters<typeof format>[2]): string {
  if (!date) return '-';
  const d = parseISO(date);
  return isValid(d) ? format(d, fmt, options) : '-';
}

function groupByMonth(evs: PizzaEvent[]): { key: string; label: string; events: PizzaEvent[] }[] {
  const map = new Map<string, PizzaEvent[]>();
  for (const ev of evs) {
    const d = parseISO(ev.date);
    if (!isValid(d)) continue;
    const key = format(d, 'yyyy-MM');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(ev);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, events]) => ({
      key,
      label: format(parseISO(`${key}-01`), 'MMMM yyyy', { locale: ptBR }),
      events,
    }));
}

function buildWhatsAppUrl(ev: PizzaEvent): string {
  const digits = ev.phone?.replace(/\D/g, '') || '';
  if (!digits) return '';
  const dateStr = safeFormatDate(ev.date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const value = ev.finalValue ?? ev.budget ?? 0;
  const lines = [
    `Olá! Segue o resumo do evento *${ev.name}*:`,
    '',
    `Data: ${dateStr}${ev.time ? ` às ${ev.time}` : ''}`,
    `Local: ${ev.location}${ev.outOfCity ? ' (fora da cidade)' : ''}`,
    `Convidados: ${ev.guestCount}`,
    `Valor: R$ ${value.toLocaleString('pt-BR')}`,
    ...(ev.notes ? [`Obs: ${ev.notes}`] : []),
  ];
  return `https://wa.me/55${digits}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function EventCard({ ev, employeeMap, onView }: {
  ev: PizzaEvent;
  employeeMap: Record<string, string>;
  onView: (ev: PizzaEvent) => void;
}) {
  const isFranchise = (ev as any).source === 'franchise';
  return (
    <div className={styles.card} onClick={() => onView(ev)}>
      <div className={styles.cardTop}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <h3 className={styles.cardTitle} style={{ margin: 0 }}>{ev.name}</h3>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
              background: isFranchise ? '#7c3aed22' : '#0369a122',
              color: isFranchise ? '#7c3aed' : '#0369a1',
              textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap',
            }}>
              {isFranchise ? 'Franquia' : 'Principal'}
            </span>
          </div>
          <p className={styles.cardSub}>
            {safeFormatDate(ev.date, "dd 'de' MMM, yyyy", { locale: ptBR })}
            {ev.endDate && ` → ${safeFormatDate(ev.endDate, "dd 'de' MMM", { locale: ptBR })}`}
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
          {ev.guestCount} convidados{ev.staffCount ? ` · ${ev.staffCount} funcionários` : ''}
        </div>
        <div className={styles.cardRow}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          R$ {((ev.finalValue ?? ev.budget) ?? 0).toLocaleString('pt-BR')}
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
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

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

  const monthGroupsFechados = useMemo(() => groupByMonth(filtered.fechados), [filtered.fechados]);

  function toggleMonth(key: string) {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const ev = viewingEvent;
  const totalGuests = ev
    ? ((ev.guestsAdult ?? 0) + (ev.guestsTeen ?? 0) + (ev.guestsChild ?? 0)) || ev.guestCount || 0
    : 0;

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
          {/* Orçamentos — flat list */}
          {filtered.orcamentos.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Orçamentos</h2>
              <div className={styles.grid}>
                {filtered.orcamentos.map((e) => <EventCard key={e.id} ev={e} employeeMap={employeeMap} onView={setViewingEvent} />)}
              </div>
            </div>
          )}

          {/* Eventos Fechados — grouped by month */}
          {monthGroupsFechados.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Eventos Fechados</h2>
              <div className={styles.monthGroup}>
                {monthGroupsFechados.map(({ key, label, events: evs }) => {
                  const isOpen = expandedMonths.has(key);
                  const total = evs.reduce((s, e) => s + ((e.finalValue ?? e.budget) ?? 0), 0);
                  return (
                    <div key={key}>
                      <button
                        className={`${styles.monthCard} ${isOpen ? styles.monthCardOpen : ''}`}
                        onClick={() => toggleMonth(key)}
                      >
                        <div className={styles.monthCardLeft}>
                          <span className={styles.monthCardName}>{label}</span>
                          <span className={styles.monthCardCount}>{evs.length} evento{evs.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className={styles.monthCardRight}>
                          {total > 0 && (
                            <span className={styles.monthCardValue}>
                              R$ {total.toLocaleString('pt-BR')}
                            </span>
                          )}
                          <svg
                            className={`${styles.monthCardChevron} ${isOpen ? styles.monthCardChevronOpen : ''}`}
                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </div>
                      </button>
                      {isOpen && (
                        <div className={styles.monthCardBody}>
                          <div className={styles.grid}>
                            {evs.map((e) => <EventCard key={e.id} ev={e} employeeMap={employeeMap} onView={setViewingEvent} />)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail modal */}
      {ev && (
        <div className={styles.overlay} onClick={() => setViewingEvent(null)}>
          <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{ev.name}</h2>
              <button className={styles.modalClose} onClick={() => setViewingEvent(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className={styles.detailBody}>

              <div className={styles.detailSection}>
                <p className={styles.detailSectionTitle}>Informações</p>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Origem</span>
                    <span className={styles.detailValue}>
                      {(ev as any).source === 'franchise' ? 'Franquia' : 'Principal'}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Data</span>
                    <span className={styles.detailValue}>
                      {safeFormatDate(ev.date, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                      {ev.endDate && ` → ${safeFormatDate(ev.endDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}`}
                    </span>
                  </div>
                  {ev.time && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Horário</span>
                      <span className={styles.detailValue}>{ev.time}</span>
                    </div>
                  )}
                  {ev.teamArrivalTime && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Chegada da equipe</span>
                      <span className={styles.detailValue}>{ev.teamArrivalTime}</span>
                    </div>
                  )}
                  {ev.duration && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Duração</span>
                      <span className={styles.detailValue}>{ev.duration}</span>
                    </div>
                  )}
                  {ev.celebration && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Comemoração</span>
                      <span className={styles.detailValue}>{ev.celebration}</span>
                    </div>
                  )}
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Local</span>
                    <span className={styles.detailValue}>{ev.location}{ev.outOfCity && ' (fora da cidade)'}</span>
                  </div>
                  {ev.city && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Cidade</span>
                      <span className={styles.detailValue}>{ev.city}</span>
                    </div>
                  )}
                  {ev.phone && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Telefone</span>
                      <span className={styles.detailValue}>{ev.phone}</span>
                    </div>
                  )}
                </div>
                {ev.locationImageData && (
                  <div className={styles.detailImageWrap}>
                    <img src={ev.locationImageData} alt="Local do evento" className={styles.detailImage} />
                  </div>
                )}
              </div>

              <div className={styles.detailSection}>
                <p className={styles.detailSectionTitle}>Convidados</p>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Total</span>
                    <span className={styles.detailValue}>{totalGuests}</span>
                  </div>
                  {(ev.guestsAdult != null || ev.guestsTeen != null || ev.guestsChild != null) && (
                    <>
                      {ev.guestsAdult != null && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Adultos</span>
                          <span className={styles.detailValue}>{ev.guestsAdult}</span>
                        </div>
                      )}
                      {ev.guestsTeen != null && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Adolescentes (12-17)</span>
                          <span className={styles.detailValue}>{ev.guestsTeen}</span>
                        </div>
                      )}
                      {ev.guestsChild != null && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Crianças (até 11)</span>
                          <span className={styles.detailValue}>{ev.guestsChild}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className={styles.detailSection}>
                <p className={styles.detailSectionTitle}>Financeiro</p>
                <div className={styles.detailGrid}>
                  {ev.finalValue != null && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Valor Final</span>
                      <span className={styles.detailValue}>R$ {ev.finalValue.toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                  {ev.budget != null && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Orçamento</span>
                      <span className={styles.detailValue}>R$ {ev.budget.toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                  {ev.travelCost != null && ev.travelCost > 0 && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Deslocamento</span>
                      <span className={styles.detailValue}>R$ {ev.travelCost.toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                  {ev.paymentMethod && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Forma de Pagamento</span>
                      <span className={styles.detailValue}>{ev.paymentMethod}</span>
                    </div>
                  )}
                </div>
              </div>

              {(ev.responsibleEmployeeId || ev.staffCount || (ev.selectedEmployeeIds && ev.selectedEmployeeIds.length > 0) || ev.teamPizzaiolo || ev.teamHelper || ev.teamGarcon) && (
                <div className={styles.detailSection}>
                  <p className={styles.detailSectionTitle}>Equipe Soul540</p>
                  <div className={styles.detailGrid}>
                    {ev.teamPizzaiolo && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Pizzaio</span>
                        <span className={styles.detailValue}>{employeeMap[ev.teamPizzaiolo] || ev.teamPizzaiolo}</span>
                      </div>
                    )}
                    {ev.teamHelper && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Ajudante</span>
                        <span className={styles.detailValue}>{employeeMap[ev.teamHelper] || ev.teamHelper}</span>
                      </div>
                    )}
                    {ev.teamGarcon && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Garçon</span>
                        <span className={styles.detailValue}>{employeeMap[ev.teamGarcon] || ev.teamGarcon}</span>
                      </div>
                    )}
                    {ev.responsibleEmployeeId && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Responsável</span>
                        <span className={styles.detailValue}>{employeeMap[ev.responsibleEmployeeId] || ev.responsibleEmployeeId}</span>
                      </div>
                    )}
                    {ev.staffCount && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Funcionários</span>
                        <span className={styles.detailValue}>{ev.staffCount} pessoas</span>
                      </div>
                    )}
                  </div>
                  {ev.selectedEmployeeIds && ev.selectedEmployeeIds.length > 0 && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Equipe escalada</span>
                      <div className={styles.menuTags}>
                        {ev.selectedEmployeeIds.map((id) => (
                          <span key={id} className={styles.menuTag}>{employeeMap[id] || id}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {ev.menu && ev.menu.length > 0 && (
                <div className={styles.detailSection}>
                  <p className={styles.detailSectionTitle}>Cardápio</p>
                  <div className={styles.menuTags}>
                    {ev.menu.map((item, i) => (
                      <span key={i} className={styles.menuTag}>{item}</span>
                    ))}
                  </div>
                </div>
              )}

              {ev.notes && (
                <div className={styles.detailSection}>
                  <p className={styles.detailSectionTitle}>Observações</p>
                  <p className={styles.detailValue}>{ev.notes}</p>
                </div>
              )}

              {(ev.paymentProofData || ev.contractPdfData) && (
                <div className={styles.detailSection}>
                  <p className={styles.detailSectionTitle}>Documentos</p>
                  <div className={styles.docGrid}>
                    {ev.paymentProofData && (
                      <div className={styles.docCard}>
                        <div className={styles.docCardHeader}>
                          <span className={styles.detailLabel}>Comprovante de Pagamento</span>
                          <a
                            className={styles.docDownloadBtn}
                            href={ev.paymentProofData}
                            download={ev.paymentProofName || 'comprovante'}
                            onClick={(e) => e.stopPropagation()}
                            title="Baixar"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          </a>
                        </div>
                        {ev.paymentProofData.startsWith('data:image') ? (
                          <img src={ev.paymentProofData} alt="Comprovante" className={styles.docPreviewImage} />
                        ) : ev.paymentProofData.startsWith('data:application/pdf') ? (
                          <iframe src={ev.paymentProofData} className={styles.docPreviewPdf} title="Comprovante PDF" />
                        ) : (
                          <div className={styles.docNoPreview}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            <span>{ev.paymentProofName || 'Arquivo'}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {ev.contractPdfData && (
                      <div className={styles.docCard}>
                        <div className={styles.docCardHeader}>
                          <span className={styles.detailLabel}>Contrato</span>
                          <a
                            className={styles.docDownloadBtn}
                            href={ev.contractPdfData}
                            download={ev.contractPdfName || 'contrato'}
                            onClick={(e) => e.stopPropagation()}
                            title="Baixar"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          </a>
                        </div>
                        {ev.contractPdfData.startsWith('data:image') ? (
                          <img src={ev.contractPdfData} alt="Contrato" className={styles.docPreviewImage} />
                        ) : ev.contractPdfData.startsWith('data:application/pdf') ? (
                          <iframe src={ev.contractPdfData} className={styles.docPreviewPdf} title="Contrato PDF" />
                        ) : (
                          <div className={styles.docNoPreview}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            <span>{ev.contractPdfName || 'Arquivo'}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {ev.createdBy && (
                <div className={styles.detailSection}>
                  <p className={styles.detailSectionTitle}>Criado por</p>
                  <p className={styles.detailValue}>{ev.createdBy}</p>
                </div>
              )}

            </div>
            <div className={styles.modalFooter}>
              <span />
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
                  <li>Os eventos fechados são agrupados por mês — clique no mês para expandir.</li>
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
