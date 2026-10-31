# Notas Fiscais com Configuração Fiscal Integrada Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrar o cadastro do certificado digital à página `/notas-fiscais` e remover a tela fiscal independente.

**Architecture:** O fluxo existente de certificado será extraído para um componente de seção dentro de `pages/NotasFiscais`, mantendo o hook e os utilitários atuais. `NotasFiscais` será a única entrada de interface para notas e configuração fiscal; a rota e o item de menu separados serão removidos.

**Tech Stack:** React, React Router, TypeScript, SCSS Modules, Node test runner, pnpm.

**Spec:** `docs/superpowers/specs/2026-10-31-notas-fiscais-configuracao-fiscal-design.md`

## Global Constraints

- A configuração fiscal continua restrita ao sistema principal e ao administrador.
- O endpoint `/api/fiscal/certificado` e o armazenamento do certificado não serão alterados.
- O fluxo de emissão, cancelamento, exclusão e download de notas continuará igual.
- Não criar aliases de importação; usar caminhos relativos.

## Review Focus

- Usuário não administrador: não deve ganhar uma rota nova para alterar certificado; coberto pela remoção da rota independente e pela permissão da página.
- Certificado já configurado: a seção deve continuar exibindo validade, titular, CNPJ, remoção e substituição.
- Certificado não configurado: a seção deve continuar exibindo seleção de arquivo, senha e envio.
- Página de notas sem registros: a configuração deve continuar visível mesmo com o estado vazio.
- Navegação antiga para `/configuracao-fiscal`: deve deixar de ser uma rota fiscal independente; a aplicação deve redirecionar pela rota curinga.

### Task 1: Integrar a seção de certificado à página de notas

**Files:**
- Create: `apps/main/src/pages/NotasFiscais/components/FiscalConfigurationSection.tsx`
- Modify: `apps/main/src/pages/NotasFiscais/NotasFiscais.tsx`
- Move/reuse styles: `apps/main/src/pages/NotasFiscais/styles/ConfiguracaoFiscal.module.scss` and its partials
- Test: `apps/main/src/pages/NotasFiscais/NotasFiscais.structure.test.ts`

**Interfaces:**
- Consumes: `useConfiguracaoFiscal`, `isCertificateFile`, certificate formatters and `ConfirmModal`.
- Produces: `FiscalConfigurationSection` rendered by `NotasFiscais`.

- [ ] **Step 1: Write the failing structural test** asserting that `NotasFiscais.tsx` imports/renders `FiscalConfigurationSection` and that the section retains the certificate upload/configured states.
- [ ] **Step 2: Run the focused test and verify it fails** because the new section and page integration do not yet exist.
- [ ] **Step 3: Extract the current certificate UI into `FiscalConfigurationSection`** without changing API calls, labels, state transitions or certificate security behavior.
- [ ] **Step 4: Render the section from `NotasFiscais`** after the invoice content so it remains visible for both populated and empty invoice lists.
- [ ] **Step 5: Run the focused test and verify it passes.**

### Task 2: Remove the duplicate fiscal route and menu entry

**Files:**
- Modify: `apps/main/src/routes.ts`
- Modify: `apps/main/src/App.tsx`
- Modify: `apps/main/src/components/Sidebar/sidebar-group-sistema.tsx`
- Modify/remove: `apps/main/src/pages/ConfiguracaoFiscal/ConfiguracaoFiscal.tsx`
- Modify: `apps/main/src/pages/ConfiguracaoFiscal/ConfiguracaoFiscal.structure.test.ts`

**Interfaces:**
- Consumes: `NotasFiscais` as the single fiscal UI entry point.
- Produces: no standalone `/configuracao-fiscal` route or sidebar item.

- [ ] **Step 1: Extend the structural test** to assert that `CONFIGURACAO_FISCAL` and the standalone sidebar item are absent, while the certificate section remains available through `NotasFiscais`.
- [ ] **Step 2: Run the focused test and verify it fails** against the current route/menu definitions.
- [ ] **Step 3: Remove the standalone route constant, lazy import, route declaration and sidebar item.** Keep shared certificate hook/utilities only where the integrated section uses them.
- [ ] **Step 4: Remove obsolete standalone page/test files after their assertions are moved to the Notas Fiscais structural test.**
- [ ] **Step 5: Run the focused structural tests and verify they pass.**

### Task 3: Full verification

**Files:**
- Verify: all changed files from Tasks 1–2.

- [ ] **Step 1: Run the complete test suite** with `node --import tsx --test` over `apps`, `packages`, `shared`, `infra` and `scripts` test files; expect zero failures.
- [ ] **Step 2: Run `pnpm quality:check`, `pnpm check:file-size`, `pnpm build` and `git diff --check`; expect exit code 0 for each.
- [ ] **Step 3: Confirm no source import uses `@/` or `@soul540/*`, and confirm the final diff only contains the requested integration.
