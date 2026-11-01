# Multi-franquias Soul540 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evoluir o Soul540 para suportar várias franquias com isolamento por `franchiseId`, mantendo Itu como primeira franquia e preservando o contexto técnico `unit: 'franchise'`.

**Architecture:** O backend continuará usando Express, Mongoose e as coleções atuais de franquia, mas todos os registros pertencentes a uma franquia passarão a carregar `franchiseId`. O contexto será derivado do usuário autenticado; administradores da matriz poderão escolher uma franquia por escopo validado. O portal de franquias continuará compartilhado, com configuração baseada no slug e compatibilidade com `/itu`.

**Tech Stack:** TypeScript strict, Express, Mongoose, Zod, React 18, React Router 6, Vite, `node:test`/`tsx`, pnpm workspaces.

**Spec:** `docs/superpowers/specs/2026-10-25-multifranquias-design.md`

## Global Constraints

- Toda consulta e mutação de franquia deve aplicar `franchiseId` derivado do contexto autenticado.
- `X-System` identifica somente o portal; não pode trocar a franquia do usuário comum.
- O corpo da requisição não pode escolher livremente `franchiseId`, `unit`, `source`, `origin` ou estados derivados.
- Migrações são comandos explícitos, idempotentes e não executados no startup.
- Código em `apps/` e `packages/` permanece com no máximo 170 linhas e 120 colunas.
- Não apagar nem reverter dados históricos; manter `/itu` como compatibilidade.
- Não alterar endereço legal ou código fiscal sem dados oficiais da franquia.

## Review Focus

- Usuário de Itu tentando enviar outro `franchiseId` no body ou header deve continuar em Itu; testar na autenticação e nas rotas de criação.
- Administrador da matriz acessando uma franquia inexistente ou encerrada deve receber erro controlado; testar o resolver de escopo.
- Registro legado sem `franchiseId` durante a migração deve ser reportado, não misturado silenciosamente; testar o comando em modo prévia.
- Consultas combinadas da matriz não podem duplicar ou misturar registros de franquias; testar eventos, financeiro e dashboard.
- Links antigos `/campinas` e `/itu` devem resolver o mesmo tenant Itu; testar publicação e roteamento.

### Task 1: Contexto de franquia e contratos compartilhados

**Files:**

- Create: `apps/api/src/infrastructure/franchise-context.ts`
- Modify: `apps/api/src/infrastructure/middleware/tenant.ts`
- Modify: `apps/api/src/modules/identity/auth.routes.ts`
- Modify: `apps/api/src/infrastructure/schemas/users.ts`
- Modify: `packages/contracts/src/users.ts`
- Test: `apps/api/src/infrastructure/franchise-context.test.ts`

**Interfaces:**

- Produces `FranchiseScope = { unit: 'main' | 'franchise' | 'factory'; franchiseId?: string; isAdmin: boolean }`.
- Produces `getFranchiseScope(req): FranchiseScope` and `requireFranchiseId(req): string`.
- `User` recebe `franchiseId?: string`.

- [ ] Escrever testes para usuário de franquia, administrador da matriz, header inválido e franquia ausente.
- [ ] Rodar o teste e confirmar falha antes da implementação.
- [ ] Implementar o resolver que usa `req.user.franchiseId` para usuário comum e valida `X-Franchise-Id` somente para administrador da matriz.
- [ ] Atualizar login/me e schemas para carregar o vínculo sem aceitar alteração pelo cliente.
- [ ] Rodar o teste de contexto e o typecheck da API.

### Task 2: Modelo de franquia, slug e vínculo de usuários

**Files:**

- Modify: `apps/api/src/modules/identity/franchises.routes.ts`
- Modify: `apps/api/src/modules/identity/auth.routes.ts`
- Modify: `apps/api/src/modules/identity/users.routes.ts`
- Modify: `apps/api/src/infrastructure/schemas/users.ts`
- Create: `apps/api/src/modules/identity/franchise-policy.ts`
- Test: `apps/api/src/modules/identity/franchise-policy.test.ts`

**Interfaces:**

- `Franchise` terá `slug`, índice único de slug e status validado.
- Produces `getActiveFranchiseOrThrow(id)` e `normalizeFranchiseSlug(name)`.
- Usuário `unit === 'franchise'` exige `franchiseId`; usuário `main` não pode escolher franquia de outro contexto sem permissão.

- [ ] Testar normalização, slug duplicado, franquia inativa e vínculo obrigatório de usuário.
- [ ] Implementar o modelo e a política sem usar o body como fonte de autoridade do tenant.
- [ ] Atualizar CRUD de franquias para gerar/validar slug e registrar auditoria.
- [ ] Atualizar criação/edição de usuários para aceitar somente vínculos autorizados.
- [ ] Rodar testes de política e build da API.

### Task 3: Migração idempotente de Itu

**Files:**

- Create: `apps/api/src/scripts/migrate-franchise-tenants.ts`
- Modify: `apps/api/src/modules/identity/franchises.routes.ts`
- Modify: `apps/api/src/modules/identity/auth.routes.ts`
- Modify: `apps/api/src/modules/events/events.schemas.ts`
- Modify: `apps/api/src/modules/finance/finance.schemas.ts`
- Modify: `apps/api/src/infrastructure/tenant-model.ts`
- Test: `apps/api/src/scripts/migrate-franchise-tenants.test.ts`

