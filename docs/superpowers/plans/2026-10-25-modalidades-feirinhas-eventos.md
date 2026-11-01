# Modalidades de Feirinha e Evento Avulso Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Classificar agendamentos e lançamentos como Feirinha ou Evento avulso, tratar Feirinha como programação semanal confirmada por ocorrência e separar os dados na franquia e na matriz.

**Architecture:** O contrato compartilhado terá uma modalidade única (`feirinha | evento_avulso`) e metadados de recorrência semanal. A Feirinha será persistida como template; a interface exibirá ocorrências virtuais e criará um agendamento real somente ao confirmar uma ocorrência. O financeiro automático copiará a modalidade do agendamento real, enquanto lançamentos manuais terão seleção própria.

**Tech Stack:** TypeScript, React/Vite, Node `node:test`, Express, Mongoose, contratos compartilhados e `@soul540/domain`.

**Spec:** `docs/superpowers/specs/2026-10-25-modalidades-franquias-design.md`

## Global Constraints

- O domínio terá somente `feirinha` e `evento_avulso`.
- Dados existentes sem modalidade serão tratados como `evento_avulso`, sem migração destrutiva.
- Feirinha é recorrente semanalmente e será cadastrada como uma programação recorrente.
- As ocorrências semanais serão virtuais até serem confirmadas; somente a confirmação materializa o agendamento e seus lançamentos financeiros.
- Toda consulta privada mantém o isolamento por franquia e a autorização de administrador da matriz já existente.
- Arquivos de código permanecem com no máximo 170 linhas; separar responsabilidades quando necessário.
- Textos visíveis ficam em pt-BR e os arquivos permanecem UTF-8, LF e com linha final.

## Review Focus

- Evento legado sem `modality` deve aparecer como Evento avulso — teste de normalização de leitura e filtro.
- Feirinha sem data final deve continuar gerando ocorrências virtuais semanais — teste do gerador com limite de horizonte.
- Data fora do dia da semana ou fora do período da programação não pode ser confirmada — teste da regra de confirmação.
- Confirmar a mesma ocorrência duas vezes não pode duplicar o agendamento nem o financeiro — teste de idempotência da rota.
- A matriz não pode misturar modalidades nos totais filtrados — teste de filtro de eventos e lançamentos consolidados.

---

### Task 1: Domínio compartilhado de modalidades e recorrência

**Files:**

- Modify: `packages/contracts/src/events.ts`
- Modify: `packages/contracts/src/finance.ts`
- Create: `packages/domain/src/event-modalities.ts`
- Modify: `packages/domain/src/index.ts`
- Test: `packages/domain/src/event-modalities.test.ts`

**Interfaces:**

- Produces `EventModality = 'feirinha' | 'evento_avulso'`.
- Produces `normalizeEventModality(value: unknown): EventModality`.
- Produces `getWeeklyOccurrenceDates(startDate: string, endDate: string | undefined, fromDate: string, limit: number): string[]`.
- Produces `canConfirmWeeklyOccurrence(template: { modality?: EventModality; date: string; recurrenceEndDate?: string }, occurrenceDate: string): boolean`.
- Adds optional `modality`, `isRecurringTemplate`, `recurrenceId` and `recurrenceEndDate` to `PizzaEvent`.
- Adds optional `modality` to `FinanceEntry`.

- [ ] **Step 1: Write the failing tests** for legacy normalization, weekly dates, end-date cutoff, wrong weekday and modality validation.
- [ ] **Step 2: Run the tests to verify they fail** with `node --import tsx --test packages/domain/src/event-modalities.test.ts`.
- [ ] **Step 3: Implement the pure domain functions** with `evento_avulso` as the fallback and ISO date-only comparison.
- [ ] **Step 4: Run the focused tests and the domain test suite**; expect all focused cases and existing domain tests to pass.

### Task 2: Persist modality and recurring templates in the API

**Files:**

