import type { SuppliesController } from '../hooks/use-supplies-controller';
import { formatCurrency } from '../types/supply-types';
import styles from '../styles/EstoqueInsumos.module.scss';

export default function SupplyFormModal({ controller }: { controller: SuppliesController }) {
  const { showModal, editingId, form, categories, setForm, closeModal, saveSupply } = controller;
  if (!showModal) return null;
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{editingId ? 'Editar insumo' : 'Novo insumo'}</h2>
          <button className={styles.modalClose} onClick={closeModal}>
            ×
          </button>
        </div>
        <div className={styles.form}>
          <label className={styles.label}>
            Nome
            <input
              className={styles.input}
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
            />
          </label>
          <label className={styles.label}>
            Categoria
            <select
              className={styles.input}
              value={form.category}
              onChange={(event) => update('category', event.target.value)}
            >
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.formRow}>
            <label className={styles.label}>
              Unidade
              <select
                className={styles.input}
                value={form.measureUnit}
                onChange={(event) => update('measureUnit', event.target.value)}
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
                <option value="un">un</option>
                <option value="cx">cx</option>
              </select>
            </label>
            <label className={styles.label}>
              Quantidade
              <input
                className={styles.input}
                type="number"
                value={form.quantity}
                onChange={(event) => update('quantity', event.target.value)}
              />
            </label>
            <label className={styles.label}>
              Estoque mínimo
              <input
                className={styles.input}
                type="number"
                value={form.minStock}
                onChange={(event) => update('minStock', event.target.value)}
              />
            </label>
          </div>
          <div className={styles.formRow}>
            <label className={styles.label}>
              Custo unitário
              <input
                className={styles.input}
                value={form.costPerUnit}
                onChange={(event) => update('costPerUnit', formatCurrency(event.target.value))}
                placeholder="R$ 0,00"
              />
            </label>
            <label className={styles.label}>
              Validade
              <input
                className={styles.input}
                type="date"
                value={form.expirationDate}
                onChange={(event) => update('expirationDate', event.target.value)}
              />
            </label>
          </div>
          <label className={styles.label}>
            Fornecedor
            <input
              className={styles.input}
              value={form.supplier}
              onChange={(event) => update('supplier', event.target.value)}
            />
          </label>
        </div>
        <div className={styles.formActions}>
          <button className={styles.btnCancel} onClick={closeModal}>
            Cancelar
          </button>
          <button className={styles.btnPrimary} onClick={saveSupply} disabled={!form.name.trim()}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
