import { Button, Input, Modal, Select } from '../../../../../../packages/pentagono/src/index';
import type { SuppliesController } from '../hooks/use-supplies-controller';
import styles from '../styles/EstoqueInsumos.module.scss';

export default function SupplyXmlModal({ controller }: { controller: SuppliesController }) {
  const { showXmlModal, setShowXmlModal, xmlItems, setXmlItems, xmlSupplier, xmlImporting, categories, importXml } =
    controller;
  if (!showXmlModal) return null;
  const selected = xmlItems.filter((item) => item.selected);
  return (
    <Modal
      title="Importar NF-e XML"
      onClose={() => setShowXmlModal(false)}
      closeOnOverlay
      className={styles.xmlModal}
      subtitle={<>Fornecedor: {xmlSupplier || 'não informado'}</>}
      flush
    >
      <div className={styles.xmlMeta}>
        <span>
          {selected.length} de {xmlItems.length} itens selecionados
        </span>
        <Button
          variant="ghost"
          size="sm"
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
        </Button>
      </div>
      <div className={styles.xmlList}>
        {xmlItems.map((item) => (
          <div key={item.id} className={styles.xmlRow + ' ' + (!item.selected ? styles.xmlRowDisabled : '')}>
            <Input
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
            <Select
              variant="compact"
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
            </Select>
          </div>
        ))}
      </div>
      <div className={styles.modalFooter}>
        <Button variant="ghost" onClick={() => setShowXmlModal(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={importXml} disabled={xmlImporting || selected.length === 0}>
          {xmlImporting ? 'Importando...' : 'Importar ' + selected.length + ' itens'}
        </Button>
      </div>
    </Modal>
  );
}
