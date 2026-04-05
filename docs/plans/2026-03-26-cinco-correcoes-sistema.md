# Cinco Correções – Sistema Principal – Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corrigir 5 problemas no sistema principal: seleção de cardápio no contrato, nome invisível no PDF de cardápio, card de adicionar insumo, sugestões persistentes no chat e melhorias nas permissões.

**Architecture:** Todas as mudanças são frontend-first com pequenos ajustes no backend quando necessário. Sem novos endpoints — apenas campos adicionados a schemas/types existentes.

**Tech Stack:** React + TypeScript, SCSS Modules, Express + Mongoose, html2pdf.js

---

### Task 1: Extrair SOUL540_MENUS para arquivo compartilhado

**Files:**
- Create: `src/frontend/data/soul540Menus.ts`
- Modify: `src/frontend/pages/Cardapios/Cardapios.tsx`

**Step 1: Criar arquivo compartilhado**

Mover os tipos e a constante `SOUL540_MENUS` de `Cardapios.tsx` para um novo arquivo:

```typescript
// src/frontend/data/soul540Menus.ts
export type StaticItem = { name: string; subtitle?: string; description: string; harmonization?: string; };
export type StaticCategory = { name: string; items: StaticItem[]; };
export type StaticMenu = { id: string; name: string; tagline: string; obs?: string; categories: StaticCategory[]; };

export const SOUL540_MENUS: StaticMenu[] = [
  // (colar aqui todo o array SOUL540_MENUS que está em Cardapios.tsx, linhas 101 até o fim da constante)
];
```

**Step 2: Atualizar Cardapios.tsx para importar do novo arquivo**

Remover de `Cardapios.tsx` as declarações de `StaticItem`, `StaticCategory`, `StaticMenu` e `SOUL540_MENUS`, e substituir por:
```typescript
import { SOUL540_MENUS, type StaticMenu } from '@frontend/data/soul540Menus';
```

**Step 3: Verificar que o build compila sem erros**
```bash
cd "c:/Users/filip/OneDrive/Área de Trabalho/ideias/Soul540"
npm run build 2>&1 | tail -5
```
Expected: sem erros de TypeScript

**Step 4: Commit**
```bash
git add src/frontend/data/soul540Menus.ts src/frontend/pages/Cardapios/Cardapios.tsx
git commit -m "refactor: extract SOUL540_MENUS to shared data file"
```

---

### Task 2: Cardápios PDF – Corrigir nome invisível no centro

**Files:**
- Modify: `src/frontend/pages/Cardapios/Cardapios.tsx` (função `generateMenuPdf`, ~linha 38)

**Step 1: Corrigir o style inline do menu-title**

Na string HTML dentro de `generateMenuPdf`, a linha:
```html
<div class="menu-title">${menu.name}</div>
```
trocar por:
```html
<div class="menu-title" style="color: #8b1a1a; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px;">${menu.name}</div>
```

Isso garante que o `color` não seja herdado do `.doc-header { color: #fff }`.

**Step 2: Verificar build**
```bash
npm run build 2>&1 | tail -5
```

**Step 3: Commit**
```bash
git add src/frontend/pages/Cardapios/Cardapios.tsx
git commit -m "fix: force menu title color in PDF generation (was inheriting white from header)"
```

---

### Task 3: Contrato – Campo menuId no backend

**Files:**
- Modify: `server/routes/contracts.ts`

**Step 1: Adicionar menuId ao `contractFields`**

Em `server/routes/contracts.ts`, dentro do objeto `contractFields` (após `terms`), adicionar:
```typescript
menuId: { type: String, default: '' },
```

**Step 2: Commit**
```bash
git add server/routes/contracts.ts
git commit -m "feat: add menuId field to contract schema"
```

---

### Task 4: Contrato – Seleção de cardápio no formulário

**Files:**
- Modify: `src/frontend/pages/Contratos/Contratos.tsx`
- Modify: `src/frontend/pages/Contratos/ContractDocument.tsx`

**Step 1: Adicionar menuId ao tipo Contract e FormData em Contratos.tsx**

No tipo `FormData` (linha ~16), adicionar:
```typescript
menuId: string;
```

No `emptyForm` (linha ~43), adicionar:
```typescript
menuId: '',
```

**Step 2: Adicionar campo de seleção no modal do formulário**

