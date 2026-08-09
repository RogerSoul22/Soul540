# Financeiro por Caixa: desenho aprovado

## Objetivo

Tornar o financeiro confiável, auditável e compreensível. A visão padrão será Caixa: entradas e saídas entram no período de liquidação. A visão Competência continuará disponível para previsão, usando a data prevista do evento ou vencimento.

## Regra canônica

- Um lançamento possui uma única situação financeira calculada: `open`, `partial`, `settled` ou `cancelled`.
- `Recebido` e `Pago` não são estados persistidos. São rótulos derivados: receita liquidada é Recebida; despesa liquidada é Paga.
- A data atualmente persistida como `date` continua sendo a data de competência na primeira entrega, exposta com esse nome na API e interface. `dueDate` só existe quando há vencimento diferente.
- Cada baixa é um registro de liquidação com valor, data efetiva, método, responsável e justificativa. Caixa usa essas baixas; `settledAt` passa a ser apenas o atalho transitório para a última baixa de lançamentos integralmente liquidados.
- Valores financeiros são armazenados e somados em centavos inteiros. A API pode continuar exibindo `amount` decimal temporariamente, mas rejeita mais de duas casas e nunca usa ponto flutuante para decidir saldo, liquidação ou divergência.
- Cada baixa guarda `settledOn` no fuso `America/Sao_Paulo` para agrupamento mensal e `settledAt` em UTC apenas como carimbo de auditoria. A conversão UTC não pode deslocar uma baixa de mês.
- Cancelamentos preservam histórico e auditoria, mas não compõem totais, DRE ou exportações. Valores efetivamente devolvidos ou retidos exigem lançamento explícito de reembolso ou multa, nunca reaproveitamento da receita cancelada.
- A unidade de origem permanece no campo já existente `source`. A consolidação é calculada na consulta a partir da visão ativa: para Caixa usa a data de cada baixa; para Competência usa a data de competência. Assim, Campinas consolida em Sorocaba a partir de 2026-08-01 sem gravar uma única unidade de consolidação contraditória para as duas visões.

## Fluxos

### Eventos

- Criar/alterar um evento gera ou atualiza previsão de sinal, saldo e deslocamento, sempre aberta.
- O valor contratado é `finalValue` quando informado, ou `budget` enquanto não houver valor final. `depositValue` é o sinal previsto/contratado, não prova de recebimento; deve ser menor ou igual ao contratado, salvo exceção justificada.
- O saldo previsto é valor contratado menos sinal previsto. Se não houver valor contratado, um sinal isolado não cria automaticamente saldo adicional.
- Confirmar uma baixa adiciona uma liquidação com valor, data efetiva, método, responsável e justificativa. O estado é recalculado pela soma das baixas.
- Cancelar um evento cancela as previsões vinculadas. Se houver valor liquidado, a interface exige escolher e registrar reembolso, multa ou ajuste aprovado.
- Uma edição de preço, sinal ou equipe nunca regrava valor ou baixa já liquidada. Ela atualiza apenas previsão aberta ou cria ajuste auditável; comissão já liquidada segue a mesma proteção.
- O recebimento financeiro do evento é derivado dos lançamentos vinculados. O bloqueio operacional de fechamento permanece separado (`financialCloseStatus`): ele substitui o uso ambíguo atual de `financialStatus`, que mistura resumo de pagamento e trava de edição.

### Pedidos da fábrica

- `a_preparar` e `a_enviar` são previsão aberta.
- `entregue` apenas torna o pedido elegível para confirmação de recebimento; não liquida receita por si só.
- O modelo atual chama o único valor de `totalCost` e a interface o exibe como “Custo estimado”; como não existem preço, cliente, cobrança ou pagamento, o tratamento padrão é transferência interna de produção, não receita.
- Em transferência interna, entrega atualiza operação/estoque e não gera Caixa. Se as unidades precisarem de resultado próprio, usar preço de transferência explícito e espelhar contas a receber/pagar; a consolidação elimina os dois lados.
- Só um pedido marcado como venda externa, com cliente e valor comercial separados de `totalCost`, pode gerar previsão de receita e posterior baixa.
- Retorno de `entregue` para estado anterior cancela a previsão e exige explicação se o valor já estiver liquidado.

### Importação bancária (OFX)

- O OFX identifica o movimento real de caixa, mas não pode criar uma segunda receita/despesa quando já houver previsão de evento, pedido ou lançamento manual correspondente.
- Antes de gravar, o sistema procura correspondências por conta, sinal, valor, data e descrição e mostra a sugestão: vincular como baixa, criar movimento não classificado ou ignorar duplicata.
- A correspondência automática exige chave externa idempotente; correspondências ambíguas exigem confirmação humana. Um movimento importado nunca altera lançamento liquidado sem gerar trilha de auditoria.

## Integridade de gravação

- Comandos de liquidar, cancelar, reabrir e importar carregam chave de idempotência. Repetir a mesma requisição retorna o mesmo resultado sem duplicar baixa.
- A baixa usa atualização atômica e rejeita soma acima do valor previsto, salvo comando explícito de ajuste aprovado.
- Campos de proveniência (`origin`, `kind`, `automatic`, vínculo de evento/pedido e unidade) são definidos no servidor; o cliente não pode simulá-los ao criar ou atualizar lançamentos.
- Processos de sincronização e backfill não podem executar escrita durante leitura nem na inicialização do servidor. Eles são comandos de manutenção explícitos, com prévia, e nunca recriam previsão para evento cancelado ou lançamento cancelado.

