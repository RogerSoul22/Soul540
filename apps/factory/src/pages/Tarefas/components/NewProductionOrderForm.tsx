import { Button, Input, Select } from '../../../../../../packages/pentagono/src/index';
import { useEffect, useMemo, useState } from 'react';
import styles from '../styles/Tarefas.module.scss';
import { formatQty, uid } from '../support/task-formatters';
import OrderItemsFields from './OrderItemsFields';
import type { AvailableEvent, Ingredient, Insumo, Pedido } from '../types/task-types';

type Props = {
  onSave: (pedido: Pedido) => Promise<void> | void;
  ingredients: Ingredient[];
  insumos: Insumo[];
  events: AvailableEvent[];
};
type OrderItem = { id: string; nome: string; measure: string; quantidade: number };

export default function NewProductionOrderForm({ onSave, ingredients, insumos, events }: Props) {
  const [filial, setFilial] = useState('');
  const [itens, setItens] = useState<OrderItem[]>([]);
  const [itemKey, setItemKey] = useState('');
  const [itemQtd, setItemQtd] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState('');
  const allItems = useMemo(
    () => [
      ...ingredients
        .filter((item) => item.name.trim())
        .map((item) => ({
          key: `ing:${item.id}`,
          id: item.id,
          name: item.name,
          measure: item.measure,
          cost: item.cost,
        })),
      ...insumos
        .filter((item) => item.name.trim())
        .map((item) => ({
          key: `ins:${item.id}`,
          id: item.id,
          name: item.name,
          measure: item.measure,
          cost: item.cost,
        })),
    ],
    [ingredients, insumos],
  );
  const costMap = useMemo(
    () =>
      new Map([
        ...ingredients.map((item) => [item.id, item.cost] as [string, number]),
        ...insumos.map((item) => [item.id, item.cost] as [string, number]),
      ]),
    [ingredients, insumos],
  );
  useEffect(() => {
    if (!allItems.length) {
      setItemKey('');
      return;
    }
    setItemKey((current) => (allItems.some((item) => item.key === current) ? current : allItems[0].key));
  }, [allItems]);
  const addItem = () => {
    const selected = allItems.find((item) => item.key === itemKey);
    if (!selected || itemQtd <= 0) return;
    setItens((current) => {
      const existing = current.find((item) => item.id === selected.id);
      return existing
        ? current.map((item) => (item.id === selected.id ? { ...item, quantidade: item.quantidade + itemQtd } : item))
        : [
            ...current,
            {
              id: selected.id,
              nome: selected.name,
              measure: selected.measure,
              quantidade: itemQtd,
            },
          ];
    });
    setItemQtd(1);
  };
  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    const event = events.find((item) => item.id === eventId);
    if (event?.city) setFilial(event.city);
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!filial.trim() || !itens.length) return;
    const orderIngredients = itens.map((item) => ({
      id: item.id,
      name: item.nome,
      measure: item.measure,
      neededQty: item.quantidade,
      neededCost: item.quantidade * (costMap.get(item.id) || 0),
    }));
    await onSave({
      id: uid(),
      filial: filial.trim(),
      itens,
      ingredients: orderIngredients,
      totalCost: orderIngredients.reduce((sum, item) => sum + item.neededCost, 0),
      ...(selectedEventId
        ? {
            eventId: selectedEventId,
            eventSource: events.find((item) => item.id === selectedEventId)?.source,
          }
        : {}),
      status: 'a_preparar',
    });
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <Select
          label="Evento vinculado"
          value={selectedEventId}
          onChange={(event) => handleEventChange(event.target.value)}
        >
          <option value="">Pedido avulso (sem evento)</option>
          {events.map((event) => (
            <option key={`${event.source}:${event.id}`} value={event.id}>
              {event.date} - {event.name}
              {event.city ? ` (${event.city})` : ''}
            </option>
          ))}
        </Select>
      </div>
      <div className={styles.formGroup}>
        <Input
          label="Filial"
          value={filial}
          onChange={(event) => setFilial(event.target.value)}
          placeholder="Nome da filial"
          required
        />
      </div>
      <OrderItemsFields
        allItems={allItems}
        ingredients={ingredients}
        insumos={insumos}
        itemKey={itemKey}
        itemQtd={itemQtd}
        setItemKey={setItemKey}
        setItemQtd={setItemQtd}
        addItem={addItem}
        itens={itens}
        removeItem={(index) => setItens((current) => current.filter((_, itemIndex) => itemIndex !== index))}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="primary" type="submit" disabled={!filial.trim() || !itens.length || !allItems.length}>
          Criar Pedido
        </Button>
      </div>
    </form>
  );
}
