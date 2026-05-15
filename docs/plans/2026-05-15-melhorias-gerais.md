# Melhorias Gerais — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementar melhorias de contrato, financeiro, eventos e interface conforme spec do usuário.

**Architecture:** Mudanças distribuídas em 4 áreas: (1) Contratos — novos campos no schema e formulário, (2) Financeiro — defaults, labels e escopo fábrica, (3) Eventos — filtro por data, (4) Interface — renomeação e reorganização do menu.

**Tech Stack:** TypeScript, React, Mongoose, SCSS modules. Sistemas: `src/frontend` (Principal/Sorocaba), `franchise/src` (Campinas), `factory/src` (Fábrica).

---

## Task 1: Contratos — Novos campos no schema backend

**Files:**
- Modify: `server/routes/contracts.ts`

**Step 1: Adicionar novos campos no schema Mongoose**

Localizar o bloco `createTenantModels('Contract', {` (linha 4) e adicionar os campos abaixo logo após `menuId` (linha 29):

```typescript
  paid: { type: Boolean, default: false },
  noticeHours: { type: Number, default: 1 },
  serviceObservation: { type: String, default: '' },
  paymentObservation: { type: String, default: '' },
  lateFeePercent: { type: Number, default: 30 },
  lateFeeHours: { type: Number, default: 48 },
  additionalServicesObservation: { type: String, default: '' },
```

Também alterar `pizzaTeam` e `drinksTeam` de `String` para `Number`:

```typescript
  // Antes:
  pizzaTeam: { type: String, default: '' },
  drinksTeam: { type: String, default: '' },
  // Depois:
  pizzaTeam: { type: Number, default: 0 },
  drinksTeam: { type: Number, default: 0 },
```

**Step 2: Verificar servidor sobe sem erros**

```bash
cd server && npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add server/routes/contracts.ts
git commit -m "feat(contracts): add paid, noticeHours, serviceObservation, paymentObservation, lateFee fields"
```

---

## Task 2: Contratos — Atualizar tipo `Contract` em `ContractDocument.tsx`

**Files:**
- Modify: `src/frontend/pages/Contratos/ContractDocument.tsx` (linhas 8–37)

**Step 1: Adicionar novos campos na interface `Contract`**

Localizar o bloco `export type Contract = {` e adicionar após `menuId?: string;` (linha 36):

```typescript
  paid?: boolean;
  noticeHours?: number;
  serviceObservation?: string;
  paymentObservation?: string;
  lateFeePercent?: number;
  lateFeeHours?: number;
  additionalServicesObservation?: string;
```

Também alterar tipos de `pizzaTeam` e `drinksTeam`:

```typescript
  // Antes:
  pizzaTeam?: string;
  drinksTeam?: string;
  // Depois:
  pizzaTeam?: number;
  drinksTeam?: number;
```

**Step 2: Commit**

```bash
git add src/frontend/pages/Contratos/ContractDocument.tsx
git commit -m "feat(contracts): update Contract type with new fields"
```

---

## Task 3: Contratos — Formulário principal (main system)

**Files:**
- Modify: `src/frontend/pages/Contratos/Contratos.tsx`

**Step 1: Adicionar novos campos no `FormData` type (linha 17)**

Adicionar após `menuId: string;` (linha 42):

```typescript
  paid: boolean;
  noticeHours: string;
  serviceObservation: string;
  paymentObservation: string;
  lateFeePercent: string;
  lateFeeHours: string;
  additionalServicesObservation: string;
```

Alterar tipos de `pizzaTeam` e `drinksTeam` — manter como `string` no form (input number retorna string).

**Step 2: Atualizar `emptyForm` (linha 45)**

Adicionar após `menuId: '',`:

```typescript
  paid: false,
  noticeHours: '1',
  serviceObservation: '',
  paymentObservation: '',
  lateFeePercent: '30',
  lateFeeHours: '48',
  additionalServicesObservation: '',
```

**Step 3: Atualizar `openEdit` para mapear novos campos (linha 87)**

