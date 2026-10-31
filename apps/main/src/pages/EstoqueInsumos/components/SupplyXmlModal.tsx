import type { SuppliesController } from '../hooks/use-supplies-controller';
import styles from '../styles/EstoqueInsumos.module.scss';

export default function SupplyXmlModal({ controller }: { controller: SuppliesController }) {
  const { showXmlModal, setShowXmlModal, xmlItems, setXmlItems, xmlSupplier, xmlImporting, categories, importXml } =
    controller;
  if (!showXmlModal) return null;
  const selected = xmlItems.filter((item) => item.selected);
  return (
    <div className={styles.overlay} onClick={() => setShowXmlModal(false)}>
      <div className={styles.xmlModal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Importar NF-e XML</h2>
            <p className={styles.modalSubtitle}>Fornecedor: {xmlSupplier || 'não informado'}</p>
          </div>
          <button className={styles.modalClose} onClick={() => setShowXmlModal(false)}>
            ×
          </button>
        </div>
        <div className={styles.xmlMeta}>
          <span>
            {selected.length} de {xmlItems.length} itens selecionados
          </span>
          <button
            className={styles.xmlToggleAll}
            onClick={() =>
              setXmlItems((items) =>
                items.map((item) => ({
                  ...item,
                  selected: !selected.length || !item.selected ? true : false,
                })),
              )
            }
          >
            {selected.length === xmlItems.length ? 'Desmarcar todos' : 'Selecionar todos'}
          </button>
        </div>
        <div className={styles.xmlList}>
          {xmlItems.map((item) => (
            <div key={item.id} className={styles.xmlRow + ' ' + (!item.selected ? styles.xmlRowDisabled : '')}>
              <input
                type="checkbox"
                checked={item.selected}
                onChange={(event) =>
                  setXmlItems((items) =>
                    items.map((current) =>
                      current.id === item.id ? { ...current, selected: event.target.checked } : current,
                    ),
                  )
                }
              />
              <div className={styles.xmlInfo}>
                <span className={styles.xmlName}>{item.name}</span>
                <span className={styles.xmlDetails}>
                  {item.quantity} {item.measureUnit} · R$ {item.costPerUnit.toFixed(2)}
                </span>
              </div>
              <select
                className={styles.xmlCatSelect}
                value={item.category}
                onChange={(event) =>
                  setXmlItems((items) =>
                    items.map((current) =>
                      current.id === item.id ? { ...current, category: event.target.value } : current,
                    ),
                  )
                }
              >
                <option value="">Categoria...</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={() => setShowXmlModal(false)}>
            Cancelar
          </button>
          <button className={styles.btnPrimary} onClick={importXml} disabled={xmlImporting || selected.length === 0}>
            {xmlImporting ? 'Importando...' : 'Importar ' + selected.length + ' itens'}
          </button>
        </div>
      </div>
    </div>
  );
}
