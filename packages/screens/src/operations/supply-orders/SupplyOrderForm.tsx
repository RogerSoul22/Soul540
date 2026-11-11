import { useState } from 'react';
import type { CreateSupplyOrderInput } from '@soul540/contracts';
import { Button, Card, Input, Select, Textarea } from '../../../../pentagono/src';
import type { FactorySupplyOption } from './use-supply-orders';
import styles from './SupplyOrdersScreen.module.scss';

type Props = {
  catalog: FactorySupplyOption[];
  saving: boolean;
  onSubmit(input: CreateSupplyOrderInput): Promise<void>;
};
export default function SupplyOrderForm({ catalog, saving, onSubmit }: Props) {
  const [selected, setSelected] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<CreateSupplyOrderInput['items']>([]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await onSubmit({ items, note: note.trim() || undefined });
    setItems([]);
    setNote('');
  }
  function addItem() {
    if (!selected || Number(quantity) <= 0 || items.some((item) => item.factorySupplyId === selected)) return;
    setItems([...items, { factorySupplyId: selected, quantity: Number(quantity) }]);
    setSelected('');
    setQuantity('1');
  }
  return (
    <Card className={styles.formCard}>
      <form onSubmit={submit} className={styles.form}>
        <div className={styles.formHeader}>
          <div>
            <span className={styles.stepLabel}>NOVO PEDIDO</span>
            <h2>Novo pedido de insumos</h2>
            <p>Escolha os itens e as quantidades que sua unidade precisa.</p>
          </div>
          <span className={styles.itemCount}>{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
        </div>
        <div className={styles.formGrid}>
          <Select
            label="Insumo da Fábrica"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            required
          >
            <option value="">Selecione um insumo</option>
            {catalog.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.measureUnit}) — disponível: {item.availableQuantity}
              </option>
            ))}
          </Select>
          <Input
            label="Quantidade"
            type="number"
            min="0.001"
            step="any"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
          <Button type="button" variant="secondary" className={styles.addButton} onClick={addItem}>
            Adicionar
          </Button>
        </div>
        {!!items.length && (
          <ul className={styles.itemList} aria-label="Itens do pedido">
            {items.map((item) => {
              const supply = catalog.find((option) => option.id === item.factorySupplyId);
              return (
                <li className={styles.itemRow} key={item.factorySupplyId}>
                  <span className={styles.itemName}>{supply?.name}</span>
                  <span className={styles.itemQuantity}>
                    {item.quantity} {supply?.measureUnit}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={styles.removeButton}
                    aria-label={`Remover ${supply?.name ?? 'insumo'} do pedido`}
                    onClick={() =>
                      setItems((current) => current.filter((line) => line.factorySupplyId !== item.factorySupplyId))
                    }
                  >
                    Remover
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
        <Textarea
          label="Observação (opcional)"
          rows={3}
          className={styles.noteField}
          placeholder="Inclua um detalhe importante para a separação ou entrega."
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <div className={styles.formFooter}>
          <span>Você poderá acompanhar o status do pedido nesta página.</span>
          <Button type="submit" disabled={!items.length || saving} loading={saving}>
            Enviar pedido
          </Button>
        </div>
      </form>
    </Card>
  );
}
