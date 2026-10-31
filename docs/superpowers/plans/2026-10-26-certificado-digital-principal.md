# Certificado Digital Principal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Armazenar e administrar o certificado A1 da matriz em um cofre criptografado no banco, usando-o somente no backend durante a emissão de NF-e.

**Architecture:** A API fiscal terá um modelo singleton da unidade `main`, um `SecretCipher` baseado em AES-256-GCM e um serviço que valida, cifra, abre e remove o certificado. As rotas exigirão usuário administrador no escopo `main`; o frontend principal terá uma tela de configuração fiscal que recebe o arquivo e exibe apenas metadados. O emissor NF-e receberá o certificado aberto por dependência, eliminando o cache/env global como fonte normal.

**Tech Stack:** Node.js, TypeScript, Express, Mongoose, `node:crypto`, `node-forge`, React, React Router, componentes `@soul540/ui`, testes `node:test` via `tsx`.

**Spec:** `docs/superpowers/specs/2026-10-26-certificado-digital-principal-design.md`

## Global Constraints

- O escopo desta entrega é somente a unidade `main`; franquias e fábrica não terão cofre nem emissão NF-e com esse certificado.
- PFX e senha ficam criptografados separadamente; `ENCRYPTION_KEY` é externo ao banco e deve ter 64 caracteres hexadecimais.
- A API nunca retorna PFX, senha, Base64, PEM ou chave privada.
- Auditoria e logs não podem conter segredos.
- A migração do ambiente é única e remoção intencional não pode reimportar o segredo automaticamente.
- Arquivos novos ou alterados devem respeitar o limite de 170 linhas; separar responsabilidades quando necessário.

## Review Focus

- Chave ausente, curta, inválida ou zerada: falha explícita antes de cifrar ou abrir um segredo. Teste em `secret-cipher.test.ts`.
- Contexto de proprietário/campo alterado: descriptografia falha, impedindo troca de ciphertext entre registros. Teste em `secret-cipher.test.ts`.
- Certificado expirado, senha incorreta ou PFX inválido: salvar e emitir recusam a operação sem persistir segredo inválido. Teste em `main-fiscal-certificate.test.ts`.
- Usuário administrador tentando escopo `franchise`/`factory`: recebe 403 e não acessa o cofre principal. Teste em `main-fiscal-certificate.routes.test.ts`.
- Remoção após migração: limpa o certificado e não reimporta os valores legados do ambiente. Teste em `main-fiscal-certificate.test.ts`.

### Task 1: Criptografia autenticada e contrato do certificado

**Files:**
- Create: `apps/api/src/infrastructure/crypto/secret-cipher.ts`
- Create: `apps/api/src/infrastructure/crypto/secret-cipher.test.ts`
- Create: `apps/api/src/modules/fiscal/main-certificate-types.ts`

**Interfaces:**
- Produces `SecretCipher.encrypt(value: string, context: string): string` and `SecretCipher.decrypt(payload: string, context: string): string`.
- Produces `MainCertificateSummary` and `OpenedMainCertificate` types used by the service and routes.

- [ ] Write tests for AES-256-GCM round-trip, random IV, `v1` payload format, wrong context rejection, malformed payload rejection and invalid key rejection.
- [ ] Run `pnpm exec tsx --test apps/api/src/infrastructure/crypto/secret-cipher.test.ts` and confirm the new tests fail because the module is absent.
- [ ] Implement the cipher with `ENCRYPTION_KEY`, `node:crypto`, authenticated additional data containing `main` and the encrypted field, and no logging of values.
- [ ] Run the focused test again and confirm it passes.

### Task 2: Modelo e serviço do cofre principal

**Files:**
- Create: `apps/api/src/modules/fiscal/main-certificate.model.ts`
- Create: `apps/api/src/modules/fiscal/main-certificate.service.ts`
- Create: `apps/api/src/modules/fiscal/main-certificate.test.ts`
- Delete or replace: `apps/api/src/infrastructure/services/cert.ts`

**Interfaces:**
- `getMainCertificateSummary(): Promise<MainCertificateSummary>`.
- `saveMainCertificate(input: { certificateBase64: string; password: string }): Promise<MainCertificateSummary>`.
- `removeMainCertificate(): Promise<void>`.
- `openMainCertificate(): Promise<OpenedMainCertificate>`.
- `ensureLegacyMainCertificateImported(): Promise<void>`.
- `MainCertificateModel` persists only encrypted PFX/password and non-sensitive metadata in the main certificate collection.

