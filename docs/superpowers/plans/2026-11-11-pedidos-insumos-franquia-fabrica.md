# Pedidos de insumos entre franquias e Fábrica — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let franchise users request factory supplies, let factory users prepare and dispatch them, and update each stock exactly once at dispatch/receipt.

**Architecture:** Put status transitions and quantity validation in `packages/domain`; share request DTOs in `packages/contracts`; keep records in one Mongo collection with server-derived franchise scope. Add a focused API module and a shared request screen mounted in the main, Campinas, Itu, and factory portals, with role-specific actions.

**Tech Stack:** TypeScript, React, Express, Mongoose, Vitest/tsx node tests, existing Pentágono components, Vite portal builds.

**Spec:** `docs/superpowers/specs/2026-11-11-pedidos-insumos-franquia-fabrica-design.md`

## Global Constraints

- Use the authenticated server unit and franchise ID; never trust tenant identity sent by the browser.
- The factory catalog is read from factory supplies; request item names and units are snapshots.
- Factory stock decreases at dispatch; franchise stock increases only for confirmed receipt quantities.
- Do not allow negative factory stock, duplicate receipt, or duplicate dispatch on request retries.
- Preserve history; cancel only before dispatch; do not create financial entries.
- Use Pentágono components and existing portal/router/sidebar patterns.
- Keep code files within the repository's 170-line limit, UTF-8, LF, final newline.

## Review Focus

- Replayed dispatch/receipt request does not change stock twice — test idempotent transition.
- A franchise cannot read another franchise's orders or submit another franchise ID — test API isolation.
- Factory supply deleted or insufficient at dispatch does not create negative stock — test domain/API conflict.
- Existing franchise stock has no factory reference — test explicit linking or new item creation on first receipt.
- Receipt quantity differs from dispatched quantity — test exact confirmed quantity enters franchise stock and discrepancy is retained.

---

## File Structure

- `packages/domain/src/supply-orders.ts` — pure statuses, item quantity validation, allowed transitions.
- `packages/domain/src/supply-orders.test.ts` — transition and quantity tests.
- `packages/domain/src/index.ts` — export supply-order rules.
- `packages/contracts/src/supply-orders.ts` — status, item, summary and create/dispatch/receipt input types.
- `packages/contracts/src/index.ts` — export supply-order contracts.
- `apps/api/src/modules/supply-orders/supply-orders.model.ts` — Mongo model and indexes.
- `apps/api/src/modules/supply-orders/supply-orders.scope.ts` — unit/franchise filters and authorization predicates.
- `apps/api/src/modules/supply-orders/supply-orders.routes.ts` — list, catalog, create and transition endpoints.
- `apps/api/src/modules/supply-orders/supply-orders.routes.test.ts` — API isolation, stock effects and idempotency.
- `apps/api/src/app.ts` — register `/api/supply-orders`.
- `apps/api/src/modules/operations/supplies.routes.ts` — expose stable factory supply reference and update stock safely at dispatch/receipt.
- `packages/screens/src/operations/supply-orders/` — shared list, request form, order detail, status and action UI, styles, API adapter and tests.
- `apps/{main,campinas,itu,factory}/src/routes.ts`, `src/App.tsx` — route constant, lazy import and permission-protected page.
- `apps/{main,campinas,itu,factory}/src/components/Sidebar/*` — “Pedidos de insumos” navigation entry.
- `apps/{main,campinas,itu,factory}/src/pages/Permissoes/*` — expose `pedidos-insumos` permission.
- `apps/{main,campinas,itu,factory}/src/pages/EstoqueInsumos/types/supply-types.ts` — franchise supply origin reference where the current type is defined.

## Task 1: Domain rules and shared contracts

**Files:**
- Create: `packages/domain/src/supply-orders.ts`
- Create: `packages/domain/src/supply-orders.test.ts`
- Modify: `packages/domain/src/index.ts`
- Create: `packages/contracts/src/supply-orders.ts`
- Modify: `packages/contracts/src/index.ts`

