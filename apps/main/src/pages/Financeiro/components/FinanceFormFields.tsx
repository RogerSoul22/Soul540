import { Button, Input, Label, Select } from '../../../../../../packages/pentagono/src/index';
import { formatCurrencyInput as formatCurrency } from '../../../../../../packages/domain/src/index';
import type { FinanceType } from '../../../../../../packages/contracts/src/index';
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
          <Select
            label="Tipo"
            value={formType}
            onChange={(event) => {
              setFormType(event.target.value as FinanceType);
              setFormCategory('');
            }}
          >
            <option value="revenue">Receita</option>
            <option value="cost">Custo</option>
          </Select>
        </div>
        <FinanceEventField controller={controller} />
        <div className={styles.formField}>
          <Select
            label="Modalidade"
            value={formModality}
            onChange={(event) => setFormModality(event.target.value as typeof formModality)}
          >
            <option value="evento_avulso">Evento</option>
            <option value="feirinha">Feirinha semanal</option>
          </Select>
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <Label htmlFor="main-finance-category" className={styles.formLabel}>
            Categoria
            <Button
              variant="dashed"
              type="button"
              className={styles.btnAddCategory}
              onClick={() => {
                setNewCategorySection(formType === 'revenue' ? 'faturamentos' : 'despesas-administrativas');
                setShowCategoryModal(true);
              }}
              title="Criar nova categoria"
            >
              + Nova categoria
            </Button>
          </Label>
          <Select
            id="main-finance-category"
            className={styles.formSelect}
            searchable
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
          </Select>
        </div>
        <div className={styles.formField}>
          <Input
            label="Valor (R$)"
            type="text"
            value={formAmount}
            onChange={(event) => setFormAmount(formatCurrency(event.target.value))}
            placeholder="R$ 0,00"
            required
          />
        </div>
      </div>

      <div className={styles.formField}>
        <Input
          label="Descrição"
          type="text"
          value={formDescription}
          onChange={(event) => setFormDescription(event.target.value)}
          placeholder="Descreva o lançamento"
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <Input
            label="Data"
            type="date"
            nativeDate
            value={formDate}
            onChange={(event) => setFormDate(event.target.value)}
            required
          />
        </div>
        <div className={styles.formField}>
          <Label className={styles.formLabel}>Status</Label>
          <p className={styles.formHint}>Pendente. Registre a liquidação na lista de lançamentos.</p>
        </div>
      </div>

      <div className={styles.formField}>
        <Select
          label="Forma de pagamento"
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
        </Select>
      </div>
    </>
  );
}
