import { useState, useEffect, useMemo, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import styles from './Tarefas.module.scss';

type Ingredient = {
  id: string;
  name: string;
  measure: string;
  quantity: number; // per kg of dough
  cost: number;     // cost per unit of measure
};

type PizzaSize = {
  id: string;
  diameter: number;
  gramsPerPizza: number;
};

type PedidoIngredient = {
  id: string;
  name: string;
  measure: string;
  neededQty: number;
  neededCost: number;
};

type Recipe = {
  ingredients: Ingredient[];
  sizes: PizzaSize[];
};

const MEASURES = ['kg', 'g', 'L', 'ml', 'un', 'cx'];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function formatR$(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatQty(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

type PedidoStatus = 'a_preparar' | 'a_enviar' | 'entregue';
type Pedido = {
  id: string;
  filial: string;
  itens: Array<{ id: string; nome: string; measure: string; quantidade: number }>;
  pizzaSize: PizzaSize;
  ingredients: PedidoIngredient[];
  totalCost: number;
  status: PedidoStatus;
};

// Formulário para criar novo pedido
function NovoPedidoForm({
  onSave,
  sizes,
  ingredients,
}: {
  onSave: (pedido: Pedido) => Promise<void> | void;
  sizes: PizzaSize[];
  ingredients: Ingredient[];
}) {
  const [filial, setFilial] = useState('');
  const [itens, setItens] = useState<Array<{ id: string; nome: string; measure: string; quantidade: number }>>([]);
  const [itemIngredientId, setItemIngredientId] = useState('');
  const [itemQtd, setItemQtd] = useState(1);
  const [sizeId, setSizeId] = useState(sizes[0]?.id || '');
  const availableIngredients = ingredients.filter(ingredient => ingredient.name.trim());

  useEffect(() => {
    if (!sizes.length) {
      setSizeId('');
      return;
    }
    setSizeId(current => (sizes.some(size => size.id === current) ? current : sizes[0].id));
  }, [sizes]);

  useEffect(() => {
    if (!availableIngredients.length) {
      setItemIngredientId('');
      return;
    }
    setItemIngredientId(current => (availableIngredients.some(ingredient => ingredient.id === current) ? current : availableIngredients[0].id));
  }, [availableIngredients]);

  const addItem = () => {
    const selectedIngredient = availableIngredients.find(ingredient => ingredient.id === itemIngredientId);
    if (!selectedIngredient || itemQtd <= 0) return;

    setItens(prev => {
      const existing = prev.find(item => item.id === selectedIngredient.id);
      if (existing) {
        return prev.map(item =>
          item.id === selectedIngredient.id
            ? { ...item, quantidade: item.quantidade + itemQtd }
            : item,
        );
      }

      return [
        ...prev,
        {
          id: selectedIngredient.id,
          nome: selectedIngredient.name,
          measure: selectedIngredient.measure,
          quantidade: itemQtd,
        },
      ];
    });
    setItemQtd(1);
  };
  const removeItem = (idx: number) => setItens(prev => prev.filter((_, i) => i !== idx));
  const selectedSize = sizes.find(size => size.id === sizeId);

  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        if (!filial.trim() || itens.length === 0 || !selectedSize) return;

        const pedidoIngredients = itens.map(item => {
          const ingredient = ingredients.find(recipeIngredient => recipeIngredient.id === item.id);
          const unitCost = ingredient?.cost || 0;
          return {
            id: item.id,
            name: item.nome,
            measure: item.measure,
            neededQty: item.quantidade,
            neededCost: item.quantidade * unitCost,
          };
        });
        const totalCost = pedidoIngredients.reduce((sum, ingredient) => sum + ingredient.neededCost, 0);

        await onSave({
          id: uid(),
          filial: filial.trim(),
          itens,
          pizzaSize: { ...selectedSize },
          ingredients: pedidoIngredients,
          totalCost,
          status: 'a_preparar',
        });
      }}
    >
      <div className={styles.formGroup}>
        <label className={styles.label}>Filial</label>
        <input className={styles.input} value={filial} onChange={e => setFilial(e.target.value)} placeholder="Nome da filial" required />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Tamanho da pizza</label>
        <select className={styles.input} value={sizeId} onChange={e => setSizeId(e.target.value)} required>
          {sizes.length === 0 ? (
            <option value="">Cadastre um tamanho antes de criar o pedido</option>
          ) : (
            sizes.map(size => (
              <option key={size.id} value={size.id}>
                {size.diameter}cm ({size.gramsPerPizza}g)
              </option>
            ))
          )}
        </select>
      </div>

      <div className={styles.formGroup}>
        <div className={styles.label}>Itens do pedido</div>
        <div className={styles.formGrid2}>
          <div>
            <select className={styles.input} value={itemIngredientId} onChange={e => setItemIngredientId(e.target.value)} disabled={availableIngredients.length === 0}>
              {availableIngredients.length === 0 ? (
                <option value="">Cadastre ingredientes antes de criar o pedido</option>
              ) : (
                availableIngredients.map(ingredient => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.name} ({ingredient.measure})
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <input className={styles.input} type="number" min={1} value={itemQtd} onChange={e => setItemQtd(Number(e.target.value) || 1)} />
          </div>
          <div>
            <button type="button" className={styles.btnPrimary} onClick={addItem} disabled={!itemIngredientId || availableIngredients.length === 0}>Adicionar</button>
          </div>
        </div>

        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {itens.map((item, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-primary, #fff)' }}>{item.nome} <small style={{ color: 'var(--accent, #7dd3fc)' }}>{formatQty(item.quantidade)} {item.measure}</small></span>
              <button type="button" className={styles.btnDelete} onClick={() => removeItem(idx)}>Remover</button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <button type="submit" className={styles.btnPrimary} disabled={!filial.trim() || itens.length === 0 || !selectedSize || availableIngredients.length === 0}>Criar Pedido</button>
      </div>
    </form>
  );
}

export default function Producao() {
  const { events } = useApp();
  const [recipe, setRecipe] = useState<Recipe>({ ingredients: [], sizes: [] });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculator state
  const [calcSizeId, setCalcSizeId] = useState('');
  const [calcMode, setCalcMode] = useState<'pizzas' | 'pessoas'>('pizzas');
  const [calcQty, setCalcQty] = useState('');
  const [calcRatio, setCalcRatio] = useState('1.5');
  const [calcEventId, setCalcEventId] = useState('');
  const [showPrint, setShowPrint] = useState(false);

  // Pedidos (Kanban)
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [showNovoPedido, setShowNovoPedido] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/production-recipes').then(r => r.json() as Promise<Recipe>),
      apiFetch('/api/production-orders').then(r => r.json() as Promise<Pedido[]>),
    ])
      .then(([recipeData, pedidosData]) => {
        setRecipe(recipeData);
        setPedidos(pedidosData);
        if (recipeData.sizes?.length) setCalcSizeId(recipeData.sizes[0].id);
      })
      .catch(() => {});
  }, []);

  const scheduleSave = (newRecipe: Recipe) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaved(false);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await apiFetch('/api/production-recipes', {
          method: 'PUT',
          body: JSON.stringify({ ingredients: newRecipe.ingredients, sizes: newRecipe.sizes }),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } finally {
        setSaving(false);
      }
    }, 800);
  };

  const updateRecipe = (updated: Recipe) => {
    setRecipe(updated);
    scheduleSave(updated);
  };

  // Ingredient CRUD
  const addIngredient = () => {
    const updated = { ...recipe, ingredients: [...recipe.ingredients, { id: uid(), name: '', measure: 'kg', quantity: 0, cost: 0 }] };
    updateRecipe(updated);
  };
  const updateIngredient = (id: string, field: keyof Ingredient, value: string | number) => {
    const updated = { ...recipe, ingredients: recipe.ingredients.map(i => i.id === id ? { ...i, [field]: value } : i) };
    updateRecipe(updated);
  };
  const removeIngredient = (id: string) => {
    const updated = { ...recipe, ingredients: recipe.ingredients.filter(i => i.id !== id) };
    updateRecipe(updated);
  };

  // Size CRUD
  const addSize = () => {
    const updated = { ...recipe, sizes: [...recipe.sizes, { id: uid(), diameter: 25, gramsPerPizza: 180 }] };
    updateRecipe(updated);
    if (!calcSizeId) setCalcSizeId(updated.sizes[updated.sizes.length - 1].id);
  };
  const updateSize = (id: string, field: keyof PizzaSize, value: number) => {
    const updated = { ...recipe, sizes: recipe.sizes.map(s => s.id === id ? { ...s, [field]: value } : s) };
    updateRecipe(updated);
  };
  const removeSize = (id: string) => {
    const updated = { ...recipe, sizes: recipe.sizes.filter(s => s.id !== id) };
    updateRecipe(updated);
    if (calcSizeId === id) setCalcSizeId(updated.sizes[0]?.id || '');
  };

  // Calculator
  const selectedSize = recipe.sizes.find(s => s.id === calcSizeId);
  const totalPizzas = useMemo(() => {
    const qty = parseFloat(calcQty) || 0;
    if (calcMode === 'pizzas') return qty;
    return Math.ceil(qty * (parseFloat(calcRatio) || 1.5));
  }, [calcQty, calcMode, calcRatio]);

  const calcResult = useMemo(() => {
    if (!selectedSize || totalPizzas <= 0) return null;
    const totalGrams = totalPizzas * selectedSize.gramsPerPizza;
    const kgDough = totalGrams / 1000;
    const lines = recipe.ingredients.map(ing => {
      const qty = ing.quantity * kgDough;
      const cost = qty * ing.cost;
      return { ...ing, neededQty: qty, neededCost: cost };
    });
    const totalCost = lines.reduce((s, l) => s + l.neededCost, 0);
    return { kgDough, totalGrams, lines, totalCost, costPerPizza: totalPizzas > 0 ? totalCost / totalPizzas : 0 };
  }, [selectedSize, totalPizzas, recipe.ingredients]);

  const selectedEvent = events.find(e => e.id === calcEventId);

  // Drag & drop (kanban)
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<PedidoStatus | null>(null);

  const PEDIDO_COLUMNS: { id: PedidoStatus; label: string }[] = [
    { id: 'a_preparar', label: 'A preparar' },
    { id: 'a_enviar', label: 'A enviar' },
    { id: 'entregue', label: 'Entregue' },
  ];

  const pedidosByStatus = useMemo(() => {
    const map: Record<PedidoStatus, Pedido[]> = { a_preparar: [], a_enviar: [], entregue: [] };
    pedidos.forEach(p => map[p.status].push(p));
    return map;
  }, [pedidos]);

  const handleCreatePedido = async (pedido: Pedido) => {
    const res = await apiFetch('/api/production-orders', {
      method: 'POST',
      body: JSON.stringify(pedido),
    });
    const savedPedido: Pedido = await res.json();
    setPedidos(ps => [savedPedido, ...ps]);
  };

  const handleMove = async (pedidoId: string, newStatus: PedidoStatus) => {
    const pedido = pedidos.find(currentPedido => currentPedido.id === pedidoId);
    if (!pedido || pedido.status === newStatus) return;

    const res = await apiFetch(`/api/production-orders/${pedidoId}`, {
      method: 'PUT',
      body: JSON.stringify({ ...pedido, status: newStatus }),
    });
    const updatedPedido: Pedido = await res.json();
    setPedidos(ps => ps.map(currentPedido => currentPedido.id === pedidoId ? updatedPedido : currentPedido));
  };

  const handleDeletePedido = async (pedidoId: string) => {
    await apiFetch(`/api/production-orders/${pedidoId}`, { method: 'DELETE' });
    setPedidos(ps => ps.filter(p => p.id !== pedidoId));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Produção</h1>
          <p className={styles.subtitle}>Receitas e calculadora de insumos por evento</p>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button className={styles.btnAdd} style={{ margin: 0 }} onClick={() => setShowNovoPedido(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo Pedido
          </button>
          <div className={styles.saveStatus}>
            {saving && <span className={styles.saveLabel}>Salvando...</span>}
            {saved && <span className={styles.saveLabelOk}>✓ Salvo</span>}
          </div>
        </div>
      </div>
      {/* Kanban de Pedidos */}
      <div className={styles.kanban}>
        {PEDIDO_COLUMNS.map((col) => (
          <div key={col.id} className={styles.column}>
            <div className={styles.columnHeader}>
              <span className={styles.columnTitle}>{col.label}</span>
              <span className={styles.columnCount}>{pedidosByStatus[col.id].length}</span>
            </div>
            <div
              className={`${styles.columnBody} ${dragOverCol === col.id ? styles.columnBodyOver : ''}`}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverCol(col.id); }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null); }}
              onDrop={(e) => { e.preventDefault(); if (draggedId) void handleMove(draggedId, col.id); setDraggedId(null); setDragOverCol(null); }}
            >
              {pedidosByStatus[col.id].length === 0 ? (
                <div className={styles.colEmpty}>Nenhum pedido</div>
              ) : (
                pedidosByStatus[col.id].map((pedido) => (
                  <div
                    key={pedido.id}
                    className={`${styles.taskCard} ${draggedId === pedido.id ? styles.taskCardDragging : ''}`}
                    draggable
                    onDragStart={(e) => { setDraggedId(pedido.id); e.dataTransfer.effectAllowed = 'move'; }}
                    onDragEnd={() => { setDraggedId(null); setDragOverCol(null); }}
                  >
                    <div className={styles.taskTop}>
                      <div>
                        <div className={styles.taskTitle}>Filial: {pedido.filial}</div>
                        <div className={styles.taskMeta}>
                          <span>{pedido.itens.length} ingredientes</span>
                          <span>{pedido.pizzaSize.diameter}cm</span>
                          <span>R$ {formatR$(pedido.totalCost)}</span>
                        </div>
                      </div>
                      <button className={styles.taskDelete} onClick={() => void handleDeletePedido(pedido.id)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                    <div className={styles.taskDesc}>
                      Itens: {pedido.itens.map(i => `${i.nome} ${formatQty(i.quantidade)} ${i.measure}`).join(', ')}
                    </div>
                    <div className={styles.taskRecipe}>
                      <div className={styles.taskRecipeTitle}>Ingredientes selecionados</div>
                      {pedido.ingredients.length > 0 ? (
                        <div className={styles.taskRecipeList}>
                          {pedido.ingredients.map(ingredient => (
                            <span key={`${pedido.id}-${ingredient.id}`}>
                              {ingredient.name}: {formatQty(ingredient.neededQty)} {ingredient.measure}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className={styles.taskRecipeEmpty}>Nenhum ingrediente cadastrado</div>
                      )}
                      <div className={styles.taskRecipeFooter}>Custo estimado: R$ {formatR$(pedido.totalCost)}</div>
                    </div>
                    <div className={styles.taskMoveRow}>
                      {(() => {
                        const idx = PEDIDO_COLUMNS.findIndex((c) => c.id === pedido.status);
                        const prev = PEDIDO_COLUMNS[idx - 1];
                        const next = PEDIDO_COLUMNS[idx + 1];
                        return (
                          <>
                            <button
                              className={styles.taskMoveBtn}
                              disabled={!prev}
                              onClick={() => prev && void handleMove(pedido.id, prev.id)}
                              title={prev ? `← ${prev.label}` : undefined}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                            </button>
                            <span className={styles.taskMoveLabel}>{pedido.status === 'a_preparar' ? 'A preparar' : pedido.status === 'a_enviar' ? 'A enviar' : 'Entregue'}</span>
                            <button
                              className={styles.taskMoveBtn}
                              disabled={!next}
                              onClick={() => next && void handleMove(pedido.id, next.id)}
                              title={next ? `${next.label} →` : undefined}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Novo Pedido */}
      {showNovoPedido && (
        <div className={styles.overlay} onClick={() => setShowNovoPedido(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Novo Pedido</h2>
              <button className={styles.modalClose} onClick={() => setShowNovoPedido(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <NovoPedidoForm
                sizes={recipe.sizes}
                ingredients={recipe.ingredients}
                onSave={async pedido => {
                  await handleCreatePedido(pedido);
                  setShowNovoPedido(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
      

      {/* ── RECEITAS ────────────────────────────────── */}
      <div className={styles.receitasGrid}>

        {/* Ingredientes da Massa */}
        <div className={styles.recipeBlock}>
          <div className={styles.blockHeader}>
            <span className={styles.blockTitle}>Ingredientes da Massa</span>
            <span className={styles.blockSub}>por kg de massa</span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Massa</th>
                  <th>Medida</th>
                  <th>Quantidade</th>
                  <th>Custo (R$/un)</th>
                  <th>Custo Massa</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recipe.ingredients.map(ing => (
                  <tr key={ing.id}>
                    <td>
                      <input
                        className={styles.cellInput}
                        value={ing.name}
                        onChange={e => updateIngredient(ing.id, 'name', e.target.value)}
                        placeholder="Ex: Farinha"
                      />
                    </td>
                    <td>
                      <select className={styles.cellSelect} value={ing.measure} onChange={e => updateIngredient(ing.id, 'measure', e.target.value)}>
                        {MEASURES.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </td>
                    <td>
                      <input
                        className={`${styles.cellInput} ${styles.cellNumber}`}
                        type="number"
                        value={ing.quantity || ''}
                        onChange={e => updateIngredient(ing.id, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        className={`${styles.cellInput} ${styles.cellNumber}`}
                        type="number"
                        step="0.01"
                        value={ing.cost || ''}
                        onChange={e => updateIngredient(ing.id, 'cost', parseFloat(e.target.value) || 0)}
                        placeholder="0,00"
                      />
                    </td>
                    <td className={styles.cellCalc}>
                      R$ {formatR$(ing.quantity * ing.cost)}
                    </td>
                    <td>
                      <button className={styles.btnRemove} onClick={() => removeIngredient(ing.id)} title="Remover">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.totalRow}>
            <span>Custo total por kg</span>
            <strong>R$ {formatR$(recipe.ingredients.reduce((s, i) => s + i.quantity * i.cost, 0))}</strong>
          </div>

          <button className={styles.btnAdd} onClick={addIngredient}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Adicionar ingrediente
          </button>
        </div>

        {/* Tamanhos de Pizza */}
        <div className={styles.recipeBlock}>
          <div className={styles.blockHeader}>
            <span className={styles.blockTitle}>Tamanhos de Pizza</span>
            <span className={styles.blockSub}>diâmetro e massa por unidade</span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Diâmetro (cm)</th>
                  <th>Gramas por pizza</th>
                  <th>Pizzas/kg</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recipe.sizes.map(size => (
                  <tr key={size.id}>
                    <td>
                      <input
                        className={`${styles.cellInput} ${styles.cellNumber}`}
                        type="number"
                        value={size.diameter || ''}
                        onChange={e => updateSize(size.id, 'diameter', parseFloat(e.target.value) || 0)}
                        placeholder="25"
                      />
                    </td>
                    <td>
                      <input
                        className={`${styles.cellInput} ${styles.cellNumber}`}
                        type="number"
                        value={size.gramsPerPizza || ''}
                        onChange={e => updateSize(size.id, 'gramsPerPizza', parseFloat(e.target.value) || 0)}
                        placeholder="180"
                      />
                    </td>
                    <td className={styles.cellCalc}>
                      {size.gramsPerPizza > 0 ? (1000 / size.gramsPerPizza).toFixed(1) : '—'}
                    </td>
                    <td>
                      <button className={styles.btnRemove} onClick={() => removeSize(size.id)} title="Remover">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className={styles.btnAdd} onClick={addSize}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Adicionar tamanho
          </button>
        </div>
      </div>

      {/* ── CALCULADORA ────────────────────────────── */}
      <div className={styles.calcSection}>
        <div className={styles.calcHeader}>
          <span className={styles.blockTitle}>Calculadora de Produção</span>
        </div>

        <div className={styles.calcInputs}>
          <div className={styles.calcGroup}>
            <label className={styles.calcLabel}>Evento (opcional)</label>
            <select className={styles.calcSelect} value={calcEventId} onChange={e => setCalcEventId(e.target.value)}>
              <option value="">— Sem evento —</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>
          </div>

          <div className={styles.calcGroup}>
            <label className={styles.calcLabel}>Tamanho</label>
            <select className={styles.calcSelect} value={calcSizeId} onChange={e => setCalcSizeId(e.target.value)}>
              {recipe.sizes.map(s => (
                <option key={s.id} value={s.id}>{s.diameter}cm ({s.gramsPerPizza}g)</option>
              ))}
            </select>
          </div>

          <div className={styles.calcGroup}>
            <label className={styles.calcLabel}>Calcular por</label>
            <div className={styles.modeToggle}>
              <button className={`${styles.modeBtn} ${calcMode === 'pizzas' ? styles.modeBtnActive : ''}`} onClick={() => setCalcMode('pizzas')}>Pizzas</button>
              <button className={`${styles.modeBtn} ${calcMode === 'pessoas' ? styles.modeBtnActive : ''}`} onClick={() => setCalcMode('pessoas')}>Pessoas</button>
            </div>
          </div>

          <div className={styles.calcGroup}>
            <label className={styles.calcLabel}>{calcMode === 'pizzas' ? 'Quantidade de pizzas' : 'Quantidade de pessoas'}</label>
            <input
              className={styles.calcInput}
              type="number"
              value={calcQty}
              onChange={e => setCalcQty(e.target.value)}
              placeholder={calcMode === 'pizzas' ? '20' : '15'}
            />
          </div>

          {calcMode === 'pessoas' && (
            <div className={styles.calcGroup}>
              <label className={styles.calcLabel}>Pizzas por pessoa</label>
              <input
                className={styles.calcInput}
                type="number"
                step="0.5"
                value={calcRatio}
                onChange={e => setCalcRatio(e.target.value)}
                placeholder="1.5"
              />
            </div>
          )}
        </div>

        {calcResult && totalPizzas > 0 && (
          <div className={styles.calcResult}>
            <div className={styles.resultSummary}>
              {selectedEvent && <span className={styles.resultEvent}>{selectedEvent.name}</span>}
              <div className={styles.resultKpis}>
                <div className={styles.resultKpi}>
                  <span className={styles.resultKpiVal}>{totalPizzas}</span>
                  <span className={styles.resultKpiLbl}>pizzas {selectedSize?.diameter}cm</span>
                </div>
                <div className={styles.resultKpi}>
                  <span className={styles.resultKpiVal}>{calcResult.kgDough.toFixed(2)} kg</span>
                  <span className={styles.resultKpiLbl}>de massa</span>
                </div>
                <div className={styles.resultKpi}>
                  <span className={styles.resultKpiVal}>R$ {formatR$(calcResult.totalCost)}</span>
                  <span className={styles.resultKpiLbl}>custo total</span>
                </div>
                <div className={styles.resultKpi}>
                  <span className={styles.resultKpiVal}>R$ {formatR$(calcResult.costPerPizza)}</span>
                  <span className={styles.resultKpiLbl}>por pizza</span>
                </div>
              </div>
            </div>

            <div className={styles.resultTable}>
              <div className={styles.resultTableHeader}>
                <span>Ingrediente</span>
                <span>Necessário</span>
                <span>Custo</span>
              </div>
              {calcResult.lines.map(line => (
                <div key={line.id} className={styles.resultRow}>
                  <span className={styles.resultName}>{line.name || '—'}</span>
                  <span className={styles.resultQty}>
                    {line.neededQty >= 1000 && line.measure === 'g'
                      ? `${(line.neededQty / 1000).toFixed(2)} kg`
                      : line.neededQty >= 1000 && line.measure === 'ml'
                      ? `${(line.neededQty / 1000).toFixed(2)} L`
                      : `${line.neededQty.toFixed(2)} ${line.measure}`}
                  </span>
                  <span className={styles.resultCost}>
                    {line.cost > 0 ? `R$ ${formatR$(line.neededCost)}` : '—'}
                  </span>
                </div>
              ))}
              <div className={styles.resultTotal}>
                <span>Total</span>
                <span></span>
                <span>R$ {formatR$(calcResult.totalCost)}</span>
              </div>
            </div>

            <button className={styles.btnPrint} onClick={() => setShowPrint(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Imprimir ficha
            </button>
          </div>
        )}

        {(!calcResult || totalPizzas === 0) && recipe.sizes.length > 0 && (
          <div className={styles.calcEmpty}>
            Informe a quantidade para calcular os insumos necessários.
          </div>
        )}

        {recipe.sizes.length === 0 && (
          <div className={styles.calcEmpty}>
            Cadastre ao menos um tamanho de pizza para usar a calculadora.
          </div>
        )}
      </div>

      {/* Print modal */}
      {showPrint && calcResult && (
        <div className={styles.overlay} onClick={() => setShowPrint(false)}>
          <div className={styles.printModal} onClick={e => e.stopPropagation()}>
            <div className={styles.printHeader}>
              <h2 className={styles.printTitle}>Ficha de Produção</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className={styles.btnPrintNow} onClick={() => window.print()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Imprimir
                </button>
                <button className={styles.modalClose} onClick={() => setShowPrint(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div className={styles.printBody}>
              <div className={styles.printMeta}>
                <div className={styles.printMetaItem}><span>Pizza</span><strong>{selectedSize?.diameter}cm</strong></div>
                <div className={styles.printMetaItem}><span>Quantidade</span><strong>{totalPizzas} pizzas</strong></div>
                <div className={styles.printMetaItem}><span>Massa total</span><strong>{calcResult.kgDough.toFixed(2)} kg</strong></div>
                {selectedEvent && <div className={styles.printMetaItem}><span>Evento</span><strong>{selectedEvent.name}</strong></div>}
              </div>
              <table className={styles.printTable}>
                <thead>
                  <tr>
                    <th>Ingrediente</th>
                    <th>Necessário</th>
                    <th>Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {calcResult.lines.map(line => (
                    <tr key={line.id}>
                      <td>{line.name || '—'}</td>
                      <td>
                        {line.neededQty >= 1000 && line.measure === 'g'
                          ? `${(line.neededQty / 1000).toFixed(3)} kg`
                          : line.neededQty >= 1000 && line.measure === 'ml'
                          ? `${(line.neededQty / 1000).toFixed(3)} L`
                          : `${line.neededQty.toFixed(3)} ${line.measure}`}
                      </td>
                      <td>{line.cost > 0 ? `R$ ${formatR$(line.neededCost)}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td><strong>Total</strong></td>
                    <td></td>
                    <td><strong>R$ {formatR$(calcResult.totalCost)}</strong></td>
                  </tr>
                </tfoot>
              </table>
              <div className={styles.printFooter}>
                Custo por pizza: <strong>R$ {formatR$(calcResult.costPerPizza)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
