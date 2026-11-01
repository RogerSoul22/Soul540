# Backend Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir os problemas de segurança, autorização, escopo da fábrica, consistência financeira, tratamento de erros e estabilidade identificados na revisão do backend do Soul540.

**Architecture:** Manter Express + MongoDB/Mongoose e os contratos atuais do `packages/api-client`. Centralizar autenticação, autorização, erros e rate limit em infraestrutura reutilizável; corrigir cada módulo com testes de regressão sem migrar o banco ou a arquitetura nesta etapa.

**Tech Stack:** TypeScript, Express, Mongoose, JWT, Vitest, pnpm.

**Spec:** `docs/superpowers/specs/2026-10-31-backend-hardening-design.md`

## Global Constraints

- O sistema continuará usando Express, MongoDB/Mongoose e o envelope de respostas já consumido pelo `packages/api-client`.
- Não migrar Express/Mongoose para Node HTTP/Prisma nesta etapa.
- Não permitir que a fábrica altere dados financeiros de eventos de outras unidades.
- Preservar o isolamento por unidade/franquia e a compatibilidade dos clientes atuais.
- Nenhuma exclusão física de entidade histórica nova; usar inativação quando o modelo suportar.

## Review Focus

- Token assinado sem `JWT_SECRET`: a aplicação deve falhar no boot, sem segredo padrão.
- Usuário principal sem permissão de franquias: mutações devem retornar `403`, mesmo com sessão válida.
- Administrador da fábrica editando evento `main` ou `franchise`: apenas campos operacionais devem ser atualizados no modelo de origem.
- Payload grande em rota comum: deve retornar `413`, enquanto upload/importação continua funcionando com limite próprio.
- Ação de chat desconhecida ou malformada: não pode executar mutação nem causar erro interno.

## File Map

- Create: `apps/api/src/infrastructure/security/jwt-secret.ts` — validação única do segredo JWT.
- Create: `apps/api/src/infrastructure/middleware/permissions.ts` — middleware de permissões de leitura/escrita.
- Create: `apps/api/src/infrastructure/http/errors.ts` — códigos e normalização de erros públicos.
- Create: `apps/api/src/infrastructure/middleware/rate-limit.ts` — limitador simples por IP/rota.
- Modify: `apps/api/src/infrastructure/middleware/auth.ts` — segredo centralizado, sistema e autorização.
- Modify: `apps/api/src/modules/identity/auth.routes.ts` — login/me usando o serviço JWT.
- Modify: `apps/api/src/modules/identity/franchises.routes.ts` — administração global protegida.
- Modify: `apps/api/src/modules/operations/auditlog.routes.ts` — auditoria administrativa.
- Modify: `apps/api/src/modules/events/events.finance.ts` and `apps/api/src/modules/events/events.routes.ts` — origem correta dos eventos combinados.
- Modify: `apps/api/src/modules/operations/dashboard.routes.ts` — contagens reais da fábrica.
- Modify: `apps/api/src/modules/production/production-orders.routes.ts` — permissão de produção.
- Modify: `apps/api/src/modules/operations/chat.routes.ts` — validação e autorização das ações.
- Modify: `apps/api/src/app.ts` — limites, rate limit e envelope de erros.
- Modify: `apps/api/src/modules/**/*.ts` — permissões por módulo e correção de textos mojibake.
- Test: testes correspondentes junto aos módulos e infraestrutura.

### Task 1: JWT seguro e autenticação consistente

**Files:**

- Create: `apps/api/src/infrastructure/security/jwt-secret.ts`
- Modify: `apps/api/src/modules/identity/auth.routes.ts`
- Modify: `apps/api/src/infrastructure/middleware/auth.ts`
- Test: `apps/api/src/infrastructure/security/jwt-secret.test.ts`
- Test: `apps/api/src/modules/identity/auth-system-policy.test.ts`

**Interfaces:**

- Produces `getJwtSecret(): string`, que lança erro de configuração quando `JWT_SECRET` não existe ou tem menos de 32 bytes.
- Consumes `normalizeSystem` e `canAccessSystem` já existentes.

- [ ] **Step 1: Escrever testes falhando** para segredo ausente, segredo curto e segredo válido; verificar que `/auth/me` rejeita token de sistema incompatível.
- [ ] **Step 2: Rodar os testes** e confirmar falha pelo fallback literal/ausência de validação.
- [ ] **Step 3: Implementar `getJwtSecret()`** e substituir os três usos diretos de `process.env.JWT_SECRET || ...`.
- [ ] **Step 4: Fazer `/auth/me` validar `x-system`** com `canAccessSystem` antes de responder o usuário.
- [ ] **Step 5: Rodar os testes da infraestrutura e identidade** e confirmar aprovação.