**Interfaces:**

- Command `pnpm migrate:franchise-tenants -- --slug itu --apply`.
- Sem `--apply`, o comando somente informa contagens, registros sem vínculo e alterações previstas.
- Com `--apply`, o comando cria/encontra Itu e preenche `franchiseId` nos usuários e documentos legados das coleções de franquia.

- [ ] Criar fixtures de documentos legados e testar prévia sem escrita.
- [ ] Testar execução repetida sem duplicar ou alterar valores.
- [ ] Implementar o comando por lista explícita de modelos/coleções, sem executar durante o startup.
- [ ] Adicionar índices compostos por `franchiseId` e campos usados pelas consultas.
- [ ] Rodar a migração em modo prévia no ambiente local e verificar o relatório.

### Task 4: Isolamento nos módulos da API

**Files:**

- Modify: `apps/api/src/modules/events/events.routes.ts`
- Modify: `apps/api/src/modules/events/events.finance.ts`
- Modify: `apps/api/src/modules/finance/finance-tenant.ts`
- Modify: `apps/api/src/modules/finance/finance.routes.ts`
- Modify: `apps/api/src/modules/operations/dashboard.routes.ts`
- Modify: `apps/api/src/modules/operations/tasks.routes.ts`
- Modify: `apps/api/src/modules/operations/task-history.routes.ts`
- Modify: `apps/api/src/modules/operations/employees.routes.ts`
- Modify: `apps/api/src/modules/operations/contractors.routes.ts`
- Modify: `apps/api/src/modules/operations/contracts.routes.ts`
- Modify: `apps/api/src/modules/operations/menus.routes.ts`
- Modify: `apps/api/src/modules/operations/supplies.routes.ts`
- Modify: `apps/api/src/modules/operations/utensils.routes.ts`
- Modify: `apps/api/src/modules/operations/*-categories.routes.ts`
- Modify: `apps/api/src/modules/operations/auditlog.routes.ts`
- Modify: `apps/api/src/modules/production/production-orders.routes.ts`
- Modify: `apps/api/src/infrastructure/audit-log.ts`
- Test: `apps/api/src/modules/tenant-isolation.test.ts`

**Interfaces:**

- `createTenantModels` passa a produzir modelos já preparados para `franchiseId`.
- Cada rota recebe um filtro de escopo comum e injeta o vínculo na criação.
- Auditoria registra `franchiseId` efetivo.

- [ ] Escrever testes de leitura, criação, alteração e exclusão cruzada para eventos e financeiro.
- [ ] Escrever testes de isolamento para tarefas, dashboard, pessoas, estoque, contratos, menus e ordens.
- [ ] Implementar filtro composto `{ franchiseId, ...query }` para usuários de franquia.
- [ ] Implementar escopo combinado apenas para matriz, validando cada franquia antes de consultar.
- [ ] Rodar a suíte de isolamento e corrigir qualquer rota que possa retornar lista vazia após erro.

### Task 5: Cliente HTTP, sessão e portal compartilhado

**Files:**

- Modify: `packages/api-client/src/create-api-fetch.ts`
- Modify: `packages/api-client/src/index.ts`
- Modify: `packages/contracts/src/users.ts`
- Modify: `apps/main/src/contexts/AuthContext.tsx`
- Modify: `apps/franchise/src/contexts/AuthContext.tsx`
- Modify: `apps/main/src/pages/Franquias/Franquias.tsx`
- Modify: `apps/franchise/src/App.tsx`
- Modify: `apps/franchise/vite.config.ts`
- Modify: `packages/screens/src/portal-config.ts`
- Create: `apps/franchise/src/franchise-context.ts`

**Interfaces:**

- `createApiFetch` aceita `franchiseId?: string` apenas para chamadas administrativas configuradas.
- `FranchiseContext` expõe `{ id, slug, name, city, status }` para o portal.
- `/itu` continua apontando para o registro de Itu; novos slugs usam a configuração dinâmica do portal.

- [ ] Testar que usuário comum não envia nem substitui o vínculo autenticado.
- [ ] Implementar carregamento do contexto sem duplicar nomes fixos de franquia nos componentes.
- [ ] Atualizar links da matriz para abrir o slug correto e manter o redirecionamento legado.
- [ ] Atualizar exportações, checklist e textos para usar o nome do contexto.
- [ ] Rodar build dos três portais e verificar `/itu`.

### Task 6: Testes de regressão, documentação e revisão

**Files:**

- Modify: `docs/superpowers/specs/2026-10-25-multifranquias-design.md`
- Modify: `docs/HANDOFF_CONTINUACAO_MIGRACAO.md`
- Create: `apps/api/src/modules/identity/franchise-isolation.test.ts`
- Create: `apps/api/src/modules/identity/franchise-migration.test.ts`

- [ ] Executar testes de contexto, política, migração e isolamento.
- [ ] Executar `pnpm check:file-size`, `pnpm check:encoding`, `pnpm architecture:check` e `git diff --check`.
- [ ] Executar `pnpm build:main`, `pnpm build:franchise`, `pnpm build:factory` e `pnpm build:api`.
- [ ] Registrar no handoff o que foi migrado, o comando de migração e pendências fiscais.
- [ ] Rodar `revisar-padrao` sobre os arquivos alterados e corrigir desvios introduzidos pela feature.
