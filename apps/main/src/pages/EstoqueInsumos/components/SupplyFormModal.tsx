import { Button, Input, Label, Modal, Select } from '../../../../../../packages/pentagono/src/index';
import type { SuppliesController } from '../hooks/use-supplies-controller';
import { formatCurrency } from '../types/supply-types';
import styles from '../styles/EstoqueInsumos.module.scss';

export default function SupplyFormModal({ controller }: { controller: SuppliesController }) {
  const { showModal, editingId, form, categories, setForm, closeModal, saveSupply } = controller;
  if (!showModal) return null;
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  return (
    <Modal title={editingId ? 'Editar insumo' : 'Novo insumo'} onClose={closeModal} closeOnOverlay maxWidth={520} flush>
      <div className={styles.form}>
        <Label className={styles.label}>
          Nome
          <Input className={styles.input} value={form.name} onChange={(event) => update('name', event.target.value)} />
        </Label>
        <Label className={styles.label}>
          Categoria
          <Select
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
          </Select>
        </Label>
        <div className={styles.formRow}>
          <Label className={styles.label}>
            Unidade
            <Select
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
            </Select>
          </Label>
          <Label className={styles.label}>
            Quantidade
            <Input
              className={styles.input}
              type="number"
              value={form.quantity}
              onChange={(event) => update('quantity', event.target.value)}
            />
          </Label>
          <Label className={styles.label}>
            Estoque mínimo
            <Input
              className={styles.input}
              type="number"
              value={form.minStock}
              onChange={(event) => update('minStock', event.target.value)}
            />
          </Label>
        </div>
        <div className={styles.formRow}>
          <Label className={styles.label}>
            Custo unitário
            <Input
              className={styles.input}
              value={form.costPerUnit}
              onChange={(event) => update('costPerUnit', formatCurrency(event.target.value))}
              placeholder="R$ 0,00"
            />
          </Label>
          <Label className={styles.label}>
            Validade
            <Input
              className={styles.input}
              type="date"
              value={form.expirationDate}
              onChange={(event) => update('expirationDate', event.target.value)}
            />
          </Label>
        </div>
        <Label className={styles.label}>
          Fornecedor
          <Input
            className={styles.input}
            value={form.supplier}
            onChange={(event) => update('supplier', event.target.value)}
          />
        </Label>
      </div>
      <div className={styles.formActions}>
        <Button variant="ghost" onClick={closeModal}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={saveSupply} disabled={!form.name.trim()}>
          Salvar
        </Button>
      </div>
    </Modal>
  );
}
