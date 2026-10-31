import { formatCurrencyInput as formatCurrency } from '@soul540/domain';
import type { FinanceType } from '@soul540/contracts';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import FinanceEventField from './FinanceEventField';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceFormFields({ controller }: { controller: FinanceiroController }) {
  const {
    formType,
    formModality,
    setFormModality,
    setFormType,
    formCategory,
    setFormCategory,
    formAmount,
    setFormAmount,
    formDescription,
    setFormDescription,
    formDate,
    setFormDate,
    formPaymentMethod,
    setFormPaymentMethod,
    groupedFormCategories,
    setNewCategorySection,
    setShowCategoryModal,
  } = controller;

  return (
    <>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Tipo</label>
          <select
            className={styles.formSelect}
            value={formType}
            onChange={(event) => {
              setFormType(event.target.value as FinanceType);
              setFormCategory('');
            }}
          >
            <option value="revenue">Receita</option>
            <option value="cost">Custo</option>
          </select>
        </div>
        <FinanceEventField controller={controller} />
        <div className={styles.formField}>
          <label className={styles.formLabel}>Modalidade</label>
          <select
            className={styles.formSelect}
            value={formModality}
            onChange={(event) => setFormModality(event.target.value as typeof formModality)}
          >
            <option value="evento_avulso">Evento avulso</option>
            <option value="feirinha">Feirinha semanal</option>
          </select>
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>
            Categoria
            <button
              type="button"
              className={styles.btnAddCategory}
              onClick={() => {
                setNewCategorySection(formType === 'revenue' ? 'faturamentos' : 'despesas-administrativas');
                setShowCategoryModal(true);
              }}
              title="Criar nova categoria"
            >
              + Nova categoria
            </button>
          </label>
          <select
            className={styles.formSelect}
            value={formCategory}
            onChange={(event) => setFormCategory(event.target.value)}
            required
          >
            <option value="">Selecione...</option>
            {groupedFormCategories
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
        <div className={styles.formField}>
          <label className={styles.formLabel}>Valor (R$)</label>
          <input
            type="text"
            className={styles.formInput}
            value={formAmount}
            onChange={(event) => setFormAmount(formatCurrency(event.target.value))}
            placeholder="R$ 0,00"
            required
          />
        </div>
      </div>

      <div className={styles.formField}>
        <label className={styles.formLabel}>Descrição</label>
        <input
          type="text"
          className={styles.formInput}
          value={formDescription}
          onChange={(event) => setFormDescription(event.target.value)}
          placeholder="Descreva o lançamento"
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Data</label>
          <input
            type="date"
            className={styles.formInput}
            value={formDate}
            onChange={(event) => setFormDate(event.target.value)}
            required
          />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Status</label>
          <p className={styles.formHint}>Pendente. Registre a liquidação na lista de lançamentos.</p>
        </div>
      </div>

      <div className={styles.formField}>
        <label className={styles.formLabel}>Forma de pagamento</label>
        <select
          className={styles.formSelect}
          value={formPaymentMethod}
          onChange={(event) => setFormPaymentMethod(event.target.value)}
        >
          <option value="">Não informado</option>
          <option value="pix">Pix</option>
          <option value="money">Dinheiro</option>
          <option value="debit">Cartão de débito</option>
          <option value="credit">Cartão de crédito</option>
          <option value="transfer">Transferência</option>
          <option value="other">Outro</option>
        </select>
      </div>
    </>
  );
}