- Modify: `apps/api/src/modules/events/events.schemas.ts`
- Modify: `apps/api/src/modules/events/events.routes.ts`
- Modify: `apps/api/src/modules/events/events.finance.ts`
- Modify: `apps/api/src/modules/finance/finance.schemas.ts`
- Modify: `apps/api/src/infrastructure/schemas/finances.ts`
- Modify: `apps/api/src/infrastructure/services/financePayloads.ts`
- Test: `apps/api/src/modules/events/event-modalities.test.ts`
- Test: `apps/api/src/modules/finance/finance-modalities.test.ts`

**Interfaces:**

- Event schemas persist `modality` with default `evento_avulso`, plus `isRecurringTemplate`, `recurrenceId` and `recurrenceEndDate`.
- Finance schemas persist optional `modality` with legacy fallback `evento_avulso`.
- `POST /api/events` accepts a weekly Feirinha template and must not create automatic finance for a template.
- `POST /api/events/:id/recurring-occurrence` accepts `{ date: string }`, validates the template and creates one confirmed occurrence with `recurrenceId` and inherited modality.
- Repeated confirmation of the same template/date returns the existing occurrence without duplicating finance.
- Automatic finance payloads copy `event.modality`; manual finance payloads normalize missing modality to `evento_avulso`.

- [ ] **Step 1: Write failing API-level tests** for template creation without finance, valid occurrence confirmation, invalid date, duplicate confirmation and modality propagation.
- [ ] **Step 2: Run the focused API tests to verify the missing behavior** with `node --import tsx --test apps/api/src/modules/events/event-modalities.test.ts apps/api/src/modules/finance/finance-modalities.test.ts`.
- [ ] **Step 3: Add schema fields and request normalization** without changing the existing tenant filters or admin scope rules.
- [ ] **Step 4: Add the occurrence confirmation route** before the generic `/:id` route, using the existing event store, franchise scope and `syncEventFinances` only for materialized events.
- [ ] **Step 5: Propagate modality into automatic and manual finance payload builders** and preserve `evento_avulso` for legacy entries.
- [ ] **Step 6: Run the focused tests plus existing API tests** and verify no tenant-isolation test regresses.

### Task 3: Franchise agendamentos with modality and weekly Feirinha template

**Files:**

- Modify: `apps/franchise/src/pages/Eventos/types/event-form-types.ts`
- Modify: `apps/franchise/src/pages/Eventos/types/event-types.ts`
- Modify: `apps/franchise/src/pages/Eventos/hooks/use-eventos-controller.ts`
- Modify: `apps/franchise/src/pages/Eventos/hooks/use-event-form-actions.ts`
- Modify: `apps/franchise/src/pages/Eventos/components/EventFormBasics.tsx`
- Modify: `apps/franchise/src/pages/Eventos/components/EventosSections.tsx`
- Modify: `apps/franchise/src/pages/Eventos/components/EventCard.tsx`
- Create: `apps/franchise/src/pages/Eventos/components/RecurringFeirinhaCard.tsx`
- Create: `apps/franchise/src/pages/Eventos/utils/event-modalities.ts`
- Test: `apps/franchise/src/pages/Eventos/utils/event-modalities.test.ts`

**Interfaces:**

- Form state exposes `modality` and `recurrenceEndDate`.
- A Feirinha form shows the weekly recurrence end date and creates a template payload; Evento avulso keeps the current single-event flow.
- Recurring cards show upcoming virtual weekly occurrences and a “Confirmar ocorrência” action.
- Confirming calls `/api/events/:id/recurring-occurrence`; the current week becomes a normal event and receives automatic finance.
- The list shows a modality badge and does not place virtual occurrences in normal financial totals.

- [ ] **Step 1: Write the failing pure UI-helper tests** for modality labels and upcoming weekly occurrences.
- [ ] **Step 2: Run them with `node --import tsx --test apps/franchise/src/pages/Eventos/utils/event-modalities.test.ts`** and confirm the helper is missing.
- [ ] **Step 3: Add modality and recurrence fields to the form/controller** while preserving edit behavior for existing events.
- [ ] **Step 4: Implement the recurring Feirinha card** with a bounded upcoming-occurrence view and confirmation action.
- [ ] **Step 5: Add modality badges and the modality filter** to the franchise event list without changing status grouping.
- [ ] **Step 6: Run the focused helper tests and build the franchise app**.

