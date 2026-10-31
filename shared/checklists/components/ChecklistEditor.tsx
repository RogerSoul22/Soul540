import styles from '../styles/ChecklistEnvioPage.module.scss';

type Props = {
  newItem: string;
  bulkItems: string;
  onNewItemChange: (value: string) => void;
  onBulkItemsChange: (value: string) => void;
  onAddSingle: () => void;
  onAddBulk: () => void;
};

export function ChecklistEditor({ newItem, bulkItems, onNewItemChange, onBulkItemsChange, onAddSingle, onAddBulk }: Props) {
  return (
    <article className={styles.panel}>
      <div className={styles.groupHeader}><h2 className={styles.groupTitle}>Montar checklist</h2></div>
      <div className={styles.panelBody}>
        <div className={styles.addRow}>
          <input
            className={styles.textInput}
            value={newItem}
            onChange={(event) => onNewItemChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onAddSingle();
              }
            }}
            placeholder="Digite um item para adicionar"
          />
          <button className={styles.button} type="button" onClick={onAddSingle}>Adicionar item</button>
        </div>
        <label className={styles.label} htmlFor="bulk-checklist">Colar lista de itens</label>
        <textarea
          id="bulk-checklist"
          className={styles.textarea}
          value={bulkItems}
          onChange={(event) => onBulkItemsChange(event.target.value)}
          placeholder={'Um item por linha\nConfirmar endereco\nSeparar guardanapos\nLevar gas reserva'}
        />
        <button className={styles.buttonGhost} type="button" onClick={onAddBulk}>Adicionar lista</button>
      </div>
    </article>
  );
}
