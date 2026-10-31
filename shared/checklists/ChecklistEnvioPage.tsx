import styles from './styles/ChecklistEnvioPage.module.scss';
import { ChecklistEditor } from './components/ChecklistEditor';
import { ChecklistEventPanel } from './components/ChecklistEventPanel';
import { ChecklistItems } from './components/ChecklistItems';
import { ChecklistProgressPanel } from './components/ChecklistProgressPanel';
import { RemoveChecklistItemModal } from './components/RemoveChecklistItemModal';
import { useChecklistEnvio } from './hooks/use-checklist-envio';
import type { ChecklistEnvioPageProps } from './types';
import { getEventName } from './utils/checklist-utils';

export default function ChecklistEnvioPage(props: ChecklistEnvioPageProps) {
  const checklist = useChecklistEnvio(props);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Soul540</p>
            <h1 className={styles.title}>Checklist de envio</h1>
            <p className={styles.subtitle}>Checklist publico e editavel por evento para conferir tudo antes da saida da equipe.</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.buttonGhost} type="button" onClick={checklist.copyLink}>Copiar link</button>
            <button className={styles.button} type="button" onClick={checklist.clearChecklist}>Limpar checklist</button>
          </div>
        </header>

        <section className={styles.topGrid}>
          <ChecklistEventPanel
            events={checklist.events}
            loading={checklist.loading}
            meta={checklist.meta}
            selectedEventId={checklist.selectedEventId}
            onSelect={checklist.setEventFromSelect}
          />
          <ChecklistProgressPanel
            eventName={getEventName(checklist.selectedEvent)}
            progress={checklist.progress}
            completed={checklist.completed}
            totalItems={checklist.totalItems}
            feedback={checklist.feedback}
          />
        </section>

        <section className={styles.editorGrid}>
          <ChecklistEditor
            newItem={checklist.newItem}
            bulkItems={checklist.bulkItems}
            onNewItemChange={checklist.setNewItem}
            onBulkItemsChange={checklist.setBulkItems}
            onAddSingle={checklist.addSingleItem}
            onAddBulk={checklist.addBulkItems}
          />
          <ChecklistItems
            items={checklist.items}
            checked={checklist.checked}
            completed={checklist.completed}
            totalItems={checklist.totalItems}
            onToggle={checklist.toggleItem}
            onUpdate={checklist.updateItem}
            onRequestRemove={checklist.requestRemoveItem}
          />
        </section>
      </div>
      <RemoveChecklistItemModal
        item={checklist.removeTarget}
        onCancel={() => checklist.setRemoveTargetId(null)}
        onConfirm={checklist.removeItem}
      />
    </main>
  );
}