**Interfaces:**
- `SupplyOrderStatus = 'submitted' | 'preparing' | 'dispatched' | 'received' | 'received_with_difference' | 'cancelled'`.
- `transitionSupplyOrder(status, command)` accepts `start_preparing | dispatch | confirm_receipt | cancel` and returns the next status or a typed domain error.
- `validateSupplyOrderItems(items)` rejects empty lists, duplicate factory supply IDs, non-finite quantities, and quantities `<= 0`.
- `CreateSupplyOrderInput`, `DispatchSupplyOrderInput`, `ConfirmSupplyOrderReceiptInput`, `SupplyOrderSummary` define API/web payloads.

- [x] **Step 1: Write failing domain tests** for valid/invalid transitions, empty/duplicate items, non-positive quantities, and receipt mismatch status.
- [x] **Step 2: Run `pnpm exec tsx --test packages/domain/src/supply-orders.test.ts`** and confirm the new cases fail.
- [x] **Step 3: Implement the pure transition and quantity functions** in `supply-orders.ts` and export them.
- [x] **Step 4: Add the shared request/response contract types** and export them.
- [x] **Step 5: Run `pnpm exec tsx --test packages/domain/src/supply-orders.test.ts` and `pnpm build:api`**; confirm all cases pass and types compile.

## Task 2: API model, authorization and stock mutations

**Files:**
- Create: `apps/api/src/modules/supply-orders/supply-orders.model.ts`
- Create: `apps/api/src/modules/supply-orders/supply-orders.scope.ts`
- Create: `apps/api/src/modules/supply-orders/supply-orders.routes.ts`
- Create: `apps/api/src/modules/supply-orders/supply-orders.routes.test.ts`
- Modify: `apps/api/src/app.ts`
- Modify: `apps/api/src/modules/operations/supplies.routes.ts`

**Interfaces:**
- `GET /api/supply-orders/catalog`: franchise-only list of active factory supplies, returning ID, name, unit and availability; no costs.
- `GET /api/supply-orders`: franchise sees its requests; factory sees requests from all franchises.
- `POST /api/supply-orders`: create `submitted` request; server assigns unit/franchise ID and item snapshots.
- `POST /api/supply-orders/:id/preparing`: factory only, `submitted → preparing`.
- `POST /api/supply-orders/:id/dispatch`: factory only, accepts dispatched quantities; atomically/idempotently decrements factory stock and transitions to `dispatched`.
- `POST /api/supply-orders/:id/receipt`: owning franchise only, accepts received quantities and explicit compatible stock-item links when needed; adds only confirmed quantities and transitions to received status.
- `POST /api/supply-orders/:id/cancel`: owning franchise or factory before dispatch only.

- [ ] **Step 1: Add API tests** for catalog visibility, order creation, unit/tenant spoofing, cross-franchise reads, illegal transitions, insufficient stock, duplicate dispatch/receipt, and confirmed quantities.
- [ ] **Step 2: Run `pnpm exec tsx --test apps/api/src/modules/supply-orders/supply-orders.routes.test.ts`** and verify expected failures before implementing route behavior.
- [ ] **Step 3: Add the shared order model** with item snapshots, transition history, actor/time fields and indexes on `{ franchiseId, createdAt }` and `{ status, createdAt }`.
- [ ] **Step 4: Implement server-derived scopes**; factory may read all franchise requests, a franchise may read/mutate only its own, and body tenant fields are ignored/rejected.
- [ ] **Step 5: Implement request and catalog endpoints** with permission `pedidos-insumos` and explicit unit checks.
- [ ] **Step 6: Implement dispatch and receipt mutations** with Mongo transactions, conditional stock updates and idempotency keys stored on each completed transition; reject insufficient or deleted factory supplies.
- [ ] **Step 7: Implement cancel-before-dispatch and audit events**; preserve cancelled and completed request records.
- [ ] **Step 8: Run `pnpm exec tsx --test apps/api/src/modules/supply-orders/supply-orders.routes.test.ts` and `pnpm build:api`**; confirm stock changes occur once per transition.

