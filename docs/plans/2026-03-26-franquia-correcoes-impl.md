# Correções Sistema Franquia – Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Sincronizar o sistema de franquia com o principal: menuId no contrato, cardápios e contratos nas permissões, card de adicionar insumos, e melhorias na página de permissões.

**Architecture:** Todas as mudanças são exclusivamente no frontend da franquia (`franchise/src/`). Sem novos endpoints. O backend já suporta `menuId` no schema de contratos. A franquia tem seu próprio `SOUL540_MENUS` em `Cardapios.tsx` — vamos extrair para arquivo compartilhado dentro da franquia.

**Tech Stack:** React + TypeScript, SCSS Modules (Sass `$variables`), Vite

---

### Task 1: Extrair SOUL540_MENUS para arquivo compartilhado na franquia

**Files:**
- Create: `franchise/src/data/soul540Menus.ts`
- Modify: `franchise/src/pages/Cardapios/Cardapios.tsx`

**Step 1: Ler Cardapios.tsx para copiar os tipos e array**

Leia `franchise/src/pages/Cardapios/Cardapios.tsx` e localize:
- `type StaticItem`, `type StaticCategory`, `type StaticMenu` (linhas ~12–14)
- `const SOUL540_MENUS: StaticMenu[]` (linha ~16 até o fim da constante)

**Step 2: Criar `franchise/src/data/soul540Menus.ts`**

```typescript
// franchise/src/data/soul540Menus.ts
export type StaticItem = { name: string; subtitle?: string; description: string; harmonization?: string; };
export type StaticCategory = { name: string; items: StaticItem[]; };
export type StaticMenu = { id: string; name: string; tagline: string; obs?: string; categories: StaticCategory[]; };

export const SOUL540_MENUS: StaticMenu[] = [
  // (copiar array completo de Cardapios.tsx)
];
```

**Step 3: Atualizar Cardapios.tsx**

Remover os tipos e a constante local, adicionar import:
```typescript
import { SOUL540_MENUS, type StaticMenu, type StaticCategory } from '@/data/soul540Menus';
```

**Step 4: Verificar build**
```bash
cd "c:/Users/filip/OneDrive/Área de Trabalho/ideias/Soul540"
npm run build:franchise 2>&1 | tail -10
```
Expected: sem erros TypeScript

**Step 5: Commit**
```bash
git add franchise/src/data/soul540Menus.ts franchise/src/pages/Cardapios/Cardapios.tsx
git commit -m "refactor(franchise): extract SOUL540_MENUS to shared data file

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Contratos – menuId no formulário

**Files:**
- Modify: `franchise/src/pages/Contratos/Contratos.tsx`

**Step 1: Adicionar `menuId` ao FormData e emptyForm**

No tipo `FormData` (após `terms`), adicionar:
```typescript
menuId: string;
```

No `emptyForm` (após `terms: ''`), adicionar:
```typescript
menuId: '',
```

**Step 2: Adicionar import de SOUL540_MENUS**

No topo do arquivo:
```typescript
import { SOUL540_MENUS } from '@/data/soul540Menus';
```

**Step 3: Adicionar `menuId` em `openEdit`**

No bloco `openEdit` (após `terms: c.terms || ''`), adicionar:
```typescript
menuId: c.menuId || '',
```

**Step 4: Adicionar `menuId` em `handleSubmit`**

No objeto `data` (após `terms: form.terms || ''`), adicionar:
```typescript
menuId: form.menuId || '',
```

**Step 5: Adicionar campo select no modal**

Na seção "Serviço" do modal (localizar `{/* Serviço */}` e a `<div className={styles.formSectionLabel}>Serviço</div>`), adicionar ANTES dos campos de serviço:

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

**Step 6: Verificar build**
```bash
npm run build:franchise 2>&1 | tail -10
```

**Step 7: Commit**
```bash
git add franchise/src/pages/Contratos/Contratos.tsx
git commit -m "feat(franchise): add menu selection field to contract form

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Contratos – Anexo I dinâmico no PDF

**Files:**
- Modify: `franchise/src/pages/Contratos/ContractDocument.tsx`

**Step 1: Adicionar `menuId` ao tipo `Contract`**

No tipo `Contract` (após `drinksTeam?`), adicionar:
```typescript
menuId?: string;
```

**Step 2: Adicionar import de SOUL540_MENUS**

