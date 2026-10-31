import type { FinanceType } from '../types/finance-controller-types';
import type { FactoryFinanceController } from '../types/finance-controller-types';
import FinanceEventSelector from './FinanceEventSelector';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceFormFields({ controller }: { controller: FactoryFinanceController }) {
  const {
    formType,
    setFormType,
    formCategory,
    setFormCategory,
    formAmount,
    setFormAmount,
    formDescription,
    setFormDescription,
    formDate,
    setFormDate,
    formStatus,
    setFormStatus,
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
        <div className={styles.formField}>
          <label className={styles.formLabel}>Evento</label>
          <FinanceEventSelector controller={controller} />
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
            onChange={(event) => setFormAmount(controller.formatCurrency(event.target.value))}
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
          <select
            className={styles.formSelect}
            value={formStatus}
            onChange={(event) => setFormStatus(event.target.value as typeof formStatus)}
          >
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
          </select>
        </div>
      </div>
      <div className={styles.formField}>
        <label className={styles.formLabel}>Forma de pagamento</label>
        <select
          className={styles.formSelect}
          value={formPaymentMethod}
          onChange={(event) => setFormPaymentMethod(event.target.value)}
        >
          <option value="">Não informada</option>
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