## Task 3: Shared web workflow and stock-item linking

**Files:**
- Create: `packages/screens/src/operations/supply-orders/` page, hook, API adapter, forms, list/detail components and styles.
- Create: `packages/screens/src/operations/supply-orders/supply-order-view.test.ts` — pure UI state/formatting behavior that can be tested with the current Node test setup.
- Modify: `packages/screens/src/index.ts`.
- Modify: `apps/{main,campinas,itu,factory}/src/pages/EstoqueInsumos/types/supply-types.ts`.

**Interfaces:**
- `SupplyOrdersScreen({ apiFetch, mode })`, where mode is `franchise | factory`.
- Franchise mode creates a request from the factory catalog, shows status, and confirms received quantity per item.
- Factory mode shows all requests, marks preparation, adjusts dispatch quantities, and dispatches.
- First receipt requires selecting a compatible existing local stock item or creating a local stock item; subsequent receipts update its `factorySupplyId` reference.

- [ ] **Step 1: Add pure view tests** for status labels, discrepancy summaries, and filtering available actions by portal mode and order status.
- [ ] **Step 2: Run `pnpm exec tsx --test packages/screens/src/operations/supply-orders/supply-order-view.test.ts`** and confirm failures.
- [ ] **Step 3: Implement shared list/detail/form components** using Pentágono components and the shared API adapter.
- [ ] **Step 4: Add loading, empty, error/retry and mutation feedback states**; disable actions while saving.
- [ ] **Step 5: Add `factorySupplyId` to franchise supply typing and serialization** without changing existing stock items.
- [ ] **Step 6: Run `pnpm exec tsx --test packages/screens/src/operations/supply-orders/supply-order-view.test.ts` and the four portal builds**.

## Task 4: Mount pages, permissions and navigation in all portals

**Files:**
- Modify: `apps/{main,campinas,itu,factory}/src/routes.ts`.
- Modify: `apps/{main,campinas,itu,factory}/src/App.tsx`.
- Modify: `apps/main/src/components/Sidebar/sidebar-group-operacoes.tsx`.
- Modify: `apps/{campinas,itu}/src/components/Sidebar/franchise-sidebar-operations-navigation.tsx`.
- Modify: `apps/factory/src/components/Sidebar/factory-sidebar-operations-navigation.tsx`.
- Modify: permission page definitions for main, Campinas, Itu and factory.

- [ ] **Step 1: Register `PEDIDOS_INSUMOS: '/pedidos-insumos'` and lazy-load the shared screen** behind `pedidos-insumos` in every applicable app.
- [ ] **Step 2: Add the menu item** labeled “Pedidos de insumos” to franchise and factory operations navigation.
- [ ] **Step 3: Add `pedidos-insumos` to each portal's permission directory** so admins can grant access.
- [ ] **Step 4: Run `pnpm build:main`, `pnpm build:campinas`, `pnpm build:itu` and `pnpm build:factory`**.

## Task 5: Documentation and end-to-end verification

**Files:**
- Modify: spec status in `docs/superpowers/specs/2026-11-11-pedidos-insumos-franquia-fabrica-design.md`.
- Create or update: business rules for franchise/factory stock and supply orders.

- [ ] **Step 1: Document implemented statuses, stock timing, access and mismatch handling** in the relevant business-rule maps.
- [ ] **Step 2: Run all three focused Node test files**, `pnpm typecheck`, `pnpm check:file-size`, `pnpm check:encoding`, `pnpm architecture:check`, and `pnpm build`.
- [ ] **Step 3: Review implementation against the approved spec** and report any limitation clearly.

## Self-review

- Spec requirements map to Tasks 1–5: transition rules; shared order data; cross-tenant API; stock changes; request and factory screens; permissions/navigation; audit; no financial entries; tests and documentation.
- Review focus cases map to Tasks 1–3 tests.
- Tasks use the same status names and route paths in later interfaces.
- Native in-session execution is selected because this task spans one shared API and one shared screen consumed by four portals; the interfaces must stay consistent across these steps.