No topo do arquivo, após os imports existentes:
```typescript
import { SOUL540_MENUS, type StaticMenu } from '@/data/soul540Menus';
```

**Step 3: Substituir o Anexo I estático pelo dinâmico**

Localizar o bloco `{/* ——— ANEXO I – CARDÁPIO ——— */}` (linha ~434) até o `</div>` de fechamento do `.annex`. Substituir **todo** esse bloco por:

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
                      <td>
                        {item.name}
                        {item.subtitle ? <><br /><em style={{ fontSize: '0.85em', color: '#666' }}>{item.subtitle}</em></> : null}
                      </td>
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

    // Cardápio genérico padrão
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
            <tr><td>MOZZARELLA SPECIALI</td><td>Massa, molho de tomate, mussarela, tomate em pedaços, azeitona, parmesão, manjericão, azeite e orégano</td></tr>
            <tr><td>SEM GLUTEN</td><td>Massa especial sem glúten com recheios disponíveis no mise en place</td></tr>
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

**IMPORTANT:** The emoji characters (`📋`, `🥖`, `🍕`, `🍫`) in the original annexTitle and annexSection divs must be removed — use plain text only (the new block already uses plain text).

**Step 4: Verificar build**
```bash
npm run build:franchise 2>&1 | tail -10
```

**Step 5: Commit**
```bash
git add franchise/src/pages/Contratos/ContractDocument.tsx
git commit -m "feat(franchise): dynamic Annex I in contract PDF based on selected menu

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 4: Est. Insumos – Card de adicionar

**Files:**
- Modify: `franchise/src/pages/EstoqueInsumos/EstoqueInsumos.tsx`
- Modify: `franchise/src/pages/EstoqueInsumos/EstoqueInsumos.module.scss`

**Step 1: Adicionar card no grid em EstoqueInsumos.tsx**

Ler o arquivo para localizar o `<div className={styles.grid}>`. Após o `.map(...)` de suprimentos e ANTES do `</div>` de fechamento do grid, adicionar:

```tsx
<button className={styles.cardAdd} onClick={openCreate}>
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
  <span>Novo Insumo</span>
</button>
```

**Step 2: Adicionar `.cardAdd` no SCSS**

Ler o SCSS para verificar convenção de variáveis (usa `$border`, `$accent`, etc.). Adicionar ao final:

```scss
.cardAdd {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 2px dashed $border;
  border-radius: $radius-md;
  background: transparent;
  color: $text-secondary;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  min-height: 160px;
  transition: border-color $transition-fast, color $transition-fast;

  &:hover {
    border-color: $accent;
    color: $accent;
  }
}
```

Se o arquivo usar nomes diferentes de variáveis, adaptar conforme o padrão existente.

**Step 3: Verificar build**
```bash
npm run build:franchise 2>&1 | tail -10
```

**Step 4: Commit**
```bash
git add franchise/src/pages/EstoqueInsumos/EstoqueInsumos.tsx franchise/src/pages/EstoqueInsumos/EstoqueInsumos.module.scss
git commit -m "feat(franchise): add quick-add card to supplies grid

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Permissões – Todas as melhorias

**Files:**
- Modify: `franchise/src/pages/Permissoes/Permissoes.tsx`
- Modify: `franchise/src/pages/Permissoes/Permissoes.module.scss`

**Step 1: Atualizar ALL_PAGES**

Substituir o `ALL_PAGES` atual por:
```typescript
const ALL_PAGES = [
  { group: 'Principal', items: [{ key: 'dashboard', label: 'Dashboard' }] },
  { group: 'Gestão', items: [
    { key: 'eventos', label: 'Eventos' },
    { key: 'tarefas', label: 'Tarefas' },
    { key: 'funcionarios', label: 'Funcionários' },
    { key: 'contratantes', label: 'Contratantes' },
    { key: 'contratos', label: 'Contratos' },
    { key: 'cardapios', label: 'Cardápios' },
  ]},
  { group: 'Financeiro', items: [
    { key: 'financeiro', label: 'Financeiro' },
  ]},
  { group: 'Operações', items: [
    { key: 'estoque-insumos', label: 'Est. Insumos' },
    { key: 'estoque-utensilios', label: 'Est. Utensílios' },
  ]},
  { group: 'Sistema', items: [
    { key: 'usuario', label: 'Minha Conta' },
    { key: 'permissoes', label: 'Permissões' },
  ]},
];
```