Adicionar após `menuId: c.menuId || '',`:

```typescript
  paid: c.paid ?? false,
  noticeHours: c.noticeHours?.toString() || '1',
  serviceObservation: c.serviceObservation || '',
  paymentObservation: c.paymentObservation || '',
  lateFeePercent: c.lateFeePercent?.toString() || '30',
  lateFeeHours: c.lateFeeHours?.toString() || '48',
  additionalServicesObservation: c.additionalServicesObservation || '',
```

Também converter pizzaTeam/drinksTeam de number para string no form:

```typescript
  pizzaTeam: c.pizzaTeam?.toString() || '',
  drinksTeam: c.drinksTeam?.toString() || '',
```

**Step 4: Atualizar `handleSubmit` para enviar novos campos**

Na função `handleSubmit`, ao montar o payload, incluir:

```typescript
  paid: form.paid,
  noticeHours: Number(form.noticeHours) || 1,
  serviceObservation: form.serviceObservation,
  paymentObservation: form.paymentObservation,
  lateFeePercent: Number(form.lateFeePercent) || 30,
  lateFeeHours: Number(form.lateFeeHours) || 48,
  additionalServicesObservation: form.additionalServicesObservation,
  pizzaTeam: Number(form.pizzaTeam) || 0,
  drinksTeam: Number(form.drinksTeam) || 0,
```

**Step 5: Atualizar formulário HTML — seção Precificação**

Na seção `Precificação` (linha ~297), adicionar logo abaixo do campo `Valor Total` e antes de `Mínimo de Convidados`:

```tsx
<div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
  <label className={styles.label}>
    <input
      type="checkbox"
      checked={form.paid}
      onChange={(e) => setForm({ ...form, paid: e.target.checked })}
      style={{ marginRight: 8 }}
    />
    Já foi pago?
  </label>
</div>
<div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
  <label className={styles.label}>Observação de Pagamento</label>
  <textarea
    className={styles.input}
    value={form.paymentObservation}
    onChange={(e) => setForm({ ...form, paymentObservation: e.target.value })}
    placeholder="Informações sobre condições ou status do pagamento..."
    rows={2}
    style={{ resize: 'vertical' }}
  />
</div>
```

**Step 6: Atualizar seção Serviço — serviceType como select + livre**

Substituir o campo `Sistema de Servico` (linha ~342–345):

```tsx
{/* Antes — campo livre: */}
<div className={styles.formGroup}>
  <label className={styles.label}>Sistema de Servico</label>
  <input className={styles.input} value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} placeholder="self service e coquetel" />
</div>

{/* Depois — select + custom: */}
<div className={styles.formGroup}>
  <label className={styles.label}>Sistema de Servico</label>
  <select
    className={styles.input}
    value={['self service e coquetel', 'volante pizza', ''].includes(form.serviceType) ? form.serviceType : 'outro'}
    onChange={(e) => setForm({ ...form, serviceType: e.target.value === 'outro' ? '' : e.target.value })}
  >
    <option value="self service e coquetel">Self service e coquetel</option>
    <option value="volante pizza">Volante pizza</option>
    <option value="outro">Outros (preencher abaixo)</option>
  </select>
  {!['self service e coquetel', 'volante pizza'].includes(form.serviceType) && (
    <input
      className={styles.input}
      style={{ marginTop: 6 }}
      value={form.serviceType}
      onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
      placeholder="Descreva o sistema de serviço..."
    />
  )}
</div>
```

**Step 7: Atualizar campos Equipe das Pizzas / Equipe de Bebidas para número**

Substituir campos `pizzaTeam` e `drinksTeam` (linhas ~354–361):

```tsx
<div className={styles.formGroup}>
  <label className={styles.label}>Qtd. Colaboradores Pizza</label>
  <input
    className={styles.input}
    type="number"
    min="0"
    value={form.pizzaTeam}
    onChange={(e) => setForm({ ...form, pizzaTeam: e.target.value })}
    placeholder="0"
  />
</div>
<div className={styles.formGroup}>
  <label className={styles.label}>Qtd. Colaboradores Bebidas</label>
  <input
    className={styles.input}
    type="number"
    min="0"
    value={form.drinksTeam}
    onChange={(e) => setForm({ ...form, drinksTeam: e.target.value })}
    placeholder="0"
  />
</div>
```