### Task 4: Franchise financeiro separated by modality

**Files:**

- Modify: `apps/franchise/src/pages/Financeiro/types/finance-controller-types.ts`
- Modify: `apps/franchise/src/pages/Financeiro/hooks/use-franchise-finance-state.ts`
- Modify: `apps/franchise/src/pages/Financeiro/hooks/use-franchise-finance-period.ts`
- Modify: `apps/franchise/src/pages/Financeiro/components/FinanceFormFields.tsx`
- Modify: `apps/franchise/src/pages/Financeiro/components/FinanceiroHeader.tsx`
- Modify: `apps/franchise/src/pages/Financeiro/components/FinanceiroEntriesTab.tsx`
- Modify: `apps/franchise/src/pages/Financeiro/components/FinanceiroEntriesTable.tsx`

**Interfaces:**

- Finance state exposes `modalityFilter` and `setModalityFilter` with `all | feirinha | evento_avulso`.
- Manual finance form exposes `formModality`, defaulting to `evento_avulso`, and sends it in create/update/import payloads when relevant.
- Period totals, charts, event-value panels, table and exports consume the modality-filtered collection.
- Every finance row displays “Feirinha” or “Evento avulso”, including legacy entries.

- [ ] **Step 1: Add failing controller/domain tests** proving the filtered total excludes the other modality.
- [ ] **Step 2: Run the focused tests and observe the pre-filter failure.**
- [ ] **Step 3: Add form selection, filter state and row labels.**
- [ ] **Step 4: Thread the filtered collection through period derivations and exports.**
- [ ] **Step 5: Run franchise build and the focused tests.**

### Task 5: Matrix agendamentos and financeiro separated by modality

**Files:**

- Modify: `apps/main/src/pages/Eventos/hooks/use-event-filters.ts`
- Modify: `apps/main/src/pages/Eventos/components/EventosFilters.tsx`
- Modify: `apps/main/src/pages/Eventos/components/EventCard.tsx`
- Modify: `apps/main/src/pages/Financeiro/hooks/use-financeiro-state.ts`
- Modify: `apps/main/src/pages/Financeiro/hooks/use-finance-derived-filters.ts`
- Modify: `apps/main/src/pages/Financeiro/hooks/use-finance-period-derivations.ts`
- Modify: `apps/main/src/pages/Financeiro/components/FinanceiroHeader.tsx`
- Modify: `apps/main/src/pages/Financeiro/components/FinanceiroEntriesTable.tsx`
- Modify: `apps/main/src/pages/Financeiro/components/FinanceiroEntriesTab.tsx`
- Modify: `apps/main/src/pages/Financeiro/components/FinanceiroOverviewTab.tsx`

**Interfaces:**

- Matrix event filters expose modality independently from source (`principal`, `franquias`, `fábrica`) and status/date/search filters.
- Matrix finance state exposes the same `all | feirinha | evento_avulso` filter for every data scope.
- Main event and finance rows show the normalized modality, including franchise records loaded through the existing admin scope.
- Consolidated totals and exports use only the selected modality.

- [ ] **Step 1: Write failing filter tests** for main events and consolidated finance entries.
- [ ] **Step 2: Run the focused tests to verify the filters currently mix modalities.**
- [ ] **Step 3: Add modality filters and labels while preserving source/scope separation.**
- [ ] **Step 4: Thread the filter through summaries, event-value panels and exports.**
- [ ] **Step 5: Run main build and focused tests.**

### Task 6: Cross-system verification and standards review

**Files:**

- Modify: only files identified by the preceding tasks if verification exposes a defect.

- [ ] **Step 1: Run all focused domain, franchise and API tests** with `node --import tsx --test`.
- [ ] **Step 2: Run `pnpm build:main`, `pnpm build:franchise` and `pnpm build:api`.**
- [ ] **Step 3: Run `pnpm check:encoding`, `pnpm check:file-size` and `git diff --check`.**
- [ ] **Step 4: Run the `revisar-padrao` skill against all changed files and correct only issues introduced by this feature.**
- [ ] **Step 5: Re-run every failed verification after corrections and report pre-existing failures separately.**
