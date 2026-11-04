import { Button, Input, Label, Select } from '../../../../../../packages/pentagono/src/index';
import type { FinanceType } from '../types/finance-controller-types';
import type { FranchiseFinanceController } from '../types/finance-controller-types';
import FinanceEventSelector from './FinanceEventSelector';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceFormFields({ controller }: { controller: FranchiseFinanceController }) {
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
        <div className={styles.formField}>
          <Label className={styles.formLabel}>Evento</Label>
          <FinanceEventSelector controller={controller} />
        </div>
        <div className={styles.formField}>
          <Select
            label="Modalidade"
            value={formModality}
            onChange={(event) => setFormModality(event.target.value as typeof formModality)}
          >
            <option value="evento_avulso">Evento avulso</option>
            <option value="feirinha">Feirinha semanal</option>
          </Select>
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <Label className={styles.formLabel}>
            Categoria
            <Button
              variant="dashed"
              type="button"
              className={styles.btnAddCategory}
              onClick={() => {
                setNewCategorySection(formType === 'revenue' ? 'faturamentos' : 'despesas-administrativas');
                setShowCategoryModal(true);
              }}
            >
              + Nova categoria
            </Button>
          </Label>
          <Select
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
            onChange={(event) => setFormAmount(controller.formatCurrency(event.target.value))}
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
            value={formDate}
            onChange={(event) => setFormDate(event.target.value)}
            required
          />
        </div>
        <div className={styles.formField}>
          <Select
            label="Status"
            value={formStatus}
            onChange={(event) => setFormStatus(event.target.value as typeof formStatus)}
          >
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
          </Select>
        </div>
      </div>
      <div className={styles.formField}>
        <Select
          label="Forma de pagamento"
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
        </Select>
      </div>
    </>
  );
}
