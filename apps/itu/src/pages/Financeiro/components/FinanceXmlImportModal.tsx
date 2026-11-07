import { Button, Input, Modal, Select } from '../../../../../../packages/pentagono/src/index';
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
    <Modal
      title="Importar NF-e XML"
      onClose={() => setShowXmlModal(false)}
      closeOnOverlay
      maxWidth={620}
      className={styles.xmlModal}
      subtitle={
        <>
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
        </>
      }
      flush
    >
      <div className={styles.modalBody} style={{ padding: '16px 24px', gap: 12 }}>
        <div className={styles.xmlMeta}>
          <span className={styles.xmlCount}>
            {xmlItems.filter((i) => i.selected).length} de {xmlItems.length} itens selecionados
          </span>
          <Button
            variant="ghost"
            size="sm"
            className={styles.xmlToggleAll}
            onClick={() => {
              const allSelected = xmlItems.every((i) => i.selected);
              setXmlItems((prev) => prev.map((i) => ({ ...i, selected: !allSelected })));
            }}
          >
            {xmlItems.every((i) => i.selected) ? 'Desmarcar todos' : 'Selecionar todos'}
          </Button>
        </div>
        <div className={styles.xmlList}>
          {xmlItems.map((item) => (
            <div key={item.id} className={`${styles.xmlRow} ${!item.selected ? styles.xmlRowDisabled : ''}`}>
              <Input
                type="checkbox"
                checked={item.selected}
                onChange={(e) =>
                  setXmlItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, selected: e.target.checked } : i)))
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
              <Select
                variant="compact"
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
              </Select>
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
        <Button variant="ghost" onClick={() => setShowXmlModal(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleXmlImport}
          disabled={xmlImporting || xmlItems.every((i) => !i.selected)}
        >
          {xmlImporting
            ? 'Importando...'
            : 'Importar ' +
              xmlItems.filter((i) => i.selected).length +
              ' item' +
              (xmlItems.filter((i) => i.selected).length !== 1 ? 's' : '')}
        </Button>
      </div>
    </Modal>
  ) : null;
}
