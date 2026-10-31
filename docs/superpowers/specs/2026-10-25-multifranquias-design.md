# Multi-franquias Soul540

**Status:** implementado; migração de dados aguardando execução explícita com `--apply`
**Data:** 2026-10-25
**Escopo:** suporte a várias franquias no mesmo portal, API e banco, mantendo Itu como primeira unidade.

## Objetivo

Transformar `franchise` de uma unidade técnica única em um contexto multi-tenant identificado por `franchiseId`, sem duplicar portal ou banco por franquia e sem permitir que dados de uma franquia apareçam para outra.

## Metas

- Cadastrar franquias com identificador estável e `slug` único.
- Vincular usuários de franquia a uma franquia específica.
- Filtrar no backend eventos, financeiro, tarefas, funcionários, prestadores, contratos, cardápios, estoque, auditoria e dados de produção pelo `franchiseId` autenticado.
- Permitir que administradores da matriz selecionem uma franquia autorizada.
- Manter `unit` como contexto do portal (`main`, `franchise`, `factory`).
- Migrar os dados atuais da franquia Itu para o novo identificador.
- Manter `/itu` funcionando como rota compatível e preparar rotas dinâmicas para novas franquias.

## Fora do escopo

- Criar um banco ou deploy separado por franquia.
- Alterar regras fiscais, endereço legal ou códigos municipais sem dados oficiais.
- Reescrever as regras financeiras existentes além da inclusão do escopo da franquia.
- Trocar o identificador técnico `unit: 'franchise'`.

## Abordagens consideradas

### Portal e banco separados por franquia

Isola fisicamente os dados, mas duplica deploy, configuração e manutenção. Não atende ao objetivo de crescimento com portal compartilhado.

### Coleções paralelas com `franchiseId`

Preserva as coleções atuais de franquia e adiciona o identificador em cada registro. É uma transição possível, mas prolonga a separação artificial entre matriz, franquia e fábrica.

### Tenant compartilhado por `franchiseId` — escolhida

Mantém o portal e o banco compartilhados, usando `franchiseId` como vínculo obrigatório em registros pertencentes a franquias. É a opção escolhida porque reduz duplicação e torna o isolamento explícito em todas as consultas.

## Modelo de dados

`Franchise` passa a conter:

- `id` como identificador estável;
- `slug` normalizado e único;
- `name`, `city`, `state`, `owner`, `status`, `openDate` e `monthlyFee`;
- `unit: 'franchise'` apenas como compatibilidade durante a migração.

`User` passa a conter `franchiseId` opcional para usuários da franquia e obrigatório quando `unit === 'franchise'`.

Registros de franquia passam a conter `franchiseId`, incluindo eventos, lançamentos financeiros, tarefas, histórico de tarefas, funcionários, prestadores, contratos, cardápios, insumos, utensílios, categorias e auditoria quando aplicável.

Índices e unicidades que dependem da franquia devem usar `franchiseId` como primeiro escopo. O servidor deve preencher esse campo a partir do usuário autenticado ou do escopo administrativo validado, nunca aceitar livremente o valor enviado no corpo.

## Autenticação e isolamento

- O token continua identificando o usuário e `unit`.
- Usuário de franquia recebe `franchiseId` no contexto autenticado e não pode trocar a franquia por `X-System`, query ou body.
- Administrador da matriz pode acessar uma franquia por escopo explícito, validado contra a existência e o status da franquia.
- `X-System` continua identificando apenas o portal, não a franquia.
- Toda rota de leitura e mutação deve aplicar `franchiseId` quando o contexto for `franchise`.
- Referência a registro de outra franquia deve retornar 404 ou erro de domínio, sem revelar sua existência.

## Rotas e portal

- O portal compartilhado passa a resolver a franquia por configuração de contexto.
- `/itu` permanece como compatibilidade para a primeira franquia.
- Novas franquias usam uma rota dinâmica baseada em `slug`, preferencialmente `/franquias/:slug` ou equivalente centralizado.
- O nome, cidade e identidade visual da franquia vêm do cadastro/configuração, não de strings fixas em componentes.
- O portal principal lista as franquias ativas e abre o contexto selecionado.

## Migração de dados

1. Criar o registro oficial da franquia Itu e seu `slug`.
2. Preencher `franchiseId` nos usuários, eventos, finanças e demais coleções legadas da franquia atual.
3. Criar índices antes de habilitar novas franquias.
4. Fazer a migração em comando explícito, com prévia, contagem e possibilidade de reexecução idempotente.
5. Validar que registros sem vínculo são identificados antes de liberar o cadastro de outra franquia.
6. Manter compatibilidade de leitura durante a transição e remover fallback somente após a reconciliação.

## Testes obrigatórios

- Usuário de Itu não lê, altera ou exclui dados de outra franquia.
- Administrador da matriz consegue alternar entre franquias permitidas.
- `X-System` não altera `franchiseId` de usuário comum.
- Eventos e lançamentos financeiros são criados com o vínculo autenticado.
- Consultas de dashboard, tarefas, estoque, contratos e auditoria respeitam o vínculo.
- Índices impedem duplicidade apenas dentro da mesma franquia.
- Migração é idempotente e não altera valores financeiros.
- `/itu` continua abrindo a franquia correta.

## Ordem de implementação

1. Contratos, modelo `Franchise`, `franchiseId` e contexto autenticado.
2. Migração idempotente de Itu e validação de registros órfãos.
3. Helpers de escopo e filtros dos módulos da API.
4. Permissões e seleção de franquia para a matriz.
5. Portal e rotas dinâmicas por `slug`.
6. Testes de isolamento, migração e builds dos três portais.

## Implementação entregue

- O contexto autenticado usa `franchiseId`; `X-System` continua identificando apenas o portal.
- Slugs são normalizados, únicos e resolvidos por `/api/franchises/slug/:slug`.
- O portal mantém `/itu` e também atende `/franquias/:slug`, com ativos servidos por `/franchise-assets`.
- Consultas e mutações de franquia aplicam filtros compostos e ignoram `franchiseId` enviado pelo body.
- A migração é manual e idempotente: `pnpm migrate:franchise-tenants -- --slug itu` faz prévia; acrescente `--apply` somente após validar os órfãos.

Na prévia local de 2026-10-25 foram encontrados 31 eventos, 101 lançamentos financeiros, 1 contrato, 203 auditorias e 1 usuário de franquia sem vínculo. Nenhum documento foi alterado.