## Decisões de negócio obrigatórias antes da migração

- Confirmar se há algum pedido excepcional de venda externa. A regra padrão é transferência interna/custo de produção, pois o código só possui `totalCost` (“Custo estimado”), filial e itens, sem preço, cliente ou cobrança. Venda externa exige campo e fluxo próprios.
- Para evento cancelado com dinheiro já recebido, aprovar por lançamento se houve reembolso, retenção de multa ou ajuste. O sistema não deve inferir esse fato.
- Confirmar se o DRE será gerado em Caixa, Competência ou nas duas versões identificadas. A tela pode ter Caixa como visão padrão sem misturar as duas no mesmo arquivo.

## Estado constatado após correções parciais

- As APIs protegidas agora exigem autenticação e o cabeçalho `X-System` não troca a unidade de usuários não administradores. Ainda não é suficiente para encerrar o risco: `events.ts` busca por ID nas três coleções, sua leitura geral mistura Matriz e Franquia, e `production-recipes.ts` ainda lê `X-System` diretamente.
- `passwordPlain` foi removido de schema, criação, edição, login e telas. A migração histórica `server/migrate-remove-plaintext.ts` existe, mas permanece pendente de backup, execução controlada e registro do resultado.
- Sinal de evento e venda externa de pedido passaram a nascer como previsão aberta; a leitura de pedidos não grava mais lançamentos; e o backfill deixou de executar ao iniciar o servidor. A confirmação de baixa continua genérica e não tem trilha de liquidações.
- Eventos cancelados passam a ter os lançamentos automáticos marcados como `cancelled`, e o DRE compartilhado os exclui. A lista financeira ainda filtra por `reversedAt`, mas o cancelamento atual nem sempre preenche esse campo; portanto a regra de visibilidade continua inconsistente.
- `status`, `settlementStatus` e `reversedAt` continuam simultaneamente ativos. A criação aceita campos de proveniência enviados pelo cliente e o `PUT` genérico converte `paid`/`received` em baixa, sem data local, método, responsável, idempotência ou proteção para liquidações parciais.
- A rota de estorno atualmente desativa o indicador `automatic` em memória antes de validá-lo, permitindo estornar um lançamento automático pelo fluxo manual. Esse é um bloqueio de integridade a corrigir antes de qualquer saneamento.
- A sincronização de evento ainda usa `Math.max(finalValue || budget, deposit)`, pode regravar previsão já liquidada e apaga duplicatas fisicamente. O fechamento financeiro do evento ainda pode marcar saldo como recebido sem comando de baixa específico.
- O pedido da Fábrica tem tratamento padrão de transferência interna e aceita venda externa com `commercialValue`, mas ainda não exige cliente, validação restrita de campos, vínculo navegável ou comando explícito de liquidação.
- OFX continua sendo parseado e importado no frontend da Matriz; cria lançamentos já liquidados e não concilia com previsões existentes.
- Valores continuam em `Number`, datas continuam usando `toISOString()` em telas e o DRE usa apenas `date`; ainda não existem centavos canônicos, `settledOn` local, consolidação Campinas → Sorocaba ou scripts de reconciliação versionados.

## Frontend

- O seletor Caixa/Competência informa a definição da visão e altera cartões, tabela, gráficos, DRE e exportações conjuntamente.
- Cada lançamento exibe origem, unidade de origem, unidade consolidada, competência, vencimento quando existir, liquidação, situação e trilha de auditoria.
- Ajuda contextual define Pendente, Parcial, Liquidado, Cancelado, Caixa e Competência.
- Ações de liquidar, reabrir e cancelar mostram a consequência financeira antes de confirmar.
- O painel de conciliação é somente leitura até o usuário aprovar uma prévia de ajustes.

## Proteções necessárias

- Exigir autenticação válida em todas as APIs protegidas.
- Remover senha em texto claro de armazenamento, respostas e telas.
- Impedir busca/alteração entre unidades por ID ou por cabeçalho controlado pelo cliente.
- Não realizar saneamento histórico até essas proteções estarem ativas.

## Achados incorporados

- Os campos `status`, `settlementStatus` e `reversedAt` hoje sobrepõem o ciclo financeiro.
- Cálculos de liquidação existem no servidor, no módulo compartilhado, nas telas e no DRE, com regras divergentes.
- `date` e `dueDate` são duplicados em eventos automáticos; `kind: balance` e `autoEventBudget` também.
- Existem schemas financeiros e telas de finanças duplicados, inclusive uma tela legada não carregada da Fábrica.

## Revisão 3 — estado implementado

- O estado financeiro canônico exibido é `Pendente`, `Parcial`, `Liquidado` ou `Cancelado`. Os valores legados `paid` e `received` são aceitos apenas para compatibilidade e não são oferecidos na criação de lançamentos da interface principal.
- Eventos cancelados preservam lançamentos. Previsões sem baixa recebem cancelamento auditável; qualquer lançamento já liquidado exige decisão explícita de reembolso, multa ou ajuste antes do cancelamento ou da alteração de valores do evento.
- A ajuda contextual das interfaces principal, Campinas e Fábrica descreve liquidação, Caixa, Competência e cancelamento; a interface principal também explica DRE, OFX e a consolidação Campinas → Sorocaba em agosto de 2026.
- A migração histórica permanece pendente de prévia revisada, backup externo e aprovação operacional por ID. Nenhum script de migração é executado automaticamente pelo servidor.