**Step 8: Adicionar campo Observação do Serviço + Antecedência + Multa na seção Serviço**

Após os campos de equipe (após drinksTeam), adicionar:

```tsx
<div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
  <label className={styles.label}>Observação do Serviço</label>
  <textarea
    className={styles.input}
    value={form.serviceObservation}
    onChange={(e) => setForm({ ...form, serviceObservation: e.target.value })}
    placeholder="Detalhes adicionais sobre o serviço, logística, restrições..."
    rows={3}
    style={{ resize: 'vertical' }}
  />
</div>
<div className={styles.formGroup}>
  <label className={styles.label}>Antecedência para lembrete (horas)</label>
  <input
    className={styles.input}
    type="number"
    min="0"
    value={form.noticeHours}
    onChange={(e) => setForm({ ...form, noticeHours: e.target.value })}
    placeholder="1"
  />
</div>
<div className={styles.formGroup}>
  <label className={styles.label}>Multa por atraso (%)</label>
  <input
    className={styles.input}
    type="number"
    min="0"
    value={form.lateFeePercent}
    onChange={(e) => setForm({ ...form, lateFeePercent: e.target.value })}
    placeholder="30"
  />
</div>
<div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
  <label className={styles.label} style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
    Multa aplicada caso o pagamento não ocorra até {form.lateFeeHours}h após o evento.
  </label>
  <input
    className={styles.input}
    type="number"
    min="0"
    value={form.lateFeeHours}
    onChange={(e) => setForm({ ...form, lateFeeHours: e.target.value })}
    placeholder="48"
  />
</div>
```

**Step 9: Alterar campo `additionalServices` de input para textarea**

Substituir o campo `Serviços Adicionais` (linha ~316–319):

```tsx
{/* Antes: */}
<input className={styles.input} value={form.additionalServices} ... />

{/* Depois: */}
<textarea
  className={styles.input}
  value={form.additionalServices}
  onChange={(e) => setForm({ ...form, additionalServices: e.target.value })}
  placeholder="Descreva serviços extras e valores..."
  rows={3}
  style={{ resize: 'vertical' }}
/>
```

E logo abaixo, adicionar campo de observação dos serviços adicionais:

```tsx
<div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
  <label className={styles.label}>Observação dos Serviços Adicionais</label>
  <textarea
    className={styles.input}
    value={form.additionalServicesObservation}
    onChange={(e) => setForm({ ...form, additionalServicesObservation: e.target.value })}
    placeholder="Detalhes, condições ou observações sobre os serviços adicionais..."
    rows={2}
    style={{ resize: 'vertical' }}
  />
</div>
```

**Step 10: Verificar build**

```bash
cd src && npx tsc --noEmit
```

**Step 11: Commit**

```bash
git add src/frontend/pages/Contratos/Contratos.tsx
git commit -m "feat(contratos): add paid, noticeHours, serviceObservation, paymentObservation, late fee, textarea fields"
```

---

## Task 4: Contratos — Espelhar mudanças no sistema Franquia

**Files:**
- Modify: `franchise/src/pages/Contratos/Contratos.tsx`

Aplicar exatamente as mesmas alterações dos Steps 1–11 da Task 3, adaptando imports para o contexto da franquia (ex: `useApp` pode ter path diferente — verificar import atual no arquivo).

**Step 1: Verificar e aplicar todas as mudanças**

Abrir `franchise/src/pages/Contratos/Contratos.tsx` e aplicar mesmas alterações:
- `FormData` type — novos campos
- `emptyForm` — novos defaults
- `openEdit` — mapear novos campos
- `handleSubmit` — enviar novos campos
- HTML do formulário — todos os novos inputs/textareas