### Task 2: Autorização centralizada e rotas administrativas

**Files:**

- Create: `apps/api/src/infrastructure/middleware/permissions.ts`
- Modify: `apps/api/src/modules/identity/franchises.routes.ts`
- Modify: `apps/api/src/modules/operations/auditlog.routes.ts`
- Modify: `apps/api/src/modules/finance/finance-categories.routes.ts`
- Test: `apps/api/src/infrastructure/middleware/permissions.test.ts`
- Test: `apps/api/src/modules/identity/franchises.routes.test.ts`
- Test: `apps/api/src/modules/operations/auditlog.routes.test.ts`

**Interfaces:**

- Produces `requirePermission(permission: string, mode?: 'read' | 'write')` e `requireGlobalAdmin()`.
- Mantém `requireAdmin` compatível como atalho para `isAdmin`.

- [ ] **Step 1: Escrever testes falhando** para negar usuário sem permissão, permitir administrador e impedir mutações de franquia/auditoria por usuário comum.
- [ ] **Step 2: Rodar os testes** e confirmar que as rotas hoje permitem acesso indevido.
- [ ] **Step 3: Implementar middleware** com respostas `403` estáveis e aplicá-lo às franquias e auditoria.
- [ ] **Step 4: Aplicar permissões de financeiro** às categorias e preparar a mesma matriz para os módulos de dados.
- [ ] **Step 5: Rodar testes de autorização** e confirmar aprovação.

### Task 3: Permissões nos módulos de dados e produção

**Files:**

- Modify: rotas de eventos, tarefas, funcionários, contratantes, contratos, menus, suprimentos, utensílios, financeiro, invoices e produção.
- Test: testes de autorização por módulo.

**Interfaces:**

- Consumes `requirePermission` da Task 2.
- Produces matriz estável: `eventos`, `tarefas`, `funcionarios`, `contratantes`, `contratos`, `cardapios`, `estoque`, `financeiro`, `notas-fiscais` e `producao`.

- [ ] **Step 1: Escrever testes falhando** para GET sem leitura e POST/PUT/DELETE sem escrita em pelo menos um endpoint representativo de cada grupo.
- [ ] **Step 2: Rodar os testes** e confirmar que autenticação sozinha hoje é suficiente.
- [ ] **Step 3: Aplicar middleware** respeitando administradores e permissões existentes, sem alterar o filtro de tenant.
- [ ] **Step 4: Proteger especificamente `/production-orders/available-events` e `/reconcile-finances`** com permissão de produção/escrita.
- [ ] **Step 5: Rodar a suíte de autorização** e confirmar aprovação.

### Task 4: Eventos combinados e dados da fábrica

**Files:**

- Modify: `apps/api/src/modules/events/events.finance.ts`
- Modify: `apps/api/src/modules/events/events.routes.ts`
- Modify: `apps/api/src/modules/operations/dashboard.routes.ts`
- Modify: rotas/serviços de financeiro usados pelo dashboard da fábrica.
- Test: `apps/api/src/modules/events/events.finance.test.ts`
- Test: `apps/api/src/modules/operations/dashboard.routes.test.ts`

**Interfaces:**

- Produces `findEventForRequest(req, id, source?)`, que escolhe explicitamente `main`, `franchise` ou `factory`.
- Mantém atualização da fábrica limitada a `pickFactoryOperationalUpdate`.

- [ ] **Step 1: Escrever teste falhando** para administrador da fábrica atualizar campo operacional de evento principal e evento de franquia, mantendo origem e financeiro intactos.
- [ ] **Step 2: Rodar o teste** e confirmar o `404` causado pela busca apenas em `FactoryEvent`.
- [ ] **Step 3: Implementar busca por origem** usando `source` do corpo/registro e `getFranchiseFilter` somente para franquia.
- [ ] **Step 4: Escrever teste falhando** para dashboard da fábrica contar eventos de `FactoryEvent` e eventos combinados conforme o contrato.
- [ ] **Step 5: Atualizar dashboard/consulta financeira** sem abrir mutação financeira cruzada.
- [ ] **Step 6: Rodar os testes de eventos/dashboard** e confirmar aprovação.

### Task 5: Chat seguro e validação de entrada

**Files:**

