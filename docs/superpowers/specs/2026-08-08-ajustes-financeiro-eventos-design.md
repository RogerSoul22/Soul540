# Ajustes financeiro/eventos (agosto 2026): desenho aprovado

Complementa `docs/superpowers/specs/2026-08-02-financeiro-caixa-design.md` e o plano
`docs/superpowers/plans/2026-08-02-reconciliacao-financeira.md`. Cobre 5 pedidos
pontuais do usuário, mantendo a regra canônica já estabelecida (situação calculada
por baixas, nunca deletar lançamento com dinheiro já movimentado, proveniência
definida no servidor).

## 1. Alterar status de um lançamento pela edição

**Causa raiz**: `PUT /finances/:id` bloqueia qualquer alteração de `status`
(retorna 400) desde a correção emergencial citada na seção "Estado constatado"
do doc de 2026-08-02 ("o PUT genérico converte paid/received em baixa, sem data
local, método, responsável, idempotência ou proteção para liquidações parciais").
O bloqueio parou o bug de integridade, mas não implementou o caminho correto —
por isso os três formulários de edição (Matriz, Franquia, Fábrica) mostram um
campo "Status" que hoje é descartado no `editableBase` antes do `PUT`.

**Regra nova**: `PUT /finances/:id` volta a aceitar `status`, mas só grava
através do mesmo mecanismo de baixa/reabertura já usado pelo restante do
sistema (`buildSettlementRecord`, atualização atômica de `/settlements`),
nunca escrevendo o campo cru:

- `pending → paid`/`received`: gera uma baixa cobrindo o valor em aberto
  (`amountCents - settledCents`), com `settledOn` = `settledOn` informado no
  corpo ou a `date` do lançamento, `paymentMethod` informado ou o já existente,
  `settledBy` = usuário autenticado, `idempotencyKey` gerada no servidor
  (`randomUUID()`). Rejeita se `settlementStatus` já for `cancelled`.
- `paid`/`received → pending`: reabre o lançamento — zera `settlements`,
  `settledCents`, `settledAt`, volta `settlementStatus` para `open`. Esse
  comando de reabertura não existia; passa a existir como parte desta mudança.
- Vale também para lançamentos `automatic: true` (ex.: pedidos da Fábrica),
  que hoje ficam bloqueados pela proteção geral de campos automáticos — a
  proteção de campos automáticos continua valendo para os outros campos
  protegidos (`amount`, `type`, `category`, `eventId`, `kind`, `origin`).
- Auditoria: descrição específica "Alterou status de X para Y", igual ao
  comportamento hoje existente para o caminho de liquidação manual.

**Frontend**: os três formulários de edição (`src/frontend`, `franchise/src`,
`factory/src/pages/Financeiro/Financeiro/Financeiro.tsx` — o ativo, não o
duplicado órfão) passam a enviar `status` normalmente, sem descartá-lo.

## 2. Data do sinal

Novo campo `depositDate?: string` (YYYY-MM-DD) em `PizzaEvent`. Quando
preenchido, `upsertAutomaticEventFinance(..., 'deposit', ...)` usa
`event.depositDate` como `date` do lançamento automático de sinal em vez de
`event.date`. Sem o campo preenchido, comportamento atual é preservado
(usa `event.date`). Formulário de evento ganha um input de data opcional
"Data do sinal" ao lado do valor do sinal.

## 3. Evento cancelado: excluir o lançamento financeiro

Exclusão física, mas restrita a lançamentos que nunca tiveram baixa real
(`settledCents === 0`, sem `settlements`). Isso preserva a trava que já existe
em `cancellationRequiresDecision`/`eventCancellationRequiresDecision`: se o
lançamento automático (sinal, saldo, deslocamento) já teve dinheiro
efetivamente recebido, o cancelamento do evento continua exigindo decisão
explícita (reembolso, multa retida, ajuste) e o lançamento correspondente
continua apenas marcado como `cancelled`, nunca apagado — apagar dinheiro que
já entrou no caixa destrói prova contábil/fiscal real, não é equivalente a
apagar uma previsão que nunca se concretizou.

`syncEventFinances` (server/routes/events.ts) passa a, no branch
`event.status === 'cancelled'`: para cada lançamento automático vinculado com
`settledCents === 0`, `deleteOne` em vez de `$set settlementStatus: 'cancelled'`;
para os com `settledCents > 0`, mantém o comportamento atual (marca
`cancelled`). Registra no audit log a exclusão (`action: 'delete'`).

## 4. Filtros da Fábrica: mês e ano separados + status

`factory/src/pages/Financeiro/Financeiro/Financeiro.tsx` (único arquivo ativo
— `factory/src/pages/Financeiro/Financeiro.tsx`, o duplicado sem a pasta
aninhada, não é importado em lugar nenhum e será removido nesta mesma
iteração, conforme já sinalizado no plano de reconciliação):

- Troca o filtro único "Período" (string `YYYY-MM` ou `all`) por dois
  seletores: **Mês** (Jan–Dez ou "Todos") e **Ano** (anos com lançamento, ou
  "Todos"), combinados via AND na filtragem local — mesmo padrão para o
  `pageMonth`/filtro rápido do topo e para o filtro da lista principal.
- Confirmado por inspeção de código: o schema (`FactoryFinanceSchema`) já usa
  `default: 'pending'`, o formulário de novo lançamento já inicia
  `formStatus = 'pending'`, e a receita automática de pedido externo
  (`syncFinanceForProductionOrder`) já nasce `status: 'pending'`. Não foi
  encontrado nenhum caminho de código que force `'received'`. Nenhuma
  mudança de default é necessária; a correção do item 1 (status editável)
  resolve a percepção de "status fixo", já que hoje a edição parecia não ter
  efeito nenhum.

## 5. Status "orçamento" nos eventos

Adiciona `'orcamento'` a `EventStatus` em `shared/types.ts`:

```ts
export type EventStatus = 'orcamento' | 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
```

Sem mudança de comportamento financeiro: eventos em `orcamento` continuam
gerando os lançamentos automáticos de sinal/saldo/deslocamento normalmente
(mesmo tratamento de previsão aberta que já existe para `planning`), conforme
decisão do usuário ("o orçamento tem que entrar como receita prevista"). A
mudança é só de rótulo/seleção nas telas de evento (badge, filtro de status,
select do formulário) nas três frentes (Matriz, Franquia — Fábrica não edita
status de evento).

## Fora de escopo

- Não mexe na trava de decisão de cancelamento já existente
  (`cancellationRequiresDecision`) além de ajustar o destino final
  (deletar vs. marcar cancelado) conforme item 3.
- Não implementa os itens ainda pendentes do plano de reconciliação
  (isolamento de tenant em `events.ts`/`production-recipes.ts`, bug de
  estorno de lançamento automático) — seguem como débito daquele plano,
  não fazem parte deste pacote de mudanças.
