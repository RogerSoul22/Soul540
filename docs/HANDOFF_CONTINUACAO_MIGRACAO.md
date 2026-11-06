# Handoff - continuacao da migracao

Este documento registra o estado final da migracao. A referencia canonica e `docs/HANDOFF_MIGRACAO_MICROFRONTENDS.md`.

## Entradas ativas

- `apps/api`: API e regras de isolamento;
- `apps/main`: Principal;
- `apps/franchise`: portal compartilhado de franquias, configurado por slug;
- `apps/factory`: Fabrica;
- `packages/*` e `shared/*`: contratos, dominio, cliente HTTP, telas e regras compartilhadas.

## Dados e seguranca

- A franquia ativa canonica e Campinas, com slug `campinas`.
- A migracao `franchiseId` foi executada com `--apply` e nao encontrou pendencias.
- O administrador global nao recebe login ou sessao de franquia.
- O administrador global pode consultar eventos e financeiro consolidados no Principal.
- A Fabrica e tratada como sistema operacional separado, nao como franquia.
- O certificado A1 da matriz permanece exclusivo do Principal e e armazenado cifrado.

## Validacao executada

```text
pnpm quality:check                 OK
pnpm check:file-size               OK - maximo 170 linhas
pnpm check:encoding                OK
pnpm architecture:check            OK
node --import tsx --test ...       OK - 71 testes
pnpm build                         OK - main, franchise, factory e api
git diff --check                   OK
```

Avisos restantes sao apenas informativos: API CJS do Vite, API legada do Sass e chunks grandes no bundle.
