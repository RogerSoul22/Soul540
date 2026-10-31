# Certificado fiscal UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ajustar a tela de certificado fiscal do sistema principal para os dois estados visuais fornecidos pelo usuário.

**Architecture:** O hook atual continuará responsável por carregar, salvar e remover o certificado. A página passará a renderizar um estado configurado e um estado vazio com componentes HTML próprios, e o SCSS definirá o cartão, upload, metadados e ações.

**Tech Stack:** React, TypeScript, SCSS Modules, `@soul540/ui`, `node:test` via `tsx`.

**Spec:** `docs/superpowers/specs/2026-10-26-certificado-fiscal-ui-design.md`

## Constraints

- Não alterar API, banco, criptografia ou permissões.
- Não renderizar PFX, senha, Base64 ou PEM.
- Respeitar o limite de 170 linhas por arquivo.
- Manter confirmação para remoção e substituição.

### Task 1: contrato visual estrutural

**Files:**
- Modify: `apps/main/src/pages/ConfiguracaoFiscal/ConfiguracaoFiscal.structure.test.ts`

- [ ] Adicionar asserções para os dois estados, validade/dias restantes, área de upload, senha e ações destrutivas.
- [ ] Executar o teste e confirmar que ele falha com a estrutura atual.

### Task 2: implementação da tela

**Files:**
- Modify: `apps/main/src/pages/ConfiguracaoFiscal/ConfiguracaoFiscal.tsx`
- Modify: `apps/main/src/pages/ConfiguracaoFiscal/styles/ConfiguracaoFiscal.module.scss`

- [ ] Implementar estado configurado com faixa azul, validade, dias restantes, titular, CNPJ e remoção.
- [ ] Implementar estado vazio com área clicável `.pfx/.p12`, campo de senha e envio.
- [ ] Preservar a confirmação de substituição/remoção e o tratamento de erros existente.
- [ ] Executar o teste estrutural e o build principal.

### Task 3: verificação

- [ ] Executar os testes da configuração fiscal.
- [ ] Executar typecheck, build principal, limite de arquivo, encoding e diff-check.