Importar `SOUL540_MENUS` no topo de `Contratos.tsx`:
```typescript
import { SOUL540_MENUS } from '@frontend/data/soul540Menus';
```

Na seção "Serviço" do modal, adicionar um novo campo antes de "Sistema de Servico":
```tsx
<div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
  <label className={styles.label}>Cardápio do Evento (Anexo I)</label>
  <select className={styles.input} value={form.menuId} onChange={(e) => setForm({ ...form, menuId: e.target.value })}>
    <option value="">Cardápio Padrão (genérico)</option>
    {SOUL540_MENUS.map((m) => (
      <option key={m.id} value={m.id}>{m.name}</option>
    ))}
  </select>
</div>
```

**Step 3: Propagar menuId nas funções openEdit e handleSubmit**

Em `openEdit`, adicionar:
```typescript
menuId: c.menuId || '',
```

Em `handleSubmit`, no objeto `data`, adicionar:
```typescript
menuId: form.menuId || '',
```

**Step 4: Atualizar Contract type em ContractDocument.tsx**

Adicionar ao tipo `Contract`:
```typescript
menuId?: string;
```

**Step 5: Renderizar Anexo I dinâmico em ContractDocument.tsx**

Importar no topo:
```typescript
import { SOUL540_MENUS, type StaticMenu } from '@frontend/data/soul540Menus';
```

Substituir o bloco "ANEXO I – CARDÁPIO" (linhas ~433–480) por:

```tsx
{/* ——— ANEXO I – CARDÁPIO ——— */}
<div className={styles.annex}>
  <div className={styles.annexTitle}>Anexo I – Cardápio do Evento</div>
  {(() => {
    const selectedMenu: StaticMenu | undefined = contract.menuId
      ? SOUL540_MENUS.find((m) => m.id === contract.menuId)
      : undefined;

    if (selectedMenu) {
      return (
        <>
          <p className={styles.annexSection} style={{ fontWeight: 700, fontSize: '1em', marginBottom: 8 }}>
            {selectedMenu.name}
          </p>
          {selectedMenu.categories.map((cat) => (
            <div key={cat.name}>
              <p className={styles.annexSection}>{cat.name}</p>
              <table className={styles.menuTable}>
                <thead><tr><th>Item</th><th>Descrição</th></tr></thead>
                <tbody>
                  {cat.items.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}{item.subtitle ? <><br /><em style={{ fontSize: '0.85em', color: '#666' }}>{item.subtitle}</em></> : null}</td>
                      <td>{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {selectedMenu.obs && (
            <p className={styles.annexObs}><strong>Observação:</strong> {selectedMenu.obs}</p>
          )}
        </>
      );
    }

    // Cardápio genérico padrão (conteúdo atual)
    return (
      <>
        <p className={styles.annexSection}>Entradas</p>
        <table className={styles.menuTable}>
          <thead><tr><th>Item</th><th>Descrição</th></tr></thead>
          <tbody>
            <tr><td>Crostinis</td><td>Torradinhas artesanais com azeite</td></tr>
            <tr><td>Pãozinho de Calabresa</td><td>Massa leve com calabresa</td></tr>
            <tr><td>Maravilha de Queijo</td><td>Massa recheada com queijo derretido</td></tr>
          </tbody>
        </table>
        <p className={styles.annexSection}>Pizzas Salgadas</p>
        <table className={styles.menuTable}>
          <thead><tr><th>Nome</th><th>Ingredientes</th></tr></thead>
          <tbody>
            <tr><td>ZUCCHINI SPECIALI</td><td>Massa, molho de tomate, abobrinha, alho frito, parmesão, azeite e orégano</td></tr>
            <tr><td>BLU AGRIDOCE</td><td>Massa, molho de tomate, geleia de pimenta, mussarela, gorgonzola, bacon e orégano</td></tr>
            <tr><td>MARGHERITA BÚFALA</td><td>Massa, molho de tomate, mussarela de búfala, parmesão, manjericão, azeite e orégano</td></tr>
            <tr><td>CALABRESA TRADIZIONALE</td><td>Massa, molho de tomate, mussarela, calabresa, cebola, azeitona e orégano</td></tr>
            <tr><td>QUATTRO FORAGGIO</td><td>Massa, molho, mussarela, parmesão, gorgonzola, catupiry e orégano</td></tr>
            <tr><td>DUO FRANGO E BACON</td><td>Massa, molho de tomate, mussarela, frango desfiado, Catupiry, bacon e orégano</td></tr>
          </tbody>
        </table>
        <p className={styles.annexSection}>Pizzas Doces</p>
        <table className={styles.menuTable}>
          <thead><tr><th>Nome</th><th>Ingredientes</th></tr></thead>
          <tbody>
            <tr><td>Chocolate</td><td>Massa, Chocolate ao leite, confeitos</td></tr>
          </tbody>
        </table>
        <p className={styles.annexObs}>
          <strong>Observação:</strong> O serviço será realizado em formato coquetel e rodízio, com garçons
          servindo fatias aos convidados e mesa de apoio disponível para autoatendimento.
        </p>
      </>
    );
  })()}
</div>
```

