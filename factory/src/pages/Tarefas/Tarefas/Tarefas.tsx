import { useState, useEffect, useMemo, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import styles from './Tarefas.module.scss';

type Ingredient = {
  id: string;
  name: string;
  measure: string;
  quantity: number;
  cost: number;
};

type Insumo = {
  id: string;
  name: string;
  measure: string;
  cost: number;
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
  insumos: Insumo[];
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
  orderNumber?: number;
  filial: string;
  itens: Array<{ id: string; nome: string; measure: string; quantidade: number }>;
  ingredients: PedidoIngredient[];
  totalCost: number;
  status: PedidoStatus;
  createdAt?: string;
};

const ALL_STATUSES: { id: PedidoStatus; label: string }[] = [
  { id: 'a_preparar', label: 'A preparar' },
  { id: 'a_enviar', label: 'A enviar' },
  { id: 'entregue', label: 'Entregue' },
];

function NovoPedidoForm({
  onSave,
  ingredients,
  insumos,
}: {
  onSave: (pedido: Pedido) => Promise<void> | void;
  ingredients: Ingredient[];
  insumos: Insumo[];
}) {
  const [filial, setFilial] = useState('');
  const [itens, setItens] = useState<Array<{ id: string; nome: string; measure: string; quantidade: number }>>([]);
  const [itemKey, setItemKey] = useState('');
  const [itemQtd, setItemQtd] = useState(1);

  const allItems = useMemo(() => [
    ...ingredients.filter(i => i.name.trim()).map(i => ({
      key: `ing:${i.id}`, id: i.id, name: i.name, measure: i.measure, cost: i.cost,
    })),
    ...insumos.filter(i => i.name.trim()).map(i => ({
      key: `ins:${i.id}`, id: i.id, name: i.name, measure: i.measure, cost: i.cost,
    })),
  ], [ingredients, insumos]);

  useEffect(() => {
    if (!allItems.length) { setItemKey(''); return; }
    setItemKey(curr => (allItems.some(i => i.key === curr) ? curr : allItems[0].key));
  }, [allItems]);

  const costMap = useMemo(() => new Map([
    ...ingredients.map(i => [i.id, i.cost] as [string, number]),
    ...insumos.map(i => [i.id, i.cost] as [string, number]),
  ]), [ingredients, insumos]);

  const addItem = () => {
    const selected = allItems.find(i => i.key === itemKey);
    if (!selected || itemQtd <= 0) return;
    setItens(prev => {
      const existing = prev.find(item => item.id === selected.id);
      if (existing) return prev.map(item => item.id === selected.id ? { ...item, quantidade: item.quantidade + itemQtd } : item);
      return [...prev, { id: selected.id, nome: selected.name, measure: selected.measure, quantidade: itemQtd }];
    });
    setItemQtd(1);
  };

  const removeItem = (idx: number) => setItens(prev => prev.filter((_, i) => i !== idx));

  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        if (!filial.trim() || itens.length === 0) return;
        const pedidoIngredients = itens.map(item => ({
          id: item.id,
          name: item.nome,
          measure: item.measure,
          neededQty: item.quantidade,
          neededCost: item.quantidade * (costMap.get(item.id) || 0),
        }));
        const totalCost = pedidoIngredients.reduce((sum, i) => sum + i.neededCost, 0);
        await onSave({
          id: uid(),
          filial: filial.trim(),
          itens,
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
        <div className={styles.label}>Itens do pedido</div>
        <div className={styles.formGrid2}>
          <div>
            <select className={styles.input} value={itemKey} onChange={e => setItemKey(e.target.value)} disabled={allItems.length === 0}>
              {allItems.length === 0 ? (
                <option value="">Cadastre ingredientes ou insumos antes de criar o pedido</option>
              ) : (
                <>
                  {ingredients.filter(i => i.name.trim()).length > 0 && (
                    <optgroup label="Ingredientes da Massa">
                      {ingredients.filter(i => i.name.trim()).map(i => (
                        <option key={`ing:${i.id}`} value={`ing:${i.id}`}>{i.name} ({i.measure})</option>
                      ))}
                    </optgroup>
                  )}
                  {insumos.filter(i => i.name.trim()).length > 0 && (
                    <optgroup label="Insumos">
                      {insumos.filter(i => i.name.trim()).map(i => (
                        <option key={`ins:${i.id}`} value={`ins:${i.id}`}>{i.name} ({i.measure})</option>
                      ))}
                    </optgroup>
                  )}
                </>
              )}
            </select>
          </div>
          <div>
            <input className={styles.input} type="number" min={1} value={itemQtd} onChange={e => setItemQtd(Number(e.target.value) || 1)} />
          </div>
          <div>
            <button type="button" className={styles.btnPrimary} onClick={addItem} disabled={!itemKey || allItems.length === 0}>Adicionar</button>
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
        <button type="submit" className={styles.btnPrimary} disabled={!filial.trim() || itens.length === 0 || allItems.length === 0}>Criar Pedido</button>
      </div>
    </form>
  );
}

export default function Pedidos() {
  const [recipe, setRecipe] = useState<Recipe>({ ingredients: [], insumos: [] });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [showNovoPedido, setShowNovoPedido] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/production-recipes').then(r => r.json() as Promise<Recipe & { insumos?: Insumo[] }>),
      apiFetch('/api/production-orders').then(r => r.json() as Promise<Pedido[]>),
    ])
      .then(([recipeData, pedidosData]) => {
        setRecipe({ ingredients: recipeData.ingredients || [], insumos: recipeData.insumos || [] });
        setPedidos(pedidosData);
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
          body: JSON.stringify({ ingredients: newRecipe.ingredients, insumos: newRecipe.insumos }),
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
  const addIngredient = () => updateRecipe({ ...recipe, ingredients: [...recipe.ingredients, { id: uid(), name: '', measure: 'kg', quantity: 0, cost: 0 }] });
  const updateIngredient = (id: string, field: keyof Ingredient, value: string | number) =>
    updateRecipe({ ...recipe, ingredients: recipe.ingredients.map(i => i.id === id ? { ...i, [field]: value } : i) });
  const removeIngredient = (id: string) =>
    updateRecipe({ ...recipe, ingredients: recipe.ingredients.filter(i => i.id !== id) });

  // Insumo CRUD
  const addInsumo = () => updateRecipe({ ...recipe, insumos: [...recipe.insumos, { id: uid(), name: '', measure: 'un', cost: 0 }] });
  const updateInsumo = (id: string, field: keyof Insumo, value: string | number) =>
    updateRecipe({ ...recipe, insumos: recipe.insumos.map(i => i.id === id ? { ...i, [field]: value } : i) });
  const removeInsumo = (id: string) =>
    updateRecipe({ ...recipe, insumos: recipe.insumos.filter(i => i.id !== id) });

  // Drag & drop (kanban)
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<PedidoStatus | null>(null);

  const KANBAN_COLUMNS: { id: PedidoStatus; label: string }[] = [
    { id: 'a_preparar', label: 'A preparar' },
    { id: 'a_enviar', label: 'A enviar' },
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
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido || pedido.status === newStatus) return;
    const res = await apiFetch(`/api/production-orders/${pedidoId}`, {
      method: 'PUT',
      body: JSON.stringify({ ...pedido, status: newStatus }),
    });
    const updatedPedido: Pedido = await res.json();
    setPedidos(ps => ps.map(p => p.id === pedidoId ? updatedPedido : p));
  };

  const handleDeletePedido = async (pedidoId: string) => {
    await apiFetch(`/api/production-orders/${pedidoId}`, { method: 'DELETE' });
    setPedidos(ps => ps.filter(p => p.id !== pedidoId));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pedidos</h1>
          <p className={styles.subtitle}>Gestão de pedidos e insumos de produção</p>
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

      {/* Kanban (A preparar + A enviar) */}
      <div className={styles.kanban}>
        {KANBAN_COLUMNS.map((col) => (
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
                pedidosByStatus[col.id].map((pedido) => {
                  const statusIdx = ALL_STATUSES.findIndex(c => c.id === pedido.status);
                  const prevStatus = ALL_STATUSES[statusIdx - 1];
                  const nextStatus = ALL_STATUSES[statusIdx + 1];
                  return (
                    <div
                      key={pedido.id}
                      className={`${styles.taskCard} ${draggedId === pedido.id ? styles.taskCardDragging : ''}`}
                      draggable
                      onDragStart={(e) => { setDraggedId(pedido.id); e.dataTransfer.effectAllowed = 'move'; }}
                      onDragEnd={() => { setDraggedId(null); setDragOverCol(null); }}
                    >
                      <div className={styles.taskTop}>
                        <div>
                          <div className={styles.taskTitle}>
                            {pedido.orderNumber !== undefined && (
                              <span className={styles.orderBadge}>#{pedido.orderNumber}</span>
                            )}{' '}
                            Filial: {pedido.filial}
                          </div>
                          <div className={styles.taskMeta}>
                            <span>{pedido.itens.length} itens</span>
                            <span>R$ {formatR$(pedido.totalCost)}</span>
                          </div>
                        </div>
                        <button className={styles.taskDelete} onClick={() => setDeleteConfirmId(pedido.id)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                      <div className={styles.taskDesc}>
                        Itens: {pedido.itens.map(i => `${i.nome} ${formatQty(i.quantidade)} ${i.measure}`).join(', ')}
                      </div>
                      <div className={styles.taskRecipe}>
                        <div className={styles.taskRecipeTitle}>Itens selecionados</div>
                        {pedido.ingredients.length > 0 ? (
                          <div className={styles.taskRecipeList}>
                            {pedido.ingredients.map(ingredient => (
                              <span key={`${pedido.id}-${ingredient.id}`}>
                                {ingredient.name}: {formatQty(ingredient.neededQty)} {ingredient.measure}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className={styles.taskRecipeEmpty}>Nenhum item cadastrado</div>
                        )}
                        <div className={styles.taskRecipeFooter}>Custo estimado: R$ {formatR$(pedido.totalCost)}</div>
                      </div>
                      <div className={styles.taskMoveRow}>
                        <button
                          className={styles.taskMoveBtn}
                          disabled={!prevStatus}
                          onClick={() => prevStatus && void handleMove(pedido.id, prevStatus.id)}
                          title={prevStatus ? `← ${prevStatus.label}` : undefined}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                        <span className={styles.taskMoveLabel}>{col.label}</span>
                        <button
                          className={styles.taskMoveBtn}
                          disabled={!nextStatus}
                          onClick={() => nextStatus && void handleMove(pedido.id, nextStatus.id)}
                          title={nextStatus ? `${nextStatus.label} →` : undefined}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pedidos Finalizados */}
      {pedidosByStatus.entregue.length > 0 && (
        <div className={styles.finalizedSection}>
          <div className={styles.finalizedHeader}>
            <span className={styles.blockTitle}>Pedidos Finalizados</span>
            <span className={styles.columnCount}>{pedidosByStatus.entregue.length}</span>
          </div>
          <div className={styles.finalizedList}>
            {pedidosByStatus.entregue.map(pedido => (
              <div key={pedido.id} className={styles.finalizedItem}>
                <div className={styles.finalizedInfo}>
                  {pedido.orderNumber !== undefined && (
                    <span className={styles.orderBadge}>#{pedido.orderNumber}</span>
                  )}
                  <span className={styles.finalizedFilial}>{pedido.filial}</span>
                  <span className={styles.finalizedItens}>
                    {pedido.itens.map(i => `${i.nome} ${formatQty(i.quantidade)} ${i.measure}`).join(', ')}
                  </span>
                </div>
                <div className={styles.finalizedRight}>
                  <span className={styles.finalizedCost}>R$ {formatR$(pedido.totalCost)}</span>
                  <button className={styles.taskDelete} onClick={() => setDeleteConfirmId(pedido.id)} title="Excluir">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                ingredients={recipe.ingredients}
                insumos={recipe.insumos}
                onSave={async pedido => {
                  await handleCreatePedido(pedido);
                  setShowNovoPedido(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Receitas grid: Ingredientes da Massa + Insumos */}
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

        {/* Insumos */}
        <div className={styles.recipeBlock}>
          <div className={styles.blockHeader}>
            <span className={styles.blockTitle}>Insumos</span>
            <span className={styles.blockSub}>materiais e embalagens</span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Insumo</th>
                  <th>Medida</th>
                  <th>Custo (R$/un)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recipe.insumos.map(ins => (
                  <tr key={ins.id}>
                    <td>
                      <input
                        className={styles.cellInput}
                        value={ins.name}
                        onChange={e => updateInsumo(ins.id, 'name', e.target.value)}
                        placeholder="Ex: Caixa"
                      />
                    </td>
                    <td>
                      <select className={styles.cellSelect} value={ins.measure} onChange={e => updateInsumo(ins.id, 'measure', e.target.value)}>
                        {MEASURES.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </td>
                    <td>
                      <input
                        className={`${styles.cellInput} ${styles.cellNumber}`}
                        type="number"
                        step="0.01"
                        value={ins.cost || ''}
                        onChange={e => updateInsumo(ins.id, 'cost', parseFloat(e.target.value) || 0)}
                        placeholder="0,00"
                      />
                    </td>
                    <td>
                      <button className={styles.btnRemove} onClick={() => removeInsumo(ins.id)} title="Remover">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className={styles.btnAdd} onClick={addInsumo}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Adicionar insumo
          </button>
        </div>
      </div>

      {deleteConfirmId && (
        <ConfirmModal
          title="Excluir Pedido"
          message={<>Tem certeza que deseja excluir o pedido de <strong>{pedidos.find(p => p.id === deleteConfirmId)?.filial || 'esta filial'}</strong>? Esta ação não pode ser desfeita.</>}
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={async () => { await handleDeletePedido(deleteConfirmId); setDeleteConfirmId(null); }}
          onClose={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}
