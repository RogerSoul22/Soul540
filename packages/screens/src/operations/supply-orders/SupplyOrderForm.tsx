import { useState } from 'react';
import type { CreateSupplyOrderInput } from '@soul540/contracts';
import { Button, Card, Input, Select, Textarea } from '../../../../pentagono/src';
import type { FactorySupplyOption } from './use-supply-orders';

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
    <Card>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Novo pedido de insumos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8, alignItems: 'end' }}>
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
          <Button type="button" variant="secondary" onClick={addItem}>
            Adicionar
          </Button>
        </div>
        {!!items.length && (
          <ul style={{ margin: 0 }}>
            {items.map((item) => {
              const supply = catalog.find((option) => option.id === item.factorySupplyId);
              return (
                <li key={item.factorySupplyId}>
                  {supply?.name}: {item.quantity} {supply?.measureUnit}{' '}
                  <button
                    type="button"
                    onClick={() => setItems(items.filter((line) => line.factorySupplyId !== item.factorySupplyId))}
                  >
                    Remover
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <Textarea label="Observação (opcional)" value={note} onChange={(event) => setNote(event.target.value)} />
        <Button type="submit" disabled={!items.length || saving} loading={saving}>
          Enviar pedido
        </Button>
      </form>
    </Card>
  );
}
