# Cardápios compacto e operacional Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reorganizar a tela principal de Cardápios para reduzir espaço vazio, melhorar a leitura das categorias e alinhar as ações dos menus.

**Architecture:** Manter os componentes existentes (`StaticMenuGrid` e `CustomMenuList`) e concentrar a mudança na estrutura semântica dos cards e nos estilos compartilhados do módulo Sass. O fluxo atual de preview, edição, exclusão e PDF permanece intacto.

**Tech Stack:** React, TypeScript, CSS Modules, Sass, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-26-cardapios-design.md`

## Global Constraints

- Preservar o tema escuro e as cores de destaque existentes do Soul540.
- Não alterar criação, edição, preview, exclusão ou geração de PDF.
- Suportar três colunas em telas largas, duas em médias e uma em telas pequenas.
- Ações devem permanecer utilizáveis sem overflow em 320px.

## Review Focus

- Card padrão com tagline longa: deve ocupar no máximo duas linhas sem deformar o card.
- Card com muitas categorias: deve continuar legível e manter as ações no rodapé.
- Card personalizado sem evento ou texto auxiliar: não deve deixar lacunas visuais artificiais.
- Viewport de 320px: ações e busca devem caber sem rolagem horizontal.
- Tema claro/escuro: nenhum estilo novo pode depender de cor fixa incompatível com as variáveis de tema.

### Task 1: Fixar a estrutura operacional dos cards

**Files:**

- Create: `apps/main/src/pages/Cardapios/Cardapios.structure.test.ts`
- Modify: `apps/main/src/pages/Cardapios/components/StaticMenuGrid.tsx`
- Modify: `apps/main/src/pages/Cardapios/components/CustomMenuList.tsx`

**Interfaces:**

- Consumes: dados e callbacks já existentes em `StaticMenuGrid` e `CustomMenuList`.
- Produces: estrutura com cabeçalho informativo, lista de categorias identificável e ações agrupadas no rodapé.

- [ ] **Step 1: Write the failing structure test**

  Assert that the static and custom card sources contain the semantic hooks for compact metadata, category rows, action groups, and responsive search behavior.

- [ ] **Step 2: Run the structure test and verify it fails**

  Run: `pnpm exec tsx --test apps/main/src/pages/Cardapios/Cardapios.structure.test.ts`
  Expected: FAIL because the new semantic hooks are not present yet.

- [ ] **Step 3: Implement the minimal JSX structure**

  Add dedicated wrappers/classes for metadata, category summaries, and card footers. Keep every existing callback and button behavior unchanged.

- [ ] **Step 4: Run the structure test and verify it passes**

  Run: `pnpm exec tsx --test apps/main/src/pages/Cardapios/Cardapios.structure.test.ts`
  Expected: PASS.

### Task 2: Apply the compact responsive visual system

**Files:**

- Create: `apps/main/src/pages/Cardapios/styles/Cardapios.module.CardActions.scss`
- Create: `apps/main/src/pages/Cardapios/styles/Cardapios.module.Cards.scss`
- Modify: `apps/main/src/pages/Cardapios/styles/Cardapios.module.Navigation.scss`
- Modify: `apps/main/src/pages/Cardapios/styles/Cardapios.module.Calendar.scss`
- Modify: `apps/main/src/pages/Cardapios/styles/Cardapios.module.Filters.scss`
- Modify: `apps/main/src/pages/Cardapios/styles/Cardapios.module.Table.scss`

**Interfaces:**

- Consumes: class hooks produced by Task 1 and existing theme variables/mixins.
- Produces: compact three/two/one-column layout, readable category chips/rows, inline desktop actions, mobile-safe controls.

- [ ] **Step 1: Implement card density and hierarchy styles**

  Reduce card padding/gaps, make category summaries readable, align card actions at the bottom, and add line clamping for optional descriptive text.

- [ ] **Step 2: Implement responsive behavior**

  Keep the existing grid breakpoints, make action groups wrap safely on mobile, and make the custom search input use full available width when needed.

- [ ] **Step 3: Run formatting and build verification**

  Run: `pnpm exec prettier --check apps/main/src/pages/Cardapios/Cardapios.structure.test.ts apps/main/src/pages/Cardapios/components/StaticMenuGrid.tsx apps/main/src/pages/Cardapios/components/CustomMenuList.tsx apps/main/src/pages/Cardapios/styles/Cardapios.module.Navigation.scss apps/main/src/pages/Cardapios/styles/Cardapios.module.Calendar.scss apps/main/src/pages/Cardapios/styles/Cardapios.module.Filters.scss`
  Expected: all files formatted.

  Run: `pnpm build:main`
  Expected: Vite production build exits with code 0.

### Task 3: Regression verification

**Files:**

- No production files expected.

- [ ] **Step 1: Run the focused structure test**

  Run: `pnpm exec tsx --test apps/main/src/pages/Cardapios/Cardapios.structure.test.ts`
  Expected: PASS.

- [ ] **Step 2: Run repository encoding and architecture checks**

  Run: `pnpm check:encoding`
  Expected: PASS without new encoding violations.

  Run: `pnpm architecture:check`
  Expected: PASS without new architecture violations.