**Step 2: Atualizar emptyForm e AppUser type**

Substituir `emptyForm`:
```typescript
const emptyForm = { name: '', email: '', password: '', isAdmin: false, unit: 'franchise' };
```

Adicionar `unit?: string` ao tipo `AppUser`:
```typescript
type AppUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  permissions: string[];
  unit?: string;
  passwordPlain?: string;
};
```

**Step 3: Adicionar estado `draftIsAdmin`**

Após `const [draftPerms, setDraftPerms] = useState<string[]>([]);`, adicionar:
```typescript
const [draftIsAdmin, setDraftIsAdmin] = useState(false);
```

**Step 4: Atualizar `selectUser`**

```typescript
const selectUser = (u: AppUser) => {
  setSelected(u);
  setDraftPerms([...u.permissions]);
  setDraftIsAdmin(u.isAdmin);
};
```

**Step 5: Atualizar `toggleAll`**

```typescript
const toggleAll = () => {
  const isAllSelected = draftPerms.length === ALL_KEYS.length;
  setDraftPerms(isAllSelected ? [] : [...ALL_KEYS]);
  setDraftIsAdmin(!isAllSelected);
};
```

**Step 6: Atualizar `savePermissions`**

```typescript
const savePermissions = async () => {
  if (!selected) return;
  setSaving(true);
  const res = await apiFetch(`/api/users/${selected.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ permissions: draftPerms, isAdmin: draftIsAdmin }),
  });
  const updated = await res.json();
  setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  setSelected(updated);
  setDraftIsAdmin(updated.isAdmin);
  setSaving(false);
};
```

**Step 7: Atualizar `createUser`**

```typescript
const createUser = async () => {
  if (!form.name.trim() || !form.email.trim() || !form.password) return;
  const res = await apiFetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...form, unit: form.unit, permissions: form.isAdmin ? ALL_KEYS : [] }),
  });
  const created = await res.json();
  setUsers(prev => [...prev, created]);
  setForm(emptyForm);
  setShowModal(false);
};
```

**Step 8: Adicionar Admin toggle no painel direito (JSX)**

Dentro do branch `selected` (após `<>` e antes de `<div className={styles.permHeader}>`), adicionar:

```tsx
<label className={styles.adminToggleRow}>
  <input
    type="checkbox"
    checked={draftIsAdmin}
    onChange={(e) => {
      setDraftIsAdmin(e.target.checked);
      if (e.target.checked) {
        setDraftPerms([...ALL_KEYS]);
      } else {
        setDraftPerms([]);
      }
    }}
  />
  <span className={styles.adminToggleLabel}>
    Administrador
    <small> — acesso total + tela de Permissões</small>
  </span>
</label>
```

**Step 9: Adicionar campo "Sistema" no modal de novo usuário**

No modal (após o `<label className={styles.checkboxLabel}>` do Admin), adicionar:

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

**Step 10: Adicionar estilos no Permissoes.module.scss**

Ler o SCSS para confirmar o padrão de variáveis. Adicionar ao final:

```scss
.adminToggleRow {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0 16px;
  border-bottom: 1px solid $border;
  margin-bottom: 8px;
  cursor: pointer;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: $accent;
    cursor: pointer;
  }
}

.adminToggleLabel {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $text-primary;

  small {
    font-weight: $font-weight-normal;
    color: $text-muted;
    font-size: $font-size-xs;
  }
}
```

**Step 11: Verificar build**
```bash
npm run build:franchise 2>&1 | tail -10
```

**Step 12: Commit**
```bash
git add franchise/src/pages/Permissoes/Permissoes.tsx franchise/src/pages/Permissoes/Permissoes.module.scss
git commit -m "feat(franchise): permissions page — admin toggle, unit selector, contratos/cardapios pages

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 6: Push e rebuild Docker

**Step 1: Push**
```bash
cd "c:/Users/filip/OneDrive/Área de Trabalho/ideias/Soul540"
git push
```

**Step 2: Rebuild Docker**
```bash
docker compose down && docker compose up --build -d 2>&1 | tail -10
```

**Step 3: Verificar containers**
```bash
docker compose ps
```
Expected: `soul540-api-1` e `soul540-web-1` com status `Up`
