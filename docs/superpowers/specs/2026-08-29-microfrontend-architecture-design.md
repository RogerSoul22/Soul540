# Arquitetura de Micro-frontends Soul540

## Objetivo

Transformar o repositório em um monorepo com micro-frontends independentes,
preservando URLs, regras de negócio, API e comportamento existentes.

## Restrições

- Cada portal deve ter build, imagem Docker e publicação independentes.
- Nenhum app pode importar código de outro app.
- Todo arquivo manual `.ts`, `.tsx` e `.scss` deve ter no máximo 200 linhas e
  120 caracteres por linha.
- Formatação automática é obrigatória; código compactado em uma linha não é
  permitido.
- Nomes descrevem a responsabilidade. Não usar `part-*`, `common`, `helpers`
  ou `utils` genéricos.
- Rotas públicas, contratos HTTP, permissões e regras de negócio atuais não
  podem mudar durante a migração.

## Estrutura-alvo

```text
apps/
  main/
  factory/
  franchise/
  api/
packages/
  api-client/
  contracts/
  domain/
  screens/
  ui/
  test-utils/
infra/
  docker/
  nginx/
docs/
  architecture/
  adr/
```

## Apps

Cada app contém somente bootstrap, rotas, configuração do portal, módulos
exclusivos e composição de telas. `main`, `factory` e `franchise` permanecem
SPAs distintas. A API permanece única em `apps/api` e mantém o prefixo `/api`.

```text
apps/<portal>/src/
  app/
    portal-config.ts
    providers.tsx
    routes.tsx
  modules/
  components/
  styles/
  main.tsx
```

`portal-config.ts` define navegação, permissões, recursos habilitados, unidade
e caminhos base. A configuração substitui condicionais espalhadas entre páginas.

## Pacotes

- `@soul540/contracts`: tipos públicos, schemas Zod e DTOs.
- `@soul540/domain`: dinheiro, datas, liquidação e políticas financeiras puras.
  Não importa React, Express, banco ou HTTP.
- `@soul540/api-client`: autenticação, tratamento de erros e cliente HTTP
  tipado. Não importa componentes React.
- `@soul540/ui`: tokens, componentes visuais e layouts configuráveis. Não contém
  regra de negócio.
- `@soul540/screens`: telas iguais e configuráveis, como financeiro, eventos,
  pessoas, contratos, estoque e checklist.
- `@soul540/test-utils`: fixtures e verificadores compartilhados.

Um pacote só pode depender de outro pacote na direção `ui/contracts/domain` para
baixo. Nenhum pacote pode importar de `apps/`.

## API

```text
apps/api/src/
  app.ts
  config/
  infrastructure/database/
  middleware/
  modules/
    finance/
      finance.routes.ts
      finance.service.ts
      finance.repository.ts
      finance.schema.ts
      finance.model.ts
    events/
    production/
    identity/
```

Cada módulo expõe as mesmas rotas atuais. Manipulação HTTP, regra de negócio e
acesso ao MongoDB não permanecem no mesmo arquivo.

## Padronização de páginas

Telas com fluxo equivalente passam a ter implementação única em
`@soul540/screens`. Cada app fornece `PortalConfig` para habilitar recursos e
ajustar textos ou permissões. Módulos exclusivos, como pedidos e produção,
permanecem no app da fábrica.

## Guardrails

`pre-commit` e CI executam, nesta ordem:

1. `format:check` para garantir Prettier.
2. `architecture:check` para tamanho de arquivos, colunas, nomenclatura e
   fronteiras de importação.
3. testes aplicáveis.
4. build do app ou pacote modificado.

Arquivos gerados, lockfiles, `dist/` e `node_modules/` são excluídos das regras
de tamanho. Arquivos de teste são incluídos.

## Publicação

Cada app possui Dockerfile e pipeline próprios. Uma mudança em `apps/factory`
publica somente a fábrica; mudanças em `packages/` disparam os consumidores
afetados. A API é publicada independentemente dos frontends.

## Migração

1. Criar workspaces, guardrails e estrutura sem mover comportamento.
2. Extrair contratos e regras puras com reexports temporários em `shared/`.
3. Extrair UI e telas iguais, usando `PortalConfig` para diferenças reais.
4. Mover os portais para `apps/` mantendo builds e caminhos base.
5. Dividir a API por módulos, preservando endpoints e testes.
6. Habilitar imagens e pipelines de publicação independentes.
7. Remover os diretórios legados somente após validar equivalência.

## Estado atual da transição

- `apps/main`, `apps/factory`, `apps/franchise` e `apps/api` são entradas
  independentes para build, execução e publicação.
- As fontes dos portais e do servidor permanecem nos diretórios legados nesta
  etapa para preservar rotas e permitir reversão. As entradas em `apps/` não
  importam entre si.
- `infra/docker` contém a composição local e imagens separadas para API e cada
  portal. Pipelines de CI/CD não fazem parte desta mudança.
- Componentes, tema, cliente HTTP e telas equivalentes já migrados ficam em
  `packages/`; telas restantes são movidas gradualmente após validação de
  equivalência.
- As telas de login de Fábrica e Campinas usam `UnitLoginScreen`; a auditoria
  dos três portais usa `AuditLogScreen`, ambas em `@soul540/screens` com
  adaptadores locais apenas para autenticação, cliente HTTP, estilos e textos.

## Validação mais recente

- `build:main`, `build:factory`, `build:franchise` e `build:api` validam artefatos publicáveis de forma independente; o comando `build` raiz executa os quatro.
- Regras puras de recorrência, moeda, ordenação, data de emissão de NF-e e link de WhatsApp são fornecidas por `@soul540/domain` e protegidas por testes estruturais.
