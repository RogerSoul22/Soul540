# Guia de organização de projeto — padrão Soul540

Este arquivo é um guia reutilizável para organizar outro projeto no mesmo padrão arquitetural. Ele descreve a separação de aplicações, páginas, estilos, código compartilhado, API, infraestrutura e documentação.

## 1. Objetivo

Organizar o projeto para que cada responsabilidade tenha um lugar previsível, evitando:

- arquivos soltos na raiz;
- estilos misturados com componentes;
- páginas com dezenas de responsabilidades;
- código compartilhado espalhado;
- regras de negócio escondidas somente no frontend;
- nomes genéricos como `parte01`, `component1`, `temp` ou `novo`;
- imports frágeis por aliases pouco claros;
- infraestrutura misturada com código da aplicação.

## 2. Estrutura de alto nível

Use uma estrutura de monorepo semelhante a esta, adaptando os nomes dos produtos:

```text
projeto/
├── apps/
│   ├── main/                 # matriz, administração ou operação central
│   ├── franchise/            # portal da franquia/unidade
│   ├── factory/              # portal operacional da fábrica
│   └── api/                  # backend da aplicação
├── packages/
│   ├── api-client/           # cliente HTTP tipado
│   ├── contracts/            # contratos compartilhados de entrada/saída
│   ├── domain/               # regras puras e políticas de domínio
│   ├── screens/              # telas/componentes compartilháveis
│   └── ui/                   # componentes visuais genéricos
├── shared/
│   ├── common/               # utilitários pequenos e agnósticos
│   ├── contracts/            # modelos compartilhados entre áreas
│   ├── events/               # componentes e tipos de eventos
│   ├── finance/              # componentes e regras visuais financeiras
│   └── checklists/           # componentes e lógica de checklist
├── infra/
│   └── docker/               # Dockerfiles, compose e configurações locais
├── scripts/                  # validações e automações do repositório
├── docs/                     # decisões, planos, padrões e regras de negócio
├── package.json
└── tsconfig.json
```

### Regras da raiz

1. A raiz contém somente configuração do monorepo, documentação, scripts e diretórios de primeiro nível.
2. Não criar `api-src`, `src` de aplicação, `public` de produto ou páginas diretamente na raiz.
3. Cada frontend deve manter seu próprio `public`, `index.html`, configuração e `src` dentro de `apps/<produto>`.
4. Arquivos gerados como `dist`, cobertura e caches não são código-fonte e não devem ser usados como referência arquitetural.
5. Configurações de infraestrutura ficam em `infra`; não espalhar Docker, Railway, Nginx ou scripts de deploy na raiz sem motivo.

## 3. Organização de cada aplicação

Cada aplicação deve ter uma responsabilidade clara:

