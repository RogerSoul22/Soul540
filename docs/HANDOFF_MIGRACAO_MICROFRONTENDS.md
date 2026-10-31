# Handoff - migracao de micro-frontends Soul540

## Estado atual

A migracao estrutural foi concluida. O repositorio agora usa um workspace pnpm com quatro entradas independentes:

- `apps/main`: sistema principal;
- `apps/franchise`: portal das franquias, com rota canonica `/itu`;
- `apps/factory`: fabrica, com rota canonica `/fabrica`;
- `apps/api`: API Express independente.

O codigo legado em `src/`, `server/`, `factory/`, `franchise/` e `api/` foi removido do filesystem. Os pacotes reutilizaveis ficam em `packages/` e o compartilhamento de dominio permanece em `shared/`.

## Comandos

```powershell
pnpm dev
pnpm build
pnpm quality:check
pnpm build:api
pnpm build:main
pnpm build:franchise
pnpm build:factory
```

`pnpm dev` inicia API, Principal, Franquia e Fabrica nos ports 3001, 5173, 5174 e 5175.

## Regras preservadas

- Administrador global acessa o Principal e a Fabrica, mas nao entra no portal de uma franquia.
- O Principal consulta dados consolidados de eventos e financeiro sem assumir a sessao de uma franquia.
- Usuarios de franquia ficam isolados pelo `franchiseId`.
- A Fabrica pode consultar eventos operacionais de todas as origens quando o usuario for administrador global.
- A modalidade `feirinha` e recorrente; `evento_avulso` representa evento unico e tambem dados legados sem modalidade.
- O certificado digital A1 fica somente no Principal, cifrado no banco e sem segredo no frontend.

## Migracao de dados

O comando idempotente foi executado em 2026-10-31:

```powershell
pnpm migrate:franchise-tenants -- --slug itu --apply
```

Resultado: zero pendencias e zero documentos modificados nas colecoes de franquia, auditoria, producao e usuarios.

Para o certificado legado, a importacao continua sendo uma operacao separada e explicita:

```powershell
pnpm migrate:main-certificate
```

Ela exige `ENCRYPTION_KEY` com 64 caracteres hexadecimais. Depois da importacao validada, remova `NFE_CERT_BASE64` e `NFE_CERT_PASSWORD` do ambiente do servidor.

## Validacao final

- `pnpm quality:check`: passou;
- `pnpm check:file-size`: passou, maximo de 170 linhas;
- `pnpm check:encoding`: passou;
- arquitetura: passou;
- API: 71 testes passaram;
- `pnpm build`: passou nos quatro projetos;
- `git diff --check`: passou.

Os builds ainda exibem apenas avisos nao bloqueantes do Sass/Vite e de chunks grandes.

Nao criar commits, push ou reset sem pedido explicito. Preservar alteracoes existentes no worktree.
