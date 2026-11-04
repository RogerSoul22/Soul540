# Correções de usabilidade em formulários e eventos Implementation Plan

> **For agentic workers:** execute tarefas em ordem; preserve as regras globais do produto.

**Goal:** Recuperar a digitação de datas, remover o corte artificial da lista de próximos eventos e tornar o botão de limpeza de campos opt-in.

**Architecture:** Atualizar o DatePicker compartilhado para manter um rascunho textual editável e encaminhar valores válidos normalizados ao input nativo oculto. Remover o limite da tela de Eventos e alinhar a prop `clearable` com o comportamento anterior.

**Tech Stack:** React, TypeScript, CSS Modules, Vite workspace pnpm.

**Spec:** `docs/superpowers/specs/2026-11-04-correcao-usabilidade-formularios-design.md`

## Global Constraints

- Arquivos de código respeitam o limite de 170 linhas.
- Datas persistidas permanecem em formato ISO.
- Não alterar regras de negócio fora dos três itens descritos na spec.
- Não adicionar nem executar testes nesta rodada.

## Review Focus

- Digitação de data incompleta não deve salvar a data anterior silenciosamente.
- Limites `min`/`max` devem continuar respeitados por digitação e calendário.
- Campos sem data permanecem bloqueados quando `required` estiver ativo.
- A ordenação dos próximos eventos continua sendo a definida por `upcomingEvents`.
- Campos explicitamente marcados `clearable` mantêm a ação de limpeza.

---

### Task 1: Tornar o DatePicker editável

**Files:**
- Modify: `packages/pentagono/src/components/DatePicker/DatePicker.tsx`
- Modify: `packages/pentagono/src/components/DatePicker/date-utils.ts`
- Modify: `packages/pentagono/src/components/DatePicker/DatePicker.module.css`
- Create: `packages/pentagono/src/components/DatePicker/DatePickerControl.tsx`

**Result:** Campo de texto visível com digitação localizada; seletor de calendário permanece disponível; eventos React continuam recebendo ISO.

### Task 2: Restaurar visibilidade e limpeza opt-in

**Files:**
- Modify: `apps/main/src/pages/Eventos/Eventos.tsx`
- Modify: `packages/pentagono/src/components/Input/Input.tsx`
- Modify: `packages/pentagono/src/components/Input/type.ts`
- Modify: `docs/PENTAGONO.md`

**Result:** A tela principal lista todos os próximos eventos; o botão “X” só aparece quando solicitado pela prop `clearable`.

## Verificação

Revisar os diffs e as interfaces alteradas. Não executar testes nem builds nesta rodada, conforme a restrição global da tarefa.