```text
apps/main/
├── public/
├── src/
│   ├── app/                  # bootstrap, rotas e composição
│   ├── components/           # componentes exclusivos do app
│   ├── pages/                # páginas por domínio
│   ├── services/             # integrações exclusivas do app
│   └── styles/               # estilos globais do app
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

O mesmo padrão vale para `franchise` e `factory`. A API usa a mesma separação de aplicação, mas com módulos de backend.

## 4. Organização de páginas

Cada página/domínio deve possuir sua própria pasta:

```text
apps/main/src/pages/Contratantes/
├── Contratantes.tsx
├── components/               # partes visuais específicas da página
├── hooks/                    # hooks específicos da página
├── types/                    # tipos exclusivos da página
├── utils/                    # transformações e formatadores locais
├── data/                     # constantes e dados estáticos locais
├── styles/                   # todos os SCSS da página
│   ├── Contratantes.module.scss
│   ├── Contratantes.module.Form.scss
│   └── Contratantes.module.Table.scss
└── REGRAS-DE-NEGOCIO.md
```

### Regras da pasta de página

1. O arquivo principal deve orquestrar a página, não conter toda a implementação.
2. Componentes grandes devem ir para `components`.
3. Hooks devem ir para `hooks` e ter nomes iniciados por `use-`.
4. Tipos específicos devem ir para `types` ou para um arquivo `<dominio>-types.ts`.
5. Formatação, agrupamento e conversões devem ir para `utils`.
6. Todos os arquivos SCSS da página devem ficar dentro de `styles`.
7. Não deixar `.scss` solto na pasta principal da página.
8. Não criar pastas ou arquivos chamados `parte01`, `parte02`, `arquivo1`, `componenteNovo` ou equivalentes genéricos.
9. O nome deve indicar a responsabilidade: `EventDetailsModal`, `FinanceSettlementModal`, `use-eventos-controller`.
10. Toda pasta de página deve conter `REGRAS-DE-NEGOCIO.md`.

### Conteúdo de `REGRAS-DE-NEGOCIO.md`

Cada página deve documentar:

- objetivo da página;
- atores e permissões;
- regras de validação;
- estados e transições;
- efeitos financeiros ou operacionais;
- integrações com outras áreas;
- auditoria exigida;
- regras específicas do portal;
- decisões ainda pendentes.

O documento da página deve explicar o negócio, não apenas repetir nomes de componentes.

## 5. Nomenclatura

### Arquivos e pastas

| Elemento | Padrão |
|---|---|
| Pasta de domínio | PascalCase: `Contratantes`, `NotasFiscais` |
| Componente React | PascalCase: `ContractFormModal.tsx` |
| Hook | kebab-case com `use-`: `use-eventos-controller.ts` |
| Tipos | kebab-case ou nome do domínio: `event-types.ts` |
| Utilitário | nome semântico: `currency.ts`, `date.ts`, `checklist-utils.ts` |
| Estilo principal | `<Pagina>.module.scss` |
| Estilo especializado | `<Pagina>.module.<Area>.scss` |
| Regra de negócio | `REGRAS-DE-NEGOCIO.md` |
| Decisão arquitetural | `docs/decisoes/NNNN-titulo.md` |
| Especificação | `docs/superpowers/specs/YYYY-MM-DD-titulo-design.md` |

### Proibições

- não usar `parte01`, `parte02`, `final`, `novo`, `old`, `temp` ou `utils2`;
- não duplicar o mesmo arquivo com variações de nome;
- não abreviar domínio de forma que esconda seu significado;
- não misturar português e inglês no mesmo domínio sem necessidade;
- não usar alias como `@main`, `@shared` ou `@api` quando o padrão do projeto exigir caminho explícito.

### Imports

Use caminhos explícitos e previsíveis, preferencialmente relativos ao arquivo atual:

```ts
import styles from './styles/Contratantes.module.scss';
import { useContratantesController } from './hooks/use-contratantes-controller';
```

Não usar:

```ts
import styles from '@main/pages/Contratantes/styles/Contratantes.module.scss';
```

Se o projeto adotar aliases no futuro, eles devem ser poucos, documentados e consistentes no TypeScript, bundler e editor.

## 6. Shared e packages

### `shared`

Use `shared` para código compartilhado entre aplicações que ainda pertence a uma área de produto:

- `shared/common`: moeda, datas, números, telefone e texto;
- `shared/finance`: componentes, categorias e visualizações financeiras;
- `shared/events`: componentes e tipos de eventos;
- `shared/checklists`: componentes e lógica de checklist.

Regras:

1. Não transformar `shared` em uma pasta genérica para qualquer arquivo.
2. Organizar cada domínio em subpastas semânticas: `components`, `hooks`, `types`, `utils`, `styles`.
3. Um utilitário usado por um único domínio deve permanecer no domínio; só mover para `shared/common` quando houver reutilização real.
4. Evitar dependência de `shared` em detalhes exclusivos de uma aplicação.

### `packages`

Use `packages` para contratos e bibliotecas que precisam ser reutilizados como unidades independentes:

- `api-client`: chamadas HTTP e tratamento de resposta;
- `contracts`: schemas e tipos de entrada/saída;
- `domain`: políticas puras, dinheiro, datas, estados e regras sem React;
- `screens`: telas reutilizáveis entre portais;
- `ui`: componentes visuais genéricos.

Regra importante: regras críticas de segurança, tenant e financeiro devem existir no backend/domínio. O frontend apenas apresenta e solicita comandos.

## 7. Organização da API

Estruture o backend por módulos de negócio:

```text
apps/api/src/
├── config/
├── infrastructure/
│   ├── middleware/
│   ├── schemas/
│   ├── database/
│   └── http/
├── modules/
│   ├── identity/
│   ├── events/
│   ├── finance/
│   ├── operations/
│   └── production/
└── scripts/
```

Dentro de cada módulo, separar quando o tamanho justificar:

```text
modules/events/
├── events.routes.ts
├── events.schemas.ts
├── events.service.ts
├── events.repository.ts
├── events.policy.ts
└── events.types.ts
```

Regras:

1. A API é a fonte de verdade para autenticação, tenant, permissões e regras financeiras.
2. Toda rota protegida deve obter a unidade pelo contexto autenticado.
3. O cliente não pode enviar livremente `unit`, `origin`, `automatic`, `kind`, `eventId` ou estados derivados.
4. Mutação importante deve ter comando explícito: liquidar, reabrir, cancelar, emitir, concluir ou reverter.
5. Rotas devem validar entrada com schema.
6. Dados sensíveis e operações irreversíveis devem gerar auditoria.
7. Repositórios devem aplicar filtros de unidade sem depender da tela.
8. Não duplicar regra crítica em três rotas diferentes; extraí-la para serviço ou política de domínio.

## 8. Infraestrutura

Tudo que executa, publica ou provisiona o sistema deve ficar em `infra`:

```text
infra/
└── docker/
    ├── docker-compose.yml
    ├── Dockerfile.api
    ├── Dockerfile.main
    └── nginx.conf
