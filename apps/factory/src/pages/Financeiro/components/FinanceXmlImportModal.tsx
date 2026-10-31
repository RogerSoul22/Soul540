import { Button } from '../../../../../../packages/ui/src/index';
import { Modal } from '../../../../../../packages/ui/src/index';
import styles from '../styles/Financeiro.module.scss';
import type { FinanceSupportController } from '../types/finance-support-types';

export default function FinanceXmlImportModal({ controller }: { controller: FinanceSupportController }) {
  const {
    showXmlModal,
    setShowXmlModal,
    xmlItems,
    setXmlItems,
    xmlSupplier,
    xmlDate,
    xmlImporting,
    handleXmlImport,
    groupedCostCategories,
  } = controller;

  return showXmlModal ? (
    <div className={styles.overlay} onClick={() => setShowXmlModal(false)}>
      <div className={styles.xmlModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Importar NF-e XML</h2>
            {xmlSupplier && (
              <p className={styles.xmlSupplier}>
                Fornecedor: <strong>{xmlSupplier}</strong>
              </p>
            )}
            {xmlDate && (
              <p className={styles.xmlSupplier}>
                Data: <strong>{new Date(xmlDate + 'T12:00:00').toLocaleDateString('pt-BR')}</strong>
              </p>
            )}
          </div>
          <button className={styles.modalClose} onClick={() => setShowXmlModal(false)}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className={styles.modalBody} style={{ padding: '16px 24px', gap: 12 }}>
          <div className={styles.xmlMeta}>
            <span className={styles.xmlCount}>
              {xmlItems.filter((i) => i.selected).length} de {xmlItems.length} itens selecionados
            </span>
            <button
              className={styles.xmlToggleAll}
              onClick={() => {
                const allSelected = xmlItems.every((i) => i.selected);
                setXmlItems((prev) => prev.map((i) => ({ ...i, selected: !allSelected })));
              }}
            >
              {xmlItems.every((i) => i.selected) ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
          </div>
          <div className={styles.xmlList}>
            {xmlItems.map((item) => (
              <div key={item.id} className={`${styles.xmlRow} ${!item.selected ? styles.xmlRowDisabled : ''}`}>
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={(e) =>
                    setXmlItems((prev) =>
                      prev.map((i) => (i.id === item.id ? { ...i, selected: e.target.checked } : i)),
                    )
                  }
                  style={{ accentColor: 'var(--accent)', flexShrink: 0 }}
                />
                <div className={styles.xmlInfo}>
                  <span className={styles.xmlName}>{item.name}</span>
                  <span className={styles.xmlDetails}>
                    {item.quantity} {item.measureUnit} × R$ {item.unitValue.toFixed(2)} ={' '}
                    <strong>R$ {item.totalValue.toFixed(2)}</strong>
                  </span>
                </div>
                <select
                  className={styles.xmlCatSelect}
                  value={item.category}
                  onChange={(e) =>
                    setXmlItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, category: e.target.value } : i)))
                  }
                >
                  <option value="">Categoria...</option>
                  {groupedCostCategories
                    .filter((g) => g.categories.length > 0)
                    .map((g) => (
                      <optgroup key={g.section.key} label={g.section.label}>
                        {g.categories.map((cat) => (
                          <option key={cat.key} value={cat.key}>
                            {cat.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                </select>
              </div>
            ))}
          </div>
          <div className={styles.xmlTotal}>
            Total selecionado:{' '}
            <strong>
              R${' '}
              {xmlItems
                .filter((i) => i.selected)
                .reduce((acc, i) => acc + i.totalValue, 0)
                .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={() => setShowXmlModal(false)}>
            Cancelar
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleXmlImport}
            disabled={xmlImporting || xmlItems.every((i) => !i.selected)}
          >
            {xmlImporting
              ? 'Importando...'
              : 'Importar ' +
                xmlItems.filter((i) => i.selected).length +
                ' item' +
                (xmlItems.filter((i) => i.selected).length !== 1 ? 's' : '')}
          </button>
        </div>
      </div>
    </div>
  ) : null;
}