- [ ] Write tests for valid save, encrypted-at-rest assertions, summary without secrets, invalid PFX/password/expiry rejection, open/decrypt, remove and one-time legacy import.
- [ ] Run `pnpm exec tsx --test apps/api/src/modules/fiscal/main-certificate.test.ts` and confirm failure before implementation.
- [ ] Implement PFX inspection with the existing `node-forge` dependency, metadata extraction, AES encryption and a singleton record with a migration-completed marker.
- [ ] Implement removal as a logical clear of encrypted fields plus migration marker preservation, preventing reimport after intentional removal.
- [ ] Adapt the legacy `cert.ts` contract into a compatibility adapter only if needed by the emitter; it must no longer read env values during normal main issuance.
- [ ] Run focused tests and confirm they pass.

### Task 3: API routes, access control and NF-e integration

**Files:**
- Create: `apps/api/src/modules/fiscal/main-certificate.routes.ts`
- Create: `apps/api/src/modules/fiscal/main-certificate.routes.test.ts`
- Modify: `apps/api/src/app.ts`
- Modify: `apps/api/src/modules/finance/invoices-emission.routes.ts`
- Modify: `apps/api/src/infrastructure/services/nfe-sefaz.ts`
- Modify: `apps/api/src/infrastructure/services/nfe-xml.ts`

**Interfaces:**
- `GET /api/fiscal/certificado` returns only summary metadata.
- `PUT /api/fiscal/certificado` accepts `{ certificado: string, senha: string }` and returns summary.
- `DELETE /api/fiscal/certificado` clears the matrix certificate.
- All three routes require `requireAdmin` and `getTenantUnit(req) === 'main'`.
- `emitirNFe(inv, nNF, certificate: OpenedMainCertificate)` and `signNFe(xml, certificate)` receive credentials explicitly.

- [ ] Write route tests for admin main access, 403 for franchise/factory scope, no-secret response, validation errors and removal; write an emission regression test proving the NF-e path opens the main vault and rejects non-main scope.
- [ ] Run the focused route tests and confirm they fail before the routes/guard are present.
- [ ] Implement the fiscal router, register it after authentication, and use existing audit logging without sensitive fields.
- [ ] Update the NF-e path to reject non-main units, open the encrypted certificate once per request, check validity, and pass the opened credentials into signing/HTTPS. Keep NFS-e/Asaas unchanged.
- [ ] Run API focused tests and `pnpm build:api`.

### Task 4: Configuração fiscal no sistema principal

**Files:**
- Create: `apps/main/src/pages/ConfiguracaoFiscal/ConfiguracaoFiscal.tsx`
- Create: `apps/main/src/pages/ConfiguracaoFiscal/hooks/use-configuracao-fiscal.ts`
- Create: `apps/main/src/pages/ConfiguracaoFiscal/styles/ConfiguracaoFiscal.module.scss`
- Modify: `apps/main/src/routes.ts`
- Modify: `apps/main/src/App.tsx`
- Modify: `apps/main/src/components/Sidebar/sidebar-group-sistema.tsx`

**Interfaces:**
- The page calls `GET`, `PUT` and `DELETE /api/fiscal/certificado` through `apiFetch` with `X-System: main`.
- The form accepts only `.pfx` and `.p12`, sends Base64 plus password, and renders status, titular, CNPJ and expiration only.
- The route is wrapped by the existing `__admin__` permission guard.

- [ ] Write a structural/UI test for the page route, admin-only navigation and absence of certificate/password rendering in the summary state.
- [ ] Run the focused UI test or TypeScript/build check and confirm it fails before the page/route exists.
- [ ] Implement the page with the existing UI package, loading/error/success states, replacement confirmation and removal confirmation; never persist the file or password in local storage.
- [ ] Register the route and sidebar item under Sistema with the existing admin key.
- [ ] Run `pnpm build:main` and confirm the page compiles.

### Task 5: Migration, environment documentation and full verification

**Files:**
- Create: `apps/api/src/scripts/migrate-main-certificate.ts`
- Modify: `package.json`
- Modify: `.env.example`
- Modify: `docs/HANDOFF_CONTINUACAO_MIGRACAO.md` or a focused operational document

- [ ] Write migration tests proving a configured legacy env is imported once and a removed certificate is not recreated.
- [ ] Run the migration tests and confirm failure before implementation.
- [ ] Implement an explicit `pnpm migrate:main-certificate` command that connects to MongoDB, encrypts the legacy env values, persists the main record and marks migration complete without printing secrets.
- [ ] Add `ENCRYPTION_KEY` and the migration/removal procedure to `.env.example` without copying real credentials.
- [ ] Run `pnpm exec tsx --test` for all affected API tests, `pnpm typecheck`, `pnpm build:main`, `pnpm build:api`, `pnpm check:file-size`, `pnpm check:encoding` and `pnpm architecture:check`.
- [ ] Inspect the diff for secret values and confirm no PFX, password, PEM or Base64 certificate is present in source, logs, tests or documentation.