```

Regras:

- configurações de deploy, containers e serviços externos ficam em `infra`;
- variáveis sensíveis ficam em ambiente/secret manager, nunca no código;
- arquivos de desenvolvimento local devem indicar claramente seu propósito;
- infraestrutura removida não deve permanecer como pasta `legacy` sem uso.

## 9. Documentação

Organize `docs` por finalidade:

```text
docs/
├── decisoes/                 # decisões arquiteturais permanentes
├── plans/                    # planos de implementação
├── superpowers/
│   ├── plans/
│   └── specs/
├── padroes/                  # padrões de tela e arquitetura do produto
└── GUIA-ORGANIZACAO-PROJETO.md
```

Regras:

1. Decisão deve explicar contexto, escolha e consequência.
2. Especificação deve separar objetivo, escopo, restrições, regras e pendências.
3. Regra de negócio local fica junto da página; regra transversal fica em `docs` e no domínio.
4. Não deixar documentação importante somente em comentários de código.
5. Se uma decisão for substituída, registrar a nova decisão e marcar a anterior como superada.

## 10. Processo de reorganização

Ao aplicar este guia em outro projeto:

1. Inventariar arquivos e pastas antes de mover qualquer coisa.
2. Identificar aplicações, API, código compartilhado, infraestrutura, scripts e documentação.
3. Definir o destino de cada arquivo antes de executar movimentos.
4. Criar as pastas semânticas.
5. Mover estilos para `styles` e dividir arquivos muito grandes por responsabilidade.
6. Separar componentes, hooks, tipos, utilitários e dados locais.
7. Renomear arquivos genéricos para nomes de domínio.
8. Atualizar imports usando caminhos explícitos.
9. Criar `REGRAS-DE-NEGOCIO.md` em cada pasta de página.
10. Procurar referências antigas, aliases, caminhos quebrados e imports para arquivos removidos.
11. Executar typecheck, builds e validações de arquitetura.
12. Só depois remover arquivos realmente órfãos, com confirmação de referências.

## 11. Critérios de qualidade

Uma reorganização está pronta quando:

- cada aplicação compila de forma independente;
- a API inicia e compila;
- não há imports apontando para caminhos antigos;
- não há SCSS solto na pasta de uma página;
- não existem nomes genéricos ou pastas `parteXX`;
- cada página possui seu arquivo de regras de negócio;
- regras de tenant e permissões continuam no servidor;
- arquivos permanecem em UTF-8, LF e com newline final;
- arquivos de código respeitam o limite de tamanho definido pelo projeto;
- Docker/infraestrutura valida sua configuração;
- `git diff --check` não encontra problemas de whitespace;
- arquivos gerados não são tratados como fonte.

## 12. Prompt para usar em outro chat do Codex

Copie o texto abaixo junto com este arquivo:

```text
Use o arquivo GUIA-ORGANIZACAO-PROJETO.md como padrão obrigatório de organização.

Primeiro faça um inventário somente leitura do projeto e apresente o mapa de pastas, arquivos soltos, aliases, estilos fora de styles, nomes genéricos e possíveis referências quebradas.

Depois organize o projeto por aplicações, páginas, componentes, hooks, tipos, utils, styles, shared, packages, API, infra, scripts e docs conforme o guia.

Para cada pasta de página, crie REGRAS-DE-NEGOCIO.md com objetivo, atores, permissões, validações, estados, efeitos, integrações, auditoria e pendências específicas.

Preserve o comportamento existente, não apague arquivos sem verificar referências e use caminhos explícitos nos imports. Ao final, valide typecheck, build, encoding, tamanho de arquivos, configuração de infraestrutura e referências antigas.
```

## 13. Escopo da aplicação

Este guia define organização e documentação. Ele não autoriza automaticamente mudanças nas regras de negócio, remoção de módulos, exclusão de testes ou alteração de comportamento. Essas decisões devem ser aprovadas separadamente para cada projeto.
