import { Button, Input } from '@soul540/ui';
import InvoiceCard from './components/InvoiceCard';
import InvoiceConfirmModals from './components/InvoiceConfirmModals';
import InvoiceFormModal from './components/InvoiceFormModal';
import InvoicePreviewModal from './components/InvoicePreviewModal';
import { statusLabels, type FilterStatus } from './types/invoice-types';
import { useNotasFiscaisController } from './hooks/use-notas-fiscais-controller';
import styles from './styles/NotasFiscais.module.scss';

export default function NotasFiscais() {
  const controller = useNotasFiscaisController();
  const emissionInvoice = controller.confirmEmitId
    ? controller.invoices.find((invoice) => invoice.id === controller.confirmEmitId) || null
    : null;
  const deleteInvoice = controller.confirmDeleteId
    ? controller.invoices.find((invoice) => invoice.id === controller.confirmDeleteId)
    : null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Notas Fiscais</h1>
          <p className={styles.subtitle}>Emissão e controle de notas fiscais de serviço</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={controller.openCreateForm}>+ Nova Nota Fiscal</Button>
        </div>
      </div>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          {(['all', 'rascunho', 'emitida', 'cancelada'] as FilterStatus[]).map((status) => (
            <Button
              type="button"
              variant="ghost"
              key={status}
              className={styles.filterBtn + (controller.filterStatus === status ? ' ' + styles.filterBtnActive : '')}
              onClick={() => controller.setFilterStatus(status)}
            >
              {status === 'all' ? 'Todas' : statusLabels[status]}
            </Button>
          ))}
        </div>
        <Input
          label="Buscar"
          className={styles.searchInput}
          placeholder="Buscar por cliente, evento, número..."
          value={controller.search}
          onChange={(event) => controller.setSearch(event.target.value)}
        />
      </div>
      {controller.emitError && (
        <div className={styles.errorToast}>
          {controller.emitError}
          <Button
            type="button"
            variant="ghost"
            className={styles.errorToastClose}
            onClick={() => controller.setEmitError(null)}
          >
            X
          </Button>
        </div>
      )}
      {controller.filtered.length === 0 ? (
        <div className={styles.emptyState}>Nenhuma nota fiscal encontrada.</div>
      ) : (
        <div className={styles.cardsGrid}>
          {controller.filtered.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              eventName={controller.events.find((event) => event.id === invoice.eventId)?.name}
              onPreview={() => controller.setPreviewInvoice(invoice)}
              onEmit={() => controller.setConfirmEmitId(invoice.id)}
              onEdit={() => controller.openEditForm(invoice)}
              onCancel={() => controller.updateInvoice(invoice.id, { status: 'cancelada' })}
              onDelete={() => controller.setConfirmDeleteId(invoice.id)}
            />
          ))}
        </div>
      )}
      <InvoiceConfirmModals
        emitInvoice={emissionInvoice}
        deleteId={controller.confirmDeleteId}
        onCloseEmit={() => controller.setConfirmEmitId(null)}
        onEmit={controller.confirmEmission}
        onCloseDelete={() => controller.setConfirmDeleteId(null)}
        onDelete={() => {
          if (deleteInvoice) void controller.deleteInvoice(deleteInvoice.id);
          controller.setConfirmDeleteId(null);
        }}
      />
      {controller.showForm && (
        <InvoiceFormModal
          editing={Boolean(controller.editingInvoice)}
          form={controller.invoiceForm.form}
          events={controller.events}
          subtotal={controller.invoiceForm.subtotal}
          taxAmount={controller.invoiceForm.taxAmount}
          onChange={controller.invoiceForm.updateField}
          onItemChange={controller.invoiceForm.updateItem}
          onAddItem={controller.invoiceForm.addItem}
          onRemoveItem={controller.invoiceForm.removeItem}
          onSubmit={controller.handleSubmit}
          onClose={controller.closeForm}
        />
      )}
      {controller.previewInvoice && (
        <InvoicePreviewModal
          invoice={controller.previewInvoice}
          eventName={controller.events.find((event) => event.id === controller.previewInvoice?.eventId)?.name}
          onClose={() => controller.setPreviewInvoice(null)}
        />
      )}
    </div>
  );
}