**Step 2: Verificar build da franquia**

```bash
cd franchise && npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add franchise/src/pages/Contratos/Contratos.tsx
git commit -m "feat(contratos/franchise): mirror contract form improvements"
```

---

## Task 5: Financeiro (main) — Default "Custo", categorias alfabéticas, "Consolidado"

**Files:**
- Modify: `src/frontend/pages/Financeiro/Financeiro.tsx`

**Step 1: Alterar default do `formType` para 'cost'**

Localizar linha 78:

```typescript
// Antes:
const [formType, setFormType] = useState<FinanceType>('revenue');
// Depois:
const [formType, setFormType] = useState<FinanceType>('cost');
```

**Step 2: Ordenar categorias alfabeticamente**

Localizar `formCategories` (linha ~47):

```typescript
// Antes:
const formCategories: Record<FinanceType, string[]> = {
  revenue: ['contrato', 'adicional', 'taxa', 'outro'],
  cost: [...FIXED_CATEGORIES, ...VARIABLE_CATEGORIES],
};

// Depois:
const formCategories: Record<FinanceType, string[]> = {
  revenue: ['adicional', 'contrato', 'outro', 'taxa'],
  cost: [...FIXED_CATEGORIES, ...VARIABLE_CATEGORIES].sort((a, b) => a.localeCompare(b, 'pt')),
};
```

**Step 3: Renomear "Combinado" para "Consolidado"**

Localizar linha ~392 com o texto `Combinado`:

```tsx
// Antes:
>Combinado</button>

// Depois:
>Consolidado</button>
```

Atualizar também o `title` do botão:

```tsx
// Antes:
title="Exibir dados do principal + franquia"
// Depois:
title="Exibir dados consolidados (principal + campinas + fábrica)"
```

**Step 4: Verificar build**

```bash
cd src && npx tsc --noEmit
```

**Step 5: Commit**

```bash
git add src/frontend/pages/Financeiro/Financeiro.tsx
git commit -m "feat(financeiro): default cost type, alphabetical categories, rename Combinado→Consolidado"
```

---

## Task 6: Financeiro (main) — Incluir dados da fábrica no escopo

**Files:**
- Modify: `src/frontend/pages/Financeiro/Financeiro.tsx`

**Step 1: Adicionar estado para dados da fábrica**

Após `const [franchiseEvents, setFranchiseEvents] = useState...` (linha ~63), adicionar:

```typescript
const [factoryFinances, setFactoryFinances] = useState<typeof finances>([]);
const [factoryEvents, setFactoryEvents] = useState<typeof events>([]);
```

**Step 2: Atualizar `DataScope` type**

```typescript
// Antes:
type DataScope = 'main' | 'franchise' | 'combined';
// Depois:
type DataScope = 'main' | 'franchise' | 'factory' | 'combined';
```

**Step 3: Atualizar useEffect de busca de dados externos**

Substituir o useEffect atual (linha ~87) por:

```typescript
useEffect(() => {
  if (dataScope === 'main') {
    setFranchiseFinances([]); setFranchiseEvents([]);
    setFactoryFinances([]); setFactoryEvents([]);
    return;
  }
  if (dataScope === 'franchise' || dataScope === 'combined') {
    const h: HeadersInit = { 'X-System': 'franchise' };
    fetch('/api/finances', { headers: h, credentials: 'include' }).then(r => r.json()).then(d => Array.isArray(d) && setFranchiseFinances(d)).catch(() => {});
    fetch('/api/events',   { headers: h, credentials: 'include' }).then(r => r.json()).then(d => Array.isArray(d) && setFranchiseEvents(d)).catch(() => {});
  }
  if (dataScope === 'factory' || dataScope === 'combined') {
    const h: HeadersInit = { 'X-System': 'factory' };
    fetch('/api/finances', { headers: h, credentials: 'include' }).then(r => r.json()).then(d => Array.isArray(d) && setFactoryFinances(d)).catch(() => {});
    fetch('/api/events',   { headers: h, credentials: 'include' }).then(r => r.json()).then(d => Array.isArray(d) && setFactoryEvents(d)).catch(() => {});
  }
}, [dataScope]);
```

