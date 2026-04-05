import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useApp, type Invoice, type InvoiceItem, type InvoiceStatus } from '@/contexts/AppContext';
import { format, parseISO } from 'date-fns';
import Badge from '@/components/Badge/Badge';
import Button from '@/components/Button/Button';
import Modal from '@/components/Modal/Modal';
import styles from './NotasFiscais.module.scss';

type FilterStatus = 'all' | InvoiceStatus;

const statusLabels: Record<InvoiceStatus, string> = {
  rascunho: 'Rascunho',
  emitida: 'Emitida',
  cancelada: 'Cancelada',
};

const statusColors: Record<InvoiceStatus, 'gray' | 'green' | 'red'> = {
  rascunho: 'gray',
  emitida: 'green',
  cancelada: 'red',
};

const emptyItem = (): InvoiceItem => ({ description: '', quantity: 1, unitPrice: 0 });

export default function NotasFiscais() {
  const { events, invoices, addInvoice, deleteInvoice } = useApp();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Form state
  const [formEventId, setFormEventId] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formClientDoc, setFormClientDoc] = useState('');
  const [formClientEmail, setFormClientEmail] = useState('');
  const [formIssueDate, setFormIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTaxRate, setFormTaxRate] = useState('5');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<InvoiceStatus>('rascunho');
  const [formItems, setFormItems] = useState<InvoiceItem[]>([emptyItem()]);

  const formSubtotal = formItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const formTaxAmount = formSubtotal * (parseFloat(formTaxRate || '0') / 100);

  const filtered = useMemo(() => {
    return (invoices || []).filter((inv) => {
      if (filterStatus !== 'all' && inv.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        const event = events.find((e) => e.id === inv.eventId);
        return (
          inv.clientName.toLowerCase().includes(q) ||
          inv.id.toLowerCase().includes(q) ||
          (event?.name || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [invoices, filterStatus, search, events]);

  const resetForm = () => {
    setFormEventId('');
    setFormClientName('');
    setFormClientDoc('');
    setFormClientEmail('');
    setFormIssueDate(new Date().toISOString().split('T')[0]);
    setFormTaxRate('5');
    setFormNotes('');
    setFormStatus('rascunho');
    setFormItems([emptyItem()]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formEventId || !formClientName || formItems.length === 0) return;

    const invoice: Invoice = {
      id: 'nf-' + Date.now(),
      eventId: formEventId,
      clientName: formClientName,
      clientDocument: formClientDoc,
      clientEmail: formClientEmail,
      items: formItems.filter((i) => i.description),
      subtotal: formSubtotal,
      taxRate: parseFloat(formTaxRate || '0'),
      taxAmount: formTaxAmount,
      totalValue: formSubtotal,
      issueDate: formIssueDate,
      notes: formNotes,
      status: formStatus,
      createdAt: new Date().toISOString(),
    };

    addInvoice(invoice);
    resetForm();
    setShowForm(false);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setFormItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const removeItem = (index: number) => {
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Notas Fiscais</h1>
          <p className={styles.subtitle}>Emissão e controle de notas fiscais de serviço</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={() => setShowForm(true)}>+ Nova Nota Fiscal</Button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          {(['all', 'rascunho', 'emitida', 'cancelada'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              className={`${styles.filterBtn} ${filterStatus === status ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? 'Todas' : statusLabels[status]}
            </button>
          ))}
        </div>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar por cliente, evento, número..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>Nenhuma nota fiscal encontrada.</div>
      ) : (
        <div className={styles.cardsGrid}>
          {filtered.map((invoice) => {
            const event = events.find((e) => e.id === invoice.eventId);
            return (
              <div key={invoice.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardId}>{invoice.id.toUpperCase()}</span>
                  <Badge variant={statusColors[invoice.status]}>
                    {statusLabels[invoice.status]}
                  </Badge>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Cliente</span>
                    <span className={styles.cardValue}>{invoice.clientName}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Evento</span>
                    <span className={styles.cardValue}>{event?.name || '-'}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Data Emissão</span>
                    <span className={styles.cardValue}>
                      {format(parseISO(invoice.issueDate), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Itens</span>
                    <span className={styles.cardValue}>{invoice.items.length}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>ISS ({invoice.taxRate}%)</span>
                    <span className={styles.cardValue}>
                      R$ {invoice.taxAmount.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Total</span>
                    <span className={styles.cardValueLg}>
                      R$ {invoice.totalValue.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.cardLabel}>{invoice.clientDocument}</span>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => setPreviewInvoice(invoice)}
                      title="Visualizar"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                      onClick={() => deleteInvoice(invoice.id)}
                      title="Excluir"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title="Nova Nota Fiscal" size="lg" onClose={() => setShowForm(false)}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Evento</label>
                <select
                  className={styles.formSelect}
                  value={formEventId}
                  onChange={(e) => setFormEventId(e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>{evt.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Data de Emissão</label>
                <input
                  type="date"
                  className={styles.formInput}
                  value={formIssueDate}
                  onChange={(e) => setFormIssueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Nome do Cliente</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={formClientName}
                  onChange={(e) => setFormClientName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Documento (CNPJ/CPF)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={formClientDoc}
                  onChange={(e) => setFormClientDoc(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Email do Cliente</label>
                <input
                  type="email"
                  className={styles.formInput}
                  value={formClientEmail}
                  onChange={(e) => setFormClientEmail(e.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Taxa ISS (%)</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={formTaxRate}
                  onChange={(e) => setFormTaxRate(e.target.value)}
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            {/* Items */}
            <div className={styles.itemsSection}>
              <p className={styles.itemsSectionTitle}>Itens da Nota</p>
              {formItems.map((item, index) => (
                <div key={index} className={styles.itemRow}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Descrição</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Descrição do item"
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Qtd</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Valor Unit.</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {formItems.length > 1 && (
                    <button type="button" className={styles.removeItemBtn} onClick={() => removeItem(index)}>
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className={styles.addItemBtn} onClick={() => setFormItems([...formItems, emptyItem()])}>
                + Adicionar Item
              </button>
            </div>

            <div className={styles.formTotal}>
              Subtotal: R$ {formSubtotal.toLocaleString('pt-BR')} &nbsp;|&nbsp; ISS: R$ {formTaxAmount.toLocaleString('pt-BR')} &nbsp;|&nbsp; Total: R$ {formSubtotal.toLocaleString('pt-BR')}
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Observações</label>
              <textarea
                className={styles.formTextarea}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Status</label>
                <select
                  className={styles.formSelect}
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as InvoiceStatus)}
                >
                  <option value="rascunho">Rascunho</option>
                  <option value="emitida">Emitida</option>
                </select>
              </div>
              <div />
            </div>

            <div className={styles.formActions}>
              <Button variant="secondary" type="button" onClick={() => { resetForm(); setShowForm(false); }}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Nota Fiscal</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Preview Modal */}
      {previewInvoice && (
        <Modal title="Visualizar Nota Fiscal" size="lg" onClose={() => setPreviewInvoice(null)}>
          <div className={styles.preview}>
            <div className={styles.previewHeader}>
              <div className={styles.previewLogo}>Soul540</div>
              <div className={styles.previewTitle}>Nota Fiscal de Serviços</div>
            </div>

            <div className={styles.previewSection}>
              <p className={styles.previewSectionTitle}>Tomador de Serviço</p>
              <div className={styles.previewInfo}>
                <p><strong>{previewInvoice.clientName}</strong></p>
                <p>{previewInvoice.clientDocument}</p>
                <p>{previewInvoice.clientEmail}</p>
              </div>
            </div>

            <div className={styles.previewSection}>
              <p className={styles.previewSectionTitle}>Detalhes</p>
              <div className={styles.previewInfo}>
                <p>Número: {previewInvoice.id.toUpperCase()}</p>
                <p>Evento: {events.find((e) => e.id === previewInvoice.eventId)?.name || '-'}</p>
                <p>Data de Emissão: {format(parseISO(previewInvoice.issueDate), 'dd/MM/yyyy')}</p>
              </div>
            </div>

            <table className={styles.previewTable}>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Qtd</th>
                  <th>Valor Unit.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {previewInvoice.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>R$ {item.unitPrice.toLocaleString('pt-BR')}</td>
                    <td>R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.previewTotals}>
              <div className={styles.previewTotalRow}>
                <span>Subtotal:</span>
                <span>R$ {previewInvoice.subtotal.toLocaleString('pt-BR')}</span>
              </div>
              <div className={styles.previewTotalRow}>
                <span>ISS ({previewInvoice.taxRate}%):</span>
                <span>R$ {previewInvoice.taxAmount.toLocaleString('pt-BR')}</span>
              </div>
              <div className={`${styles.previewTotalRow} ${styles.previewTotalFinal}`}>
                <span>Total:</span>
                <span>R$ {previewInvoice.totalValue.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            {previewInvoice.notes && (
              <div className={styles.previewNotes}>
                <strong>Observações:</strong> {previewInvoice.notes}
              </div>
            )}

            <div className={styles.previewFooter}>
              Documento gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
            </div>
          </div>

          <div className={styles.previewActions}>
            <Button variant="secondary" onClick={() => setPreviewInvoice(null)}>Fechar</Button>
            <Button onClick={() => window.print()}>Imprimir</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