**Step 6: Verificar build**
```bash
npm run build 2>&1 | tail -5
```

**Step 7: Commit**
```bash
git add src/frontend/pages/Contratos/Contratos.tsx src/frontend/pages/Contratos/ContractDocument.tsx
git commit -m "feat: add menu selection to contract form and dynamic Annex I in PDF"
```

---

### Task 5: Est. Insumos – Card de adicionar novo no grid

**Files:**
- Modify: `src/frontend/pages/EstoqueInsumos/EstoqueInsumos.tsx`
- Modify: `src/frontend/pages/EstoqueInsumos/EstoqueInsumos.module.scss`

**Step 1: Adicionar card "+ Novo Insumo" ao grid**

Em `EstoqueInsumos.tsx`, dentro do `<div className={styles.grid}>`, após o `.map(...)`, adicionar:
```tsx
<button className={styles.cardAdd} onClick={openCreate}>
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  <span>Novo Insumo</span>
</button>
```

**Step 2: Adicionar estilo `.cardAdd` no SCSS**

Em `EstoqueInsumos.module.scss`, adicionar:
```scss
.cardAdd {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 2px dashed var(--border);
  border-radius: 12px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  min-height: 160px;
  transition: border-color 0.15s, color 0.15s;

  &:hover {
    border-color: var(--amber);
    color: var(--amber);
  }
}
```

**Step 3: Verificar build**
```bash
npm run build 2>&1 | tail -5
```

**Step 4: Commit**
```bash
git add src/frontend/pages/EstoqueInsumos/EstoqueInsumos.tsx src/frontend/pages/EstoqueInsumos/EstoqueInsumos.module.scss
git commit -m "feat: add quick-add card to supplies grid"
```

---

### Task 6: Chat IA – Chips de sugestão sempre visíveis

**Files:**
- Modify: `src/frontend/pages/Chat/Chat.tsx`
- Modify: `src/frontend/pages/Chat/Chat.module.scss`

**Step 1: Adicionar chips no JSX de Chat.tsx**

Adicionar uma constante com as sugestões antes do return:
```typescript
const SUGGESTIONS = [
  'Ver eventos do mês',
  'Criar lançamento financeiro',
  'Listar tarefas pendentes',
  'Ver funcionários',
];
```

Criar uma função que envia a sugestão diretamente:
```typescript
async function handleSuggestion(text: string) {
  if (loading) return;
  const userMessage: Message = { role: 'user', content: text };
  const newMessages = [...messages, userMessage];
  setMessages(newMessages);
  setLoading(true);
  try {
    const token = localStorage.getItem('soul540_token');
    const history = newMessages.slice(-10).map(m => ({ role: m.role, content: m.content }));
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-System': 'main',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message: text, history }),
    });
    const data = await res.json() as { reply: string; action?: string };
    setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    if (data.action === 'create_finance') refreshFinances();
    if (data.action === 'create_task') refreshTasks();
  } catch {
    setMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao conectar com o assistente.' }]);
  } finally {
    setLoading(false);
  }
}
```

Adicionar antes do `<form className={styles.inputBar}>`:
```tsx
<div className={styles.suggestions}>
  {SUGGESTIONS.map((s) => (
    <button
      key={s}
      className={styles.suggestionChip}
      onClick={() => handleSuggestion(s)}
      disabled={loading}
      type="button"
    >
      {s}
    </button>
  ))}
</div>
```

**Step 2: Adicionar estilos no Chat.module.scss**

```scss
.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 16px 0;
}

.suggestionChip {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #f59e0b;
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 0.78rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: rgba(245, 158, 11, 0.18);
    border-color: #f59e0b;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
```

