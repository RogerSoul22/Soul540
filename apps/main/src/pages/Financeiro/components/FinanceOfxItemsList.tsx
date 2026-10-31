import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyPtBr as formatBRL } from '@soul540/domain';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';

function safeFormatDate(date: string | undefined | null): string {
  if (!date) return '-';
  const parsed = parseISO(date);
  return isValid(parsed) ? format(parsed, 'dd/MM/yyyy', { locale: ptBR }) : '-';
}

function decisionLabel(decision: string): string {
  if (decision === 'duplicate') return 'Já importado';
  if (decision === 'link') return 'Vincular';
  if (decision === 'ambiguous') return 'Classificação manual necessária';
  return 'Criar sem classificação';
}

export default function FinanceOfxItemsList({
  controller,
  duplicateCount,
}: {
  controller: FinanceiroController;
  duplicateCount: number;
}) {
  const { ofxItems, setOfxItems, groupedRevenueCategories, groupedCostCategories } = controller;
  const availableItems = ofxItems.filter((item) => item.decision === 'link' || item.decision === 'create_unclassified');
  const allSelected = availableItems.length > 0 && availableItems.every((item) => item.selected);
  const selectedRevenue = ofxItems
    .filter((item) => item.selected && item.type === 'revenue')
    .reduce((sum, item) => sum + item.amount, 0);
  const selectedCosts = ofxItems
    .filter((item) => item.selected && item.type === 'cost')
    .reduce((sum, item) => sum + item.amount, 0);

  const toggleAll = () => {
    setOfxItems((items) =>
      items.map((item) => ({
        ...item,
        selected: item.decision === 'duplicate' || item.decision === 'ambiguous' ? false : !allSelected,
      })),
    );
  };

  return (
    <>
      <div className={styles.xmlMeta}>
        <span className={styles.xmlCount}>
          {ofxItems.filter((item) => item.selected).length} de {ofxItems.length} movimentos selecionados
          {duplicateCount > 0 ? ' - ' + duplicateCount + ' já importado(s)' : ''}
        </span>
        <button className={styles.xmlToggleAll} onClick={toggleAll}>
          {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
        </button>
      </div>
      <div className={styles.xmlList}>
        {ofxItems.map((item) => {
          const groups = item.type === 'revenue' ? groupedRevenueCategories : groupedCostCategories;
          const disabled = !item.selected || item.decision === 'duplicate' || item.decision === 'ambiguous';
          return (
            <div key={item.id} className={styles.xmlRow + ' ' + (disabled ? styles.xmlRowDisabled : '')}>
              <input
                type="checkbox"
                checked={item.selected}
                disabled={item.decision === 'duplicate' || item.decision === 'ambiguous'}
                onChange={(event) =>
                  setOfxItems((items) =>
                    items.map((current) =>
                      current.id === item.id ? { ...current, selected: event.target.checked } : current,
                    ),
                  )
                }
              />
              <span className={styles.ofxType + ' ' + (item.type === 'revenue' ? styles.ofxCredit : styles.ofxDebit)}>
                {item.type === 'revenue' ? 'Entrada' : 'Saída'}
              </span>
              <div className={styles.xmlInfo}>
                <span className={styles.xmlName}>{item.description}</span>
                <span className={styles.xmlDetails}>
                  {safeFormatDate(item.date)} - <strong>{formatBRL(item.amount)}</strong> -{' '}
                  {decisionLabel(item.decision)}
                </span>
              </div>
              <select
                className={styles.xmlCatSelect}
                value={item.category}
                disabled={item.decision !== 'create_unclassified'}
                onChange={(event) =>
                  setOfxItems((items) =>
                    items.map((current) =>
                      current.id === item.id ? { ...current, category: event.target.value } : current,
                    ),
                  )
                }
              >
                <option value="">Categoria...</option>
                <option value="outro">Outros</option>
                {groups
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
          );
        })}
      </div>
      <div className={styles.ofxTotals}>
        <span>
          Entradas <strong className={styles.green}>{formatBRL(selectedRevenue)}</strong>
        </span>
        <span>
          Saídas <strong className={styles.red}>{formatBRL(selectedCosts)}</strong>
        </span>
      </div>
    </>
  );
}