**Step 4: Atualizar `activeFinances` e `activeEvents` useMemos**

```typescript
const activeFinances = useMemo(() => {
  if (dataScope === 'franchise') return franchiseFinances;
  if (dataScope === 'factory')   return factoryFinances;
  if (dataScope === 'combined')  return [...finances, ...franchiseFinances, ...factoryFinances];
  return finances;
}, [finances, franchiseFinances, factoryFinances, dataScope]);

const activeEvents = useMemo(() => {
  if (dataScope === 'franchise') return franchiseEvents;
  if (dataScope === 'factory')   return factoryEvents;
  if (dataScope === 'combined')  return [...events, ...franchiseEvents, ...factoryEvents];
  return events.length > 0 ? events : directEvents;
}, [events, franchiseEvents, factoryEvents, dataScope, directEvents]);
```

**Step 5: Adicionar botão "Fábrica" no grupo de scope buttons**

Localizar os botões de scope (próximo a "Franquia" e "Consolidado"), adicionar após o botão "Franquia":

```tsx
<button
  className={`${styles.scopeBtn} ${dataScope === 'factory' ? styles.scopeBtnActive : ''}`}
  onClick={() => setDataScope('factory')}
  title="Exibir apenas dados da fábrica"
>
  Fábrica
</button>
```

**Step 6: Verificar build**

```bash
cd src && npx tsc --noEmit
```

**Step 7: Commit**

```bash
git add src/frontend/pages/Financeiro/Financeiro.tsx
git commit -m "feat(financeiro): add factory data scope"
```

---

## Task 7: Dashboard — Botão "Novo Lançamento" nos 3 sistemas

Os 3 sistemas precisam de um botão de atalho no Dashboard para criar um lançamento de **custo** diretamente.

**Files:**
- Modify: `src/frontend/pages/Dashboard/Dashboard.tsx`
- Modify: `franchise/src/pages/Dashboard/Dashboard.tsx`
- Modify: `factory/src/pages/Dashboard/Dashboard.tsx`

**Step 1: Main Dashboard — adicionar botão de atalho**

No componente Dashboard do sistema principal (`src/frontend/pages/Dashboard/Dashboard.tsx`), importar `useNavigate` do react-router-dom (se não estiver) e adicionar um botão de ação rápida.

Localizar o JSX da página e adicionar onde ficam os controles do header (próximo ao título ou ao filtro de unidade):

```tsx
// Adicionar import se não existir:
import { useNavigate } from 'react-router-dom';

// No componente, adicionar:
const navigate = useNavigate();

// No JSX, adicionar botão (ex: ao lado dos filtros de unidade):
<button
  className={styles.btnNewEntry}
  onClick={() => navigate('/financeiro?action=new&type=cost')}
  title="Lançar nova despesa"
>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  Lançar Despesa
</button>
```

**Step 2: Adicionar estilo `btnNewEntry` no `Dashboard.module.scss`**

```scss
.btnNewEntry {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 8px;
  color: #fbbf24;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(251, 191, 36, 0.22); }
}
```

**Step 3: Financeiro — consumir query param `?action=new&type=cost`**

Em `src/frontend/pages/Financeiro/Financeiro.tsx`, adicionar no início do componente:

```typescript
import { useSearchParams } from 'react-router-dom';

// Dentro do componente:
const [searchParams, setSearchParams] = useSearchParams();

useEffect(() => {
  if (searchParams.get('action') === 'new') {
    const type = searchParams.get('type') as FinanceType | null;
    if (type) setFormType(type);
    setShowForm(true);
    setSearchParams({});  // limpa params da URL
  }
}, []);
```

**Step 4: Repetir Step 1–2 para Franchise Dashboard**

Aplicar mesmas mudanças em `franchise/src/pages/Dashboard/Dashboard.tsx` e `franchise/src/pages/Dashboard/Dashboard.module.scss`.

