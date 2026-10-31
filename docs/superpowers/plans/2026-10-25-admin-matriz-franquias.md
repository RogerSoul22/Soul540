# Administrador da matriz e visão consolidada de franquias Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bloquear o administrador global no portal de franquia e permitir que ele consulte agendamentos e financeiro de todas as franquias no sistema Principal.

**Architecture:** A autenticação distinguirá administrador global (`isAdmin` na unidade `main`) de administrador local vinculado a uma franquia. Consultas administrativas usarão `scope=franchise` ou `scope=combined` com `X-System: main`, sem autenticar o usuário no sistema de franquia. Eventos de franquia exibidos no Principal serão somente leitura.

**Tech Stack:** Express, Mongoose, JWT/cookies, React, React Router, TypeScript, Node test runner, Vite.

**Spec:** `docs/superpowers/specs/2026-10-25-admin-matriz-franquias-design.md`

## Global Constraints

- Não criar commits; o projeto exige commit somente mediante solicitação explícita.
- Preservar o isolamento por `franchiseId` e nunca aceitar `franchiseId` enviado pelo cliente como autoridade para usuário não administrativo.
- O administrador global deve continuar podendo consultar dados consolidados no Principal.
- Usuários locais de franquia não podem ganhar acesso a outras franquias.
- Manter o limite de 170 linhas por arquivo em `apps/` e `packages/`.

## Review Focus

- Administrador global tentando login com `X-System: franchise` deve receber 403 e nenhum cookie de sessão.
- Administrador local de franquia deve continuar podendo entrar somente no próprio portal.
- Administrador global consultando `scope=franchise` no Principal deve receber todos os registros das franquias sem informar `X-Franchise-Id`.
- Usuário comum tentando usar `scope=franchise` no Principal deve continuar restrito ou ser recusado, nunca receber dados de outra franquia.
- Eventos de franquia exibidos no Principal devem ser consultáveis, mas não editáveis, finalizáveis ou excluíveis pelo fluxo de eventos da matriz.

---

### Task 1: Política de autenticação por sistema

**Files:**
- Create: `apps/api/src/modules/identity/auth-system-policy.ts`
- Test: `apps/api/src/modules/identity/auth-system-policy.test.ts`
- Modify: `apps/api/src/modules/identity/auth.routes.ts`
- Modify: `apps/api/src/infrastructure/middleware/auth.ts`

**Interfaces:**
- Produces `isGlobalAdmin(user)` and `canAccessSystem(user, requestedSystem)` for login and authenticated API requests.

- [ ] Escrever testes para administrador global bloqueado no sistema `franchise`, permitido no `main`, administrador local de franquia permitido no próprio sistema e usuário comum bloqueado fora da unidade.
- [ ] Implementar a política pura e reutilizá-la no login.
- [ ] Aplicar a mesma política após autenticação da API para impedir que o administrador global simule acesso ao portal apenas alterando `X-System`.
- [ ] Rodar `node --import tsx --test apps/api/src/modules/identity/auth-system-policy.test.ts` e confirmar PASS.

### Task 2: Relatórios administrativos de eventos e financeiro

**Files:**
- Modify: `apps/api/src/infrastructure/franchise-scope.ts`
- Modify: `apps/api/src/infrastructure/event-tenant.ts`
- Modify: `apps/api/src/modules/events/events.routes.ts`
- Modify: `apps/api/src/modules/finance/finance-tenant.ts`
- Modify: `apps/api/src/modules/finance/finance.routes.ts`
- Test: `apps/api/src/modules/franchise-reporting.test.ts`

**Interfaces:**
- `GET /api/events?scope=franchise` selects the franchise event store for an administrator global.
- `GET /api/finances?scope=franchise` selects all franchise finance entries for an administrator global.
- `scope=combined` remains available for consolidated reporting.

- [ ] Escrever testes de seleção de escopo e de filtro: admin Principal consulta franquias; usuário não admin não amplia escopo; filtro por `X-Franchise-Id` continua funcionando quando usado administrativamente.
- [ ] Alterar seleção de stores/modelos para respeitar o escopo solicitado somente para administradores.
- [ ] Fazer `GET /api/finances` suportar `main`, `franchise`, `factory` e `combined` sem mudar as rotas de mutação.
- [ ] Garantir que filtros administrativos de franquia sem `X-Franchise-Id` retornem todas as franquias, enquanto usuários locais continuam presos ao próprio `franchiseId`.
- [ ] Rodar o teste de reporting e os testes existentes de isolamento.

### Task 3: Visão consolidada no sistema Principal

**Files:**
- Modify: `apps/main/src/contexts/use-main-app-data.ts`
- Modify: `apps/main/src/pages/Financeiro/hooks/use-financeiro-effects.ts`
- Modify: `apps/main/src/pages/Eventos/hooks/use-eventos-controller.ts`
- Modify: `apps/main/src/pages/Eventos/components/EventCard.tsx`
- Modify: `apps/main/src/pages/Eventos/components/EventCardActions.tsx`
- Modify: `packages/contracts/src/events.ts`

**Interfaces:**
- Principal solicita franquias com `X-System: main` e query explícita de relatório.
- Eventos com `source=franchise` são apresentados como consulta somente leitura.

- [ ] Fazer o carregamento do Principal buscar eventos de franquia somente para administrador e mesclá-los aos eventos próprios.
- [ ] Trocar as requisições auxiliares do Financeiro que usam `X-System: franchise` por consultas de reporting com `X-System: main` e `scope=franchise`/`scope=factory`.
- [ ] Desabilitar ações de edição, finalização e exclusão para eventos de franquia exibidos na matriz, mantendo visualização e WhatsApp.
- [ ] Expor o `franchiseId` opcional no contrato de eventos para identificar a origem sem permitir mutação.
- [ ] Rodar `pnpm typecheck` e o build do Principal.

### Task 4: Verificação final e documentação

**Files:**
- Modify: `docs/HANDOFF_CONTINUACAO_MIGRACAO.md`
- Modify: `.superpowers/sdd/2026-10-25-multifranquias/progress.md`

- [ ] Rodar todos os testes relacionados a autenticação, isolamento e reporting.
- [ ] Rodar `pnpm typecheck`, `pnpm build:api`, `pnpm build:main`, `pnpm check:file-size`, `pnpm check:encoding` e `git diff --check`.
- [ ] Registrar a alteração e eventuais avisos preexistentes no handoff e no ledger.
