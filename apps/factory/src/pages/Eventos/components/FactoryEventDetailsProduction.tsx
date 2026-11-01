import { Button, Input, Select, Textarea } from '../../../../../../packages/pentagono/src/index';
import type { FactoryEventController } from '../hooks/use-factory-event-controller';
import styles from '../styles/Eventos.module.scss';

export default function FactoryEventDetailsProduction({ controller }: { controller: FactoryEventController }) {
  const { productionForecast, productionForm, setProductionForm, saveProduction } = controller;
  const event = controller.viewingEvent;
  if (!event) return null;
  return (
    <>
      {productionForecast && (
        <div className={styles.detailSection}>
          <p className={styles.detailSectionTitle}>Producao da fabrica</p>
          <div className={styles.productionNotice}>
            Dados comerciais em somente leitura. A fabrica altera apenas os campos operacionais abaixo.
          </div>
          <div className={styles.forecastBox}>
            <span>{productionForecast.pizzas} pizzas previstas</span>
            <span>{productionForecast.flourKg} kg farinha</span>
            <span>{productionForecast.sauceKg} kg molho</span>
            <span>{productionForecast.cheeseKg} kg queijo</span>
          </div>
          <div className={styles.productionGrid}>
            <div>
              <span className={styles.detailLabel}>Status</span>
              <Select
                className={styles.input}
                value={productionForm.factoryProductionStatus}
                onChange={(e) =>
                  setProductionForm((prev) => ({
                    ...prev,
                    factoryProductionStatus: e.target.value,
                  }))
                }
              >
                <option value="pending">Pendente</option>
                <option value="preparing">Em preparo</option>
                <option value="ready">Pronto</option>
                <option value="delivered">Entregue</option>
              </Select>
            </div>
            <div>
              <span className={styles.detailLabel}>Massas</span>
              <Input
                className={styles.input}
                type="number"
                value={productionForm.factoryDoughBalls}
                onChange={(e) => setProductionForm((prev) => ({ ...prev, factoryDoughBalls: e.target.value }))}
              />
            </div>
            <div>
              <span className={styles.detailLabel}>Molho (kg)</span>
              <Input
                className={styles.input}
                type="number"
                value={productionForm.factorySauceKg}
                onChange={(e) => setProductionForm((prev) => ({ ...prev, factorySauceKg: e.target.value }))}
              />
            </div>
            <div>
              <span className={styles.detailLabel}>Queijo (kg)</span>
              <Input
                className={styles.input}
                type="number"
                value={productionForm.factoryCheeseKg}
                onChange={(e) => setProductionForm((prev) => ({ ...prev, factoryCheeseKg: e.target.value }))}
              />
            </div>
            <div>
              <span className={styles.detailLabel}>Embalagens</span>
              <Input
                className={styles.input}
                type="number"
                value={productionForm.factoryPackagingUnits}
                onChange={(e) => setProductionForm((prev) => ({ ...prev, factoryPackagingUnits: e.target.value }))}
              />
            </div>
            <div>
              <span className={styles.detailLabel}>Realizado (pizzas)</span>
              <Input
                className={styles.input}
                type="number"
                value={productionForm.actualPizzas}
                onChange={(e) => setProductionForm((prev) => ({ ...prev, actualPizzas: e.target.value }))}
              />
            </div>
          </div>
          <Textarea
            className={styles.textarea}
            value={productionForm.factoryProductionNotes}
            onChange={(e) => setProductionForm((prev) => ({ ...prev, factoryProductionNotes: e.target.value }))}
            placeholder="Observações internas da produção"
          />
          <Button variant="primary" type="button" onClick={saveProduction}>
            Salvar produção
          </Button>
        </div>
      )}
    </>
  );
}