**Step 5: Repetir Step 1–2 para Factory Dashboard**

Aplicar mesmas mudanças em `factory/src/pages/Dashboard/Dashboard.tsx` e `factory/src/pages/Dashboard/Dashboard.module.scss`.

Para factory e franchise, o botão navega para `/financeiro?action=new&type=cost` igualmente, mas a página Financeiro de cada sistema precisa consumir o mesmo query param. Verificar se `factory/src/pages/Financeiro/Financeiro.tsx` e `franchise/src/pages/Financeiro/Financeiro.tsx` têm a lógica de `showForm`/`formType` — adicionar o mesmo `useEffect` de query param neles também.

**Step 6: Verificar builds**

```bash
cd src && npx tsc --noEmit
cd franchise && npx tsc --noEmit
cd factory && npx tsc --noEmit
```

**Step 7: Commit**

```bash
git add src/frontend/pages/Dashboard/ franchise/src/pages/Dashboard/ factory/src/pages/Dashboard/
git add src/frontend/pages/Financeiro/Financeiro.tsx franchise/src/pages/Financeiro/ factory/src/pages/Financeiro/
git commit -m "feat(dashboard): add quick 'Lançar Despesa' button on all 3 systems"
```

---

## Task 8: Eventos — Filtro por data

**Files:**
- Modify: `src/frontend/pages/Eventos/Eventos.tsx`

O sistema atual já tem filtro de busca por texto e por source (main/franchise). Adicionar filtro por data.

**Step 1: Adicionar estado de filtro de data**

Após os estados de search/filter existentes:

```typescript
const [dateFilter, setDateFilter] = useState('');  // formato: 'YYYY-MM-DD'
```

**Step 2: Incluir data no filtro de eventos**

Localizar o useMemo/filter que filtra eventos (próximo a `filtered`). Adicionar condição de data:

```typescript
// Adicionar na lógica de filtragem existente:
if (dateFilter && event.startDate && !event.startDate.startsWith(dateFilter)) return false;
```

**Step 3: Adicionar input de data na barra de filtros do JSX**

Junto ao campo de busca existente, adicionar:

```tsx
<input
  type="date"
  className={styles.filterDate}
  value={dateFilter}
  onChange={(e) => setDateFilter(e.target.value)}
  title="Filtrar por data"
/>
{dateFilter && (
  <button
    className={styles.clearDateBtn}
    onClick={() => setDateFilter('')}
    title="Limpar filtro de data"
  >
    ✕
  </button>
)}
```

**Step 4: Adicionar estilos em `Eventos.module.scss`**

```scss
.filterDate {
  background: $surface-secondary;
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  color: $text-primary;
  padding: 7px 10px;
  font-size: $font-size-sm;
  cursor: pointer;
  &:focus { outline: none; border-color: $accent-color; }
}

.clearDateBtn {
  background: transparent;
  border: none;
  color: $text-muted;
  cursor: pointer;
  padding: 4px 6px;
  font-size: 0.75rem;
  border-radius: 4px;
  &:hover { color: $text-primary; background: $surface-secondary; }
}
```

**Step 5: Verificar build**

```bash
cd src && npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add src/frontend/pages/Eventos/
git commit -m "feat(eventos): add date filter"
```

---

## Task 9: Interface — Reorganizar sidebar e renomear labels (main system)

**Files:**
- Modify: `src/frontend/components/Sidebar/Sidebar.tsx`
- Modify: `src/frontend/pages/Dashboard/Dashboard.tsx`
- Modify: `src/frontend/pages/Financeiro/Financeiro.tsx`

**Step 1: Mover "Franquias" para abaixo do Dashboard na sidebar**

Em `src/frontend/components/Sidebar/Sidebar.tsx`, localizar o grupo `Expansão` (linha ~171) com o item `Franquias`. Mover esse grupo para logo após o grupo `Principal` (linha ~19), ficando:

