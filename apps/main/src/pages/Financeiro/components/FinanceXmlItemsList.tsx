import { formatCurrencyPtBr as formatBRL } from '@soul540/domain';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceXmlItemsList({ controller }: { controller: FinanceiroController }) {
  const { xmlItems, setXmlItems, groupedCostCategories } = controller;
  return (
    <>
      <div className={styles.xmlMeta}>
        <span className={styles.xmlCount}>
          {xmlItems.filter((item) => item.selected).length} de {xmlItems.length} itens selecionados
        </span>
        <button
          className={styles.xmlToggleAll}
          onClick={() => {
            const allSelected = xmlItems.every((item) => item.selected);
            setXmlItems((items) => items.map((item) => ({ ...item, selected: !allSelected })));
          }}
        >
          {xmlItems.every((item) => item.selected) ? 'Desmarcar todos' : 'Selecionar todos'}
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
                {item.quantity} {item.measureUnit} x {formatBRL(item.unitValue)} ={' '}
                <strong>{formatBRL(item.totalValue)}</strong>
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
              {groupedCostCategories
                .filter((group) => group.categories.length > 0)
                .map((group) => (
                  <optgroup key={group.section.key} label={group.section.label}>
                    {group.categories.map((category) => (
                      <option key={category.key} value={category.key}>
                        {category.label}
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
          {formatBRL(xmlItems.filter((item) => item.selected).reduce((sum, item) => sum + item.totalValue, 0))}
        </strong>
      </div>
    </>
  );
}
