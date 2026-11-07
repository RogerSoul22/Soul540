import { Input, Select } from '../../../../../../packages/pentagono/src/index';
import type { EventFormController } from '../types/event-form-controller';
import styles from '../styles/Eventos.module.scss';

export default function EventFormFinance({ controller }: { controller: EventFormController }) {
  const { form, setForm, formatBudget, formSupplyForecast } = controller;
  return (
    <>
      {/* — Financeiro — */}
      <div className={styles.formSection}>
        <p className={styles.formSectionTitle}>Financeiro</p>
        <div className={styles.formGrid2}>
          <div className={styles.formGroup}>
            <Input
              label="Valor Estimado (R$)"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: formatBudget(e.target.value) })}
              placeholder="R$ 0,00"
            />
          </div>
          <div className={styles.formGroup}>
            <Input
              label="Deslocamento (R$)"
              value={form.travelCost}
              onChange={(e) => setForm({ ...form, travelCost: formatBudget(e.target.value) })}
              placeholder="R$ 0,00"
            />
          </div>
        </div>
        <div className={styles.formGrid2}>
          <div className={styles.formGroup}>
            <Input
              label="Valor Final (R$)"
              value={form.finalValue}
              onChange={(e) => setForm({ ...form, finalValue: formatBudget(e.target.value) })}
              placeholder="R$ 0,00"
            />
          </div>
          <div className={styles.formGroup}>
            <Input
              label="Sinal Recebido (R$)"
              value={form.depositValue}
              onChange={(e) => setForm({ ...form, depositValue: formatBudget(e.target.value) })}
              placeholder="R$ 0,00"
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <Input
            label="Data do Sinal"
            type="date"
            value={form.depositDate}
            onChange={(e) => setForm({ ...form, depositDate: e.target.value })}
          />
        </div>
        <div className={styles.formGrid2}>
          <div className={styles.formGroup}>
            <Select
              label="Forma de Pagamento"
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            >
              <option value="">Selecionar</option>
              <option value="pix_parcelado">Pix — 30% na reserva e restante até o dia</option>
              <option value="cartao">Cartão — até 2x sem juros na reserva</option>
              <option value="pix_total">Pix — valor total</option>
              <option value="outro">Outro</option>
            </Select>
          </div>
          <div className={styles.formGroup}>
            <Input
              label="Chave PIX"
              value={form.pixKey}
              onChange={(e) => setForm({ ...form, pixKey: e.target.value })}
              placeholder="CPF, e-mail, celular ou chave aleatória"
            />
          </div>
        </div>
      </div>

      {/* — Pizzas — */}
      <div className={styles.formSection}>
        <p className={styles.formSectionTitle}>Pizzas</p>
        <div className={styles.formGrid2}>
          <div className={styles.formGroup}>
            <Input
              label="Estimado (pizzas)"
              type="number"
              value={form.estimatedPizzas}
              onChange={(e) => setForm({ ...form, estimatedPizzas: e.target.value })}
              placeholder="0"
              min="0"
            />
          </div>
          <div className={styles.formGroup}>
            <Input
              label="Realizado (pizzas)"
              type="number"
              value={form.actualPizzas}
              onChange={(e) => setForm({ ...form, actualPizzas: e.target.value })}
              placeholder="0"
              min="0"
            />
          </div>
        </div>
        <div className={styles.forecastBox}>
          <span>{formSupplyForecast.pizzas} pizzas previstas</span>
          <span>{formSupplyForecast.flourKg} kg farinha</span>
          <span>{formSupplyForecast.sauceKg} kg molho</span>
          <span>{formSupplyForecast.cheeseKg} kg queijo</span>
        </div>
      </div>
    </>
  );
}