```typescript
const navGroups: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { path: ROUTES.DASHBOARD, permKey: 'dashboard', label: 'Dashboard', icon: ... },
    ],
  },
  {
    label: 'Expansão',  // <-- movido para cá
    items: [
      { path: ROUTES.FRANQUIAS, permKey: 'franquias', label: 'Campinas', icon: ... },
    ],
  },
  {
    label: 'Gestão',
    // ...
  },
  // ... demais grupos sem o grupo Expansão antigo
];
```

Também alterar o label do item `Franquias` → `Campinas`:

```typescript
// Antes:
label: 'Franquias',
// Depois:
label: 'Campinas',
```

**Step 2: Renomear grupo "Principal" → "Sorocaba" na sidebar**

```typescript
// Antes:
{ label: 'Principal', items: [...] }
// Depois:
{ label: 'Sorocaba', items: [...] }
```

**Step 3: Renomear filtros no Dashboard — "Principal" → "Sorocaba", "Franquia" → "Campinas"**

Em `src/frontend/pages/Dashboard/Dashboard.tsx`, localizar os botões de filtro de unidade (linhas ~77–95):

```tsx
// Antes:
>Principal<
>Franquia<
// Depois:
>Sorocaba<
>Campinas<
```

Também atualizar os valores de estado/comparação correspondentes se usarem strings "principal"/"franquia" — verificar e manter consistência com o valor real do campo (provavelmente `unit` = 'main'/'franchise', apenas o label muda).

**Step 4: Renomear botões de scope no Financeiro — "Franquia" → "Campinas"**

Em `src/frontend/pages/Financeiro/Financeiro.tsx`, localizar botão com label `Franquia` (linha ~385):

```tsx
// Antes:
>Franquia</button>
// Depois:
>Campinas</button>
```

Também atualizar `title` do botão:

```tsx
// Antes:
title="Exibir apenas dados da franquia"
// Depois:
title="Exibir apenas dados de Campinas"
```

**Step 5: Verificar build**

```bash
cd src && npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add src/frontend/components/Sidebar/Sidebar.tsx
git add src/frontend/pages/Dashboard/Dashboard.tsx
git add src/frontend/pages/Financeiro/Financeiro.tsx
git commit -m "feat(ui): rename Principal→Sorocaba, Franquia→Campinas, move Campinas below dashboard in sidebar"
```

---

## Task 10: Interface — Renomear labels na sidebar da Franquia

**Files:**
- Modify: `franchise/src/components/Sidebar/Sidebar.tsx`

**Step 1: Renomear grupo "Principal" → "Campinas"**

```typescript
// Antes:
{ label: 'Principal', items: [...] }
// Depois:
{ label: 'Campinas', items: [...] }
```

**Step 2: Commit**

```bash
git add franchise/src/components/Sidebar/Sidebar.tsx
git commit -m "feat(ui/franchise): rename sidebar Principal→Campinas"
```

---

## Checklist de verificação final

Após todas as tasks:

- [ ] Criar contrato com "Já foi pago?" marcado → campo salvo no banco
- [ ] Criar contrato com `serviceType = "volante pizza"` → aparece no documento
- [ ] Criar contrato com tipo "Outros" → campo de texto aparece
- [ ] Equipe das Pizzas e Bebidas aceitam apenas números
- [ ] Campo de serviços adicionais é textarea redimensionável
- [ ] Financeiro abre com "Custo" pré-selecionado
- [ ] Categorias aparecem em ordem alfabética
- [ ] Botão "Consolidado" substituiu "Combinado"
- [ ] Botão "Fábrica" aparece e carrega dados da fábrica
- [ ] Botão "Lançar Despesa" no Dashboard abre formulário Financeiro com tipo "custo"
- [ ] Filtro por data em Eventos funciona
- [ ] Sidebar principal: "Sorocaba" no lugar de "Principal", "Campinas" abaixo do Dashboard
- [ ] Sidebar franquia: "Campinas" no lugar de "Principal"
- [ ] Dashboard principal: filtros mostram "Sorocaba" e "Campinas"