**Step 3: Verificar build**
```bash
npm run build 2>&1 | tail -5
```

**Step 4: Commit**
```bash
git add src/frontend/pages/Chat/Chat.tsx src/frontend/pages/Chat/Chat.module.scss
git commit -m "feat: add persistent suggestion chips to chat"
```

---

### Task 7: Permissões – Admin toggle, isAdmin no save, campo grupo

**Files:**
- Modify: `src/frontend/pages/Permissoes/Permissoes.tsx`

**Step 1: Adicionar `draftIsAdmin` ao estado e preencher ao selecionar usuário**

Adicionar estado logo abaixo de `draftPerms`:
```typescript
const [draftIsAdmin, setDraftIsAdmin] = useState(false);
```

Em `selectUser`:
```typescript
const selectUser = (u: AppUser) => {
  setSelected(u);
  setDraftPerms([...u.permissions]);
  setDraftIsAdmin(u.isAdmin);
};
```

**Step 2: Incluir `isAdmin` no `savePermissions`**

Atualizar o body do PUT:
```typescript
body: JSON.stringify({ permissions: draftPerms, isAdmin: draftIsAdmin }),
```

Atualizar o `setSelected(updated)` para também refletir no estado:
```typescript
setSelected(updated);
setDraftIsAdmin(updated.isAdmin);
```

**Step 3: Adicionar toggle Admin no painel direito**

Logo após `<div className={styles.permHeader}>`, adicionar o toggle de admin antes dos grupos de permissões:
```tsx
<label className={styles.adminToggleRow}>
  <input
    type="checkbox"
    checked={draftIsAdmin}
    onChange={(e) => {
      setDraftIsAdmin(e.target.checked);
      if (e.target.checked) {
        setDraftPerms([...ALL_KEYS, 'permissoes']);
      }
    }}
  />
  <span className={styles.adminToggleLabel}>
    Administrador
    <small> — acesso total + tela de Permissões</small>
  </span>
</label>
```

Adicionar `'permissoes'` à lista `ALL_PAGES` (grupo Sistema):
```typescript
{ group: 'Sistema', items: [
  { key: 'chat', label: 'Chat IA' },
  { key: 'usuario', label: 'Minha Conta' },
  { key: 'permissoes', label: 'Permissões' },
]},
```

**Step 4: Adicionar campo "Sistema" no modal Novo Usuário**

No `emptyForm`, adicionar:
```typescript
const emptyForm = { name: '', email: '', password: '', isAdmin: false, unit: 'main' };
```

No modal (após o checkbox de Administrador), adicionar:
```tsx
<div className={styles.formGroup}>
  <label className={styles.label}>Sistema</label>
  <select className={styles.input} value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
    <option value="main">Principal</option>
    <option value="franchise">Franquia</option>
    <option value="factory">Fábrica</option>
  </select>
</div>
```

**Step 5: Passar `unit` na criação do usuário**

Em `createUser`, atualizar o body do POST:
```typescript
body: JSON.stringify({ ...form, unit: form.unit, permissions: form.isAdmin ? [...ALL_KEYS, 'permissoes'] : [] }),
```

**Step 6: Adicionar estilo `.adminToggleRow` no SCSS**

Em `Permissoes.module.scss`, adicionar:
```scss
.adminToggleRow {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0 16px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 8px;
  cursor: pointer;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: var(--amber);
    cursor: pointer;
  }
}

.adminToggleLabel {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);

  small {
    font-weight: 400;
    color: var(--text-secondary);
    font-size: 0.8rem;
  }
}
```

**Step 7: Verificar build**
```bash
npm run build 2>&1 | tail -5
```

**Step 8: Commit**
```bash
git add src/frontend/pages/Permissoes/Permissoes.tsx src/frontend/pages/Permissoes/Permissoes.module.scss
git commit -m "feat: add admin toggle, unit selector and isAdmin save to permissions page"
```

---

### Task 8: Push final e rebuild Docker

**Step 1: Push para o repositório**
```bash
git push
```

**Step 2: Rebuild Docker local**
```bash
cd "c:/Users/filip/OneDrive/Área de Trabalho/ideias/Soul540"
docker compose down && docker compose up --build -d
```

**Step 3: Verificar containers rodando**
```bash
docker compose ps
```
Expected: `soul540-api-1` e `soul540-web-1` com status `Up`
