# Filtro Financeiro Conta Azul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar um único filtro de período no padrão Conta Azul, aplicado integralmente aos três Financeiros.

**Architecture:** A regra de intervalos fica em `shared/financePeriod.ts` e o controle React reutilizável em `shared/FinancePeriodFilter.tsx`. Cada portal mantém apenas o estado do intervalo e filtra finanças e eventos pela mesma função compartilhada.

**Tech Stack:** React 18, TypeScript, SCSS Modules, Node test runner via `tsx`.

## Global Constraints

- Abrir em `Este mês` e usar datas no fuso `America/Sao_Paulo`.
- Filtrar por `finance.date` em competência; sinais pagos já usam a data do sinal.
- Aplicar o intervalo a cards, gráficos, tabelas, eventos e painel de período.
- Remover filtros de mês, ano e data concorrentes das três telas.
- Não alterar dados financeiros ou regras de baixa.

---

### Task 1: Regra compartilhada de período

**Files:**
- Create: `shared/financePeriod.ts`
- Test: `shared/__tests__/financePeriod.test.ts`

**Interfaces:**
- Produces: `FinancePeriod`, `FinancePeriodPreset`, `getFinancePeriodForPreset`, `getInitialFinancePeriod`, `getShiftedFinancePeriod`, `matchesFinancePeriod`, `formatFinancePeriodLabel`.

- [ ] **Step 1: Write the failing test**

```ts
assert.deepEqual(getFinancePeriodForPreset('this_month', '2026-08-12'), {
  preset: 'this_month', start: '2026-08-01', end: '2026-08-12',
});
assert.equal(matchesFinancePeriod('2026-08-12', period), true);
assert.equal(matchesFinancePeriod('2026-08-13', period), false);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\node_modules\.bin\tsx.cmd --test shared\__tests__\financePeriod.test.ts`

- [ ] **Step 3: Write minimal implementation**

```ts
export type FinancePeriod = { preset: FinancePeriodPreset; start: string; end: string };
export function matchesFinancePeriod(date: string, period: FinancePeriod) {
  return isDateOnly(date) && (!period.start || date >= period.start) && (!period.end || date <= period.end);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.\node_modules\.bin\tsx.cmd --test shared\__tests__\financePeriod.test.ts`

### Task 2: Controle visual reutilizável

**Files:**
- Create: `shared/FinancePeriodFilter.tsx`
- Create: `shared/FinancePeriodFilter.module.scss`

**Interfaces:**
- Consumes: `FinancePeriod` e helpers de `shared/financePeriod.ts`.
- Produces: `<FinancePeriodFilter period={period} onChange={setPeriod} accentColor="#f5a000" />`.

- [ ] **Step 1: Render control with all Conta Azul presets**

```tsx
<FinancePeriodFilter
  period={period}
  onChange={setPeriod}
  accentColor="#f5a000"
/>
```

- [ ] **Step 2: Implement preset menu, date inputs and arrows**

The control displays the active date range, supports all seven presets, prevents an invalid custom range and disables arrows for `all_time`.

- [ ] **Step 3: Type-check shared component**

Run: `npm.cmd exec tsc -- --noEmit`

### Task 3: Conectar portal principal

**Files:**
- Modify: `src/frontend/pages/Financeiro/Financeiro.tsx`
- Test: `server/__tests__/finance-ui-commands.test.ts`

**Interfaces:**
- Consumes: `FinancePeriodFilter`, `getInitialFinancePeriod`, `matchesFinancePeriod`.
- Produces: uma única coleção filtrada usada por cards, gráficos, lançamentos, eventos e Painel do Período.

- [ ] **Step 1: Write interface expectation**

```ts
assert.match(source, /FinancePeriodFilter/);
assert.doesNotMatch(source, /pageMonth|generalFilterMode|filterMonth/);
```

- [ ] **Step 2: Replace local date states and selectors**

Use `const [financePeriod, setFinancePeriod] = useState(() => getInitialFinancePeriod())`, filter `activeFinances` and `activeEvents` through `matchesFinancePeriod`, and rename the monthly panel to `Painel do Período`.

- [ ] **Step 3: Run focused interface test**

Run: `.\node_modules\.bin\tsx.cmd --test server\__tests__\finance-ui-commands.test.ts`

### Task 4: Conectar franquia e fábrica

**Files:**
- Modify: `franchise/src/pages/Financeiro/Financeiro.tsx`
- Modify: `factory/src/pages/Financeiro/Financeiro/Financeiro.tsx`
- Test: `server/__tests__/finance-ui-commands.test.ts`

**Interfaces:**
- Consumes: o mesmo componente e helpers compartilhados.
- Produces: comportamento igual ao portal principal, com azul como cor de destaque.

- [ ] **Step 1: Expand failing interface expectation to three portals**

```ts
for (const file of financeFiles) {
  assert.match(readFileSync(file, 'utf8'), /FinancePeriodFilter/);
}
```

- [ ] **Step 2: Replace all month/year/range filters**

Each portal keeps only the global `financePeriod`; calculations, charts, events and launch table consume the same filtered collections.

- [ ] **Step 3: Run focused interface test**

Run: `.\node_modules\.bin\tsx.cmd --test server\__tests__\finance-ui-commands.test.ts`

### Task 5: Validate integration

**Files:**
- Modify: `docs/superpowers/specs/2026-08-12-filtro-financeiro-conta-azul-design.md`
- Modify: `docs/superpowers/plans/2026-08-12-filtro-financeiro-conta-azul.md`

- [ ] **Step 1: Run complete automated tests**

Run: `$tests = Get-ChildItem -Path server,shared -Recurse -File -Filter '*.test.ts' | ForEach-Object { $_.FullName }; .\node_modules\.bin\tsx.cmd --test $tests`

- [ ] **Step 2: Type-check and build every portal**

Run: `npm.cmd exec tsc -- --noEmit; npm.cmd run build`

- [ ] **Step 3: Check final diff**

Run: `git diff --check; git status --short`