- Modify: `apps/api/src/modules/operations/chat.routes.ts`
- Test: `apps/api/src/modules/operations/chat.routes.test.ts`

**Interfaces:**

- Consumes `requirePermission` da Task 2.
- Produces lista fechada de ações válidas e parâmetros validados antes de `executeAction`.

- [ ] **Step 1: Escrever testes falhando** para ação desconhecida, criação financeira sem permissão e parâmetros inválidos.
- [ ] **Step 2: Rodar os testes** e confirmar execução atual sem autorização/validação suficiente.
- [ ] **Step 3: Implementar allowlist, validação de parâmetros e permissão específica para `create_finance`/`create_task`**.
- [ ] **Step 4: Reduzir logs de mensagem, ação e parâmetros sensíveis** e registrar mutações em auditoria.
- [ ] **Step 5: Rodar os testes de chat** e confirmar aprovação.

### Task 6: Erros, limites e rate limit

**Files:**

- Create: `apps/api/src/infrastructure/http/errors.ts`
- Create: `apps/api/src/infrastructure/middleware/rate-limit.ts`
- Modify: `apps/api/src/infrastructure/http/response-envelope.ts`
- Modify: `apps/api/src/app.ts`
- Test: testes de envelope, erro e rate limit.

**Interfaces:**

- Produces `ApiError(code, message, status, details?)` e `normalizeApiError(error)`.
- Produces `createRateLimit(options)` com janela e máximo configuráveis.

- [ ] **Step 1: Escrever testes falhando** para erro interno não expor mensagem, erro conhecido manter código público e limite de requisição retornar `413`.
- [ ] **Step 2: Rodar os testes** e confirmar resposta atual com `err.message` cru.
- [ ] **Step 3: Implementar normalização** com `requestId` nos logs e resposta pública compatível com o cliente.
- [ ] **Step 4: Reduzir limite JSON global** e adicionar limite específico nas rotas de upload/importação.
- [ ] **Step 5: Adicionar rate limit** no login e chat, com testes de janela e reset.
- [ ] **Step 6: Rodar os testes de infraestrutura** e confirmar aprovação.

### Task 7: Exclusão segura e correção dos textos

**Files:**

- Modify: franquias, eventos, invoices, contratantes, contratos e demais rotas com entidades históricas.
- Modify: mensagens mojibake em `apps/api/src/**/*.ts`.
- Test: testes de inativação e snapshot de mensagens públicas.

**Interfaces:**

- Mantém respostas HTTP existentes, mas troca exclusão de entidades históricas por `status: 'inativa'`/`deletedAt` conforme o schema já disponível.

- [ ] **Step 1: Escrever testes falhando** para preservar franquia, nota e evento após exclusão lógica e para mensagens com acentuação correta.
- [ ] **Step 2: Rodar os testes** e confirmar remoção física/mojibake atual.
- [ ] **Step 3: Implementar exclusão lógica** nos modelos que já suportam status; para modelos sem campo, adicionar campo opcional sem migração destrutiva.
- [ ] **Step 4: Corrigir strings quebradas** e manter arquivos UTF-8/LF.
- [ ] **Step 5: Rodar testes de histórico e encoding** e confirmar aprovação.

### Task 8: Verificação integral

**Files:**

- Modify: somente correções descobertas nos testes finais.
- Test: suíte completa da API e checks do workspace.

- [ ] **Step 1: Rodar** `pnpm typecheck`.
- [ ] **Step 2: Rodar** testes da API e testes de regressão adicionados.
- [ ] **Step 3: Rodar** `pnpm check:encoding`, `pnpm check:file-size` e `git diff --check`.
- [ ] **Step 4: Rodar** builds das aplicações afetadas, incluindo `pnpm build:factory`.
- [ ] **Step 5: Revisar diff final** garantindo que nenhuma permissão foi aplicada apenas no frontend e que nenhum segredo foi adicionado ao repositório.

## Self-review

- Todos os objetivos do spec estão cobertos pelas Tasks 1–7.
- O escopo combinado de eventos é implementado antes do ajuste do dashboard, e a Task 4 explicita essa interface.
- Rate limit e erro público têm interfaces próprias na Task 6 para evitar lógica espalhada.
- Os testes de entrada inválida estão distribuídos nas Tasks 1, 5 e 6, cobrindo os principais pontos de falha.
- A Task 7 preserva dados históricos, mas deixa a decisão de campo de status limitada ao schema existente; qualquer modelo sem suporte será tratado como correção compatível e não como exclusão destrutiva.
