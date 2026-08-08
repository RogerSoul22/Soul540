# Plano de implementação: reconciliação financeira e simplificação

> Execução segura: nenhuma etapa histórica escreve dados sem uma prévia somente leitura aprovada. Não apagar lançamentos financeiros; preservar trilha de auditoria.

## Resultado esperado

- Caixa usa cada baixa de liquidação, agrupada pela data local informada; Competência usa a data prevista persistida em `date` na primeira entrega.
- Um lançamento tem um estado financeiro canônico e um rótulo humano derivado do tipo.
- Eventos cancelados não inflam receita, DRE, totais ou exportações.
- Sinais e saldos entram no mês em que foram liquidados.
- Pedidos da fábrica só são recebidos quando entregues.
- Campinas consolida em Sorocaba a partir de 01/08/2026 conforme a data da visão selecionada, sem alterar a origem do dado.
- Todas as telas aplicam os mesmos filtros e as mesmas regras.

## Regras e aprovações para migração

1. **Pedido da Fábrica:** transferência interna/custo de produção é a regra padrão, pois o código só possui `totalCost` (“Custo estimado”), filial e itens, sem preço, cliente ou cobrança. Pedido excepcional de venda externa exige campo de preço e fluxo próprios. Nenhum lançamento de pedido usa `totalCost` como receita.
2. **Evento cancelado já liquidado:** aprovar por registro se houve reembolso, multa retida ou ajuste. O lançamento original será cancelado; o efeito de caixa só poderá permanecer em lançamento explícito.
3. **DRE:** exportar na visão escolhida na tela, identificada no arquivo; Caixa é o padrão aprovado. Competência permanece uma exportação separada quando selecionada, sem misturar regimes.

Somente a aprovação por registro de eventos cancelados já liquidados impede a aplicação definitiva desses registros. As demais regras já estão definidas no plano.

## Fase 0 — Bloquear riscos antes de alterar finanças

### 0.1 Exigir autenticação e restringir unidade

**Arquivos:** `server/middleware/auth.ts`, `server/app.ts`, `server/middleware/tenant.ts`, rotas que usam `findInAll`.

1. Tornar token ausente, inválido ou expirado uma resposta 401 nas rotas protegidas; manter somente login e health check públicos.
2. Derivar unidade do usuário autenticado; aceitar `X-System` somente para administradores autorizados e validar a permissão de escopo.
3. Substituir buscas globais por buscas no modelo da unidade autorizada. Para consultas consolidadas, criar uma lista explícita de unidades permitidas, apenas leitura.
4. Adicionar testes para token ausente, cabeçalho adulterado, leitura por ID de outra unidade e alteração por ID de outra unidade.

**Critério de aceite:** um usuário Campinas não consegue ler ou alterar Sorocaba/Fábrica, mesmo conhecendo o ID e enviando outro `X-System`.

### 0.2 Remover senha em texto claro

**Arquivos:** `server/routes/auth.ts`, `server/routes/users.ts`, `src/frontend/pages/Usuario/Usuario.tsx`, `franchise/src/pages/MinhaConta/MinhaConta.tsx`, `factory/src/pages/MinhaConta/MinhaConta.tsx`, `server/migrate-remove-plaintext.ts`.

1. Remover `passwordPlain` de schema, criação, atualização, login, respostas e telas.
2. Manter somente hash seguro e fluxo de redefinição de senha.
3. Executar a migração de remoção após backup e registrar quantidade afetada.

**Critério de aceite:** nenhuma resposta da API, documento Mongo ou tela contém senha recuperável.

## Fase 1 — Criar política financeira única

### 1.1 Normalizar o modelo de lançamento

**Arquivos:** `shared/types.ts`, `server/schemas/finances.ts`, `server/routes/finances.ts`.

1. Introduzir o contrato canônico:
   - `settlements[]`: baixas imutáveis com valor, data efetiva, método, responsável e justificativa.
   - `settlementStatus`: `open | partial | settled | cancelled`, calculado por valor total, soma das baixas e cancelamento.
   - `date`: campo persistido de compatibilidade, documentado e exposto como data de competência; não renomear fisicamente nesta primeira entrega.
   - `dueDate`: opcional, somente quando diferente de competência.
   - `settledAt`: campo de compatibilidade com a última baixa, até a migração completa de consumidores legados.
   - `source`: origem operacional imutável já existente; a interface o apresenta como Unidade de origem.
2. Deprecar `status` e `autoEventBudget`; a API mantém adaptação temporária de leitura para dados legados, mas não aceita novos valores redundantes.
3. Manter os metadados atuais de cancelamento (`reversedAt`, `reversedBy`, `reversalReason`) apenas como auditoria de transição; `settlementStatus` passa a ser a única regra de inclusão nos relatórios.
4. Expor o rótulo por função compartilhada: receita liquidada = Recebido; despesa liquidada = Pago; demais estados têm um rótulo neutro. Em pagamentos parciais, mostrar valor liquidado e valor em aberto.
5. Substituir `DELETE /api/finances/:id` por cancelamento auditável para lançamentos efetivos; exclusão física só pode existir para rascunhos que ainda não participam de relatórios.
6. Tornar `origin`, `kind`, `automatic`, `source`, vínculos e metadados de cancelamento campos definidos no servidor. O cliente envia intenção de negócio, não campos de proveniência.

**Critério de aceite:** não é possível persistir uma receita simultaneamente Pendente e Liquidada, nem uma despesa Cancelada e incluída como Paga.

### 1.2 Garantir precisão, data local e concorrência

**Arquivos:** criar `shared/money.ts` e `shared/financeDates.ts`; adaptar schemas, rotas, importadores e relatórios financeiros.

1. Adotar `amountCents` e `settlementCents` como valores canônicos para novos lançamentos e baixas. Converter `amount` legado de forma auditável e rejeitar valores com mais de duas casas decimais.
2. Criar `settledOn` (`YYYY-MM-DD` em `America/Sao_Paulo`) por baixa para filtros, consolidação Campinas/Sorocaba e relatórios mensais; manter `settledAt` UTC somente para auditoria.
3. Criar chave de idempotência por comando de baixa/importação e índice único de baixa; repetição de clique, retry de rede ou reprocessamento não pode duplicar caixa.
4. Aplicar atualização atômica/compare-and-set ao registrar baixa: somatório não pode exceder o valor previsto, salvo ajuste explícito, autorizado e auditado.
5. Centralizar arredondamento, comparação e exibição em helpers compartilhados; remover comparações como tolerância `0.005` e somas decimais diretas das regras financeiras.

**Critério de aceite:** duas baixas concorrentes não geram pagamento acima do valor; uma baixa feita à noite em São Paulo permanece no dia e mês informados; totais de centavos fecham exatamente.

### 1.3 Centralizar as regras de cálculo

**Arquivos:** criar `shared/financePolicy.ts`; adaptar `shared/financeSettlement.ts`, `shared/dreTemplate.ts`, `server/routes/finances.ts` e as três telas financeiras.

1. Criar funções puras para: participação de cada baixa no Caixa, participação do lançamento na Competência, participação no DRE, rótulos, cálculo de saldo, data efetiva por visão e exclusão de cancelados.
2. Remover regras locais como `status === 'paid'`, `status === 'received'` e exceção de sinal por categoria.
3. Fazer `/api/finances/summary` usar a mesma política e retornar metadados da visão, período e itens excluídos.
4. Atualizar DRE para nunca incluir cancelados e para receber a visão/período explicitamente.

**Testes:** cobrir receita/despesa aberta, uma ou mais baixas parciais em meses diferentes, liquidada, cancelada, sinal, saldo, custo de deslocamento, estorno e lançamento manual.

**Critério de aceite:** cartão, tabela, resumo da API e DRE retornam o mesmo total para o mesmo filtro.

### 1.4 Remover schemas e consultas duplicadas

**Arquivos:** `server/routes/finances.ts`, `server/routes/finance-categories.ts`, `server/routes/events.ts`, `server/routes/production-orders.ts`.

1. Extrair um construtor de schema financeiro e uma fábrica de modelos por unidade; manter coleções separadas apenas enquanto a migração de tenancy exigir.
2. Extrair repositório financeiro com `list`, `findAuthorized`, `create`, `update` e `cancel` para impedir que cada rota implemente sua própria busca multiunidade.
3. Remover `findFinanceInBothCollections` de rotas de escrita; a unidade autorizada define o único modelo possível.
4. Remover o fallback `autoEventBudget` após a migração confirmar todos os lançamentos com `kind`.

**Critério de aceite:** uma mudança de campo financeiro é definida uma vez e vale para as três unidades.

## Fase 2 — Corrigir os fluxos de origem

### 2.1 Eventos, sinal, saldo e cancelamento

**Arquivos:** `server/routes/events.ts`, `shared/eventOperations.ts`, `src/frontend/pages/Eventos/Eventos.tsx`, `franchise/src/pages/Eventos/Eventos.tsx`, componentes de calendário.

1. Gerar sinal e saldo como previsões abertas, usando `date` como competência na primeira entrega e vencimento somente se informado.
   - Definir valor contratado como `finalValue` quando preenchido, ou `budget` enquanto não houver valor final.
   - Tratar `depositValue` como sinal previsto, nunca como prova de recebimento; validar sinal maior que valor contratado como exceção explicitamente aprovada.
   - Não criar saldo quando o valor contratado estiver ausente; não usar `Math.max` para transformar sinal em faturamento total.
2. Criar comandos específicos: liquidar sinal, liquidar saldo, registrar pagamento de custo, reabrir e cancelar. Não usar atualização genérica de status.
3. Ao liquidar, exigir valor, data efetiva, método e usuário; adicionar uma baixa e recalcular o estado. Atualizar `settledAt` somente como compatibilidade temporária.
4. Ao cancelar, cancelar previsões abertas. Para valor já liquidado, exigir escolha de reembolso, multa retida ou ajuste aprovado e criar o lançamento correspondente.
5. Derivar o resumo financeiro do evento dos lançamentos vinculados. Migrar `financialStatus: closed` para `financialCloseStatus: closed`; calcular os antigos valores `open`, `partial` e `settled` em vez de mantê-los como segunda fonte de verdade.
6. Substituir deleções de duplicatas e de lançamentos automáticos por cancelamento auditável, salvo limpeza de linhas tecnicamente idênticas ainda não expostas.
7. Ao mudar valor contratado, sinal, equipe ou comissão, atualizar somente previsões abertas. Lançamentos com baixa exigem ajuste separado; nunca sobrescrever valor, data ou baixa já realizada.
8. Remover `backfillEventFinances` da inicialização em `server/index.ts`. Recriar a função como comando administrativo explícito com modo prévia/aplicação, idempotência e exclusão obrigatória de eventos cancelados; nenhuma rota `GET` pode sincronizar ou escrever.

**Critério de aceite:** um sinal recebido em julho para evento de junho aparece em Caixa de julho e Competência de junho; evento cancelado não aparece como receita ativa; reiniciar o servidor não cria, reabre ou altera lançamento financeiro.

### 2.2 Pedidos da fábrica

**Arquivos:** `server/routes/production-orders.ts`, `factory/src/pages/Tarefas/Tarefas/Tarefas.tsx`, tela financeira da Fábrica.

1. Remover a escrita disparada por `GET /api/production-orders`; uma leitura nunca deve criar, liquidar ou cancelar lançamento.
2. Mapear `a_preparar` e `a_enviar` para previsão aberta; `entregue` apenas autoriza a ação explícita de confirmar recebimento.
3. Tratar `totalCost` como custo técnico estimado, nunca como receita. Na regra padrão de transferência interna, entrega atualiza produção/estoque e não cria movimento de Caixa.
4. Se houver necessidade de resultado por unidade, criar preço de transferência explícito, contas espelhadas a receber/pagar e eliminação obrigatória no consolidado. Só pedido marcado como venda externa, com cliente e valor comercial, pode gerar previsão de receita.
5. Exigir ação de confirmação de recebimento, data efetiva, método e responsável somente para venda externa ou transferência com liquidação financeira; não liquidar na criação, edição ou entrega do pedido.
6. Se pedido entregue retornar a pendente, cancelar previsão aberta ou exigir ajuste explícito para valor já liquidado.
7. Registrar vínculo navegável entre pedido e lançamento financeiro quando houver lançamento.

**Critério de aceite:** nenhum pedido não entregue possui receita liquidada; pedido interno entregue não gera Caixa; um pedido entregue não é liquidado automaticamente; `totalCost` nunca aparece como receita; transferência entre unidades é eliminada no consolidado.

### 2.3 Consolidação Campinas → Sorocaba

**Arquivos:** criar `shared/reportingUnitPolicy.ts`; adaptar `server/middleware/tenant.ts`, `server/routes/finances.ts`, páginas financeiras e relatórios.

1. Definir regra versionada: lançamento com origem Campinas consolida em Sorocaba quando a data usada pela visão selecionada for a partir de 2026-08-01 (data de cada baixa no Caixa, `date`/data de competência na Competência).
2. Preservar `source = franchise` como unidade de origem e calcular a unidade de relatório em consulta; não gravar um único `reportingUnit`, pois um evento de julho pago em agosto pertence a unidades de relatório distintas nas duas visões.
3. Permitir filtros: somente Sorocaba, somente Campinas, consolidado Sorocaba e Fábrica.
4. Mostrar a regra e a unidade de origem/consolidação em tabela, detalhes, exportações e DRE.

**Critério de aceite:** um lançamento Campinas pós-corte aparece na consolidação Sorocaba da visão correspondente, mas continua rastreável e administrável na unidade de origem por usuários autorizados.

### 2.4 Conciliar importação OFX sem duplicar caixa

**Arquivos:** mover parser/fluxo OFX de `src/frontend/pages/Financeiro/Financeiro.tsx` para serviço compartilhado/API; adaptar a tela financeira e `server/routes/finances.ts`.

1. Mover a importação para o servidor e conservar `externalId` como chave idempotente do movimento bancário.
2. Antes de criar lançamento, buscar previsões abertas compatíveis por unidade, conta, sinal, valor, data e descrição. Produzir sugestão de vínculo, nunca baixa silenciosa quando houver ambiguidade.
3. Para correspondência aprovada, anexar o movimento como baixa ao lançamento previsto; para ausência de correspondência, criar movimento de caixa `não classificado` que não entra no DRE até categorização.
4. Impedir que importação OFX crie nova receita/despesa quando já existe baixa manual ou automática para o mesmo movimento; registrar decisão de ignorar, vincular ou criar ajuste.
5. Exibir em tela a conta, saldo do extrato, situação de conciliação, lançamento vinculado e origem da decisão.

**Critério de aceite:** reimportar o mesmo OFX não altera totais; um sinal previsto conciliado pelo extrato passa a ter uma única baixa e não uma segunda receita.

## Fase 3 — Padronizar frontend e eliminar telas duplicadas

### 3.1 Criar experiência financeira comum

**Arquivos:** criar componentes compartilhados em `shared`/pacote comum; adaptar `src/frontend/pages/Financeiro/Financeiro.tsx`, `franchise/src/pages/Financeiro/Financeiro.tsx`, `factory/src/pages/Financeiro/Financeiro/Financeiro.tsx`.

1. Criar seletor único Caixa/Competência e filtro único de mês, ano ou intervalo, unidade, tipo, situação e origem.
2. Aplicar o filtro antes de cartões, gráficos, tabelas, DRE e exportação; exibir período e visão ativos em todos os resultados.
3. Incluir painel “Como este valor é calculado”, tooltips e glossário:
   - Caixa: movimentação na data local de cada baixa.
   - Competência: previsão/data do evento ou vencimento.
   - Pendente, Parcial, Liquidado e Cancelado.
   - Recebido/Pago como rótulos, não como estados distintos.
4. Exibir competência, vencimento, cada baixa de liquidação, valor em aberto, origem, consolidação e vínculo do lançamento nas linhas e no detalhe.
5. Criar modais de liquidar/reabrir/cancelar com impacto financeiro, valor, data local efetiva, método, justificativa e chave idempotente; não oferecer seletor genérico de `status`.
6. Centralizar parser de NF-e, recorrência, categorias e cálculos de totais, evitando cópias por app.

**Critério de aceite:** qualquer tela financeira explica a regra aplicada e apresenta os mesmos totais para a mesma visão/período.

### 3.2 Remover código sem uso e clientes de API concorrentes

**Arquivos:** `factory/src/App.tsx`, `factory/src/pages/Financeiro/Financeiro.tsx`, `factory/src/pages/Financeiro/Financeiro.module.scss`, `src/frontend/contexts/AppContext.tsx`, `franchise/src/lib/api.ts`, `factory/src/lib/api.ts`.

1. Confirmar por build e rota que a versão aninhada é a única tela ativa da Fábrica.
2. Remover a tela e stylesheet legado não utilizados após a migração dos recursos exclusivos, se houver.
3. Criar um cliente de API por app que injeta autenticação e unidade permitida; substituir `fetch` com `X-System` repetido.
4. Separar tipos de produção de `src/backend/infra/data/mockData` usado apenas como legado, movendo-os para `shared/types.ts`.

**Critério de aceite:** não existem dois componentes financeiros ativos da Fábrica nem cabeçalhos de unidade escritos manualmente em páginas.

### 3.3 Tornar DRE configurável

**Arquivos:** `shared/dreTemplate.ts`, `src/frontend/pages/Financeiro/Financeiro.tsx`, template oficial de DRE.

1. Substituir mapa fixo julho–dezembro/2026 por metadados do template ou configuração anual explícita.
2. Incluir junho na cobertura necessária e validar os meses disponíveis antes de exportar.
3. Enviar ao DRE somente entradas permitidas pela política da visão escolhida.
4. Exibir no arquivo a visão, período e unidades incluídas.

**Critério de aceite:** DRE de junho funciona e não inclui evento ou lançamento cancelado.

## Fase 4 — Reconciliação histórica controlada

### 4.1 Gerar prévia somente leitura

**Arquivos:** criar `server/scripts/reconcile-finances.ts` e testes correspondentes.

1. Receber período, unidades e visão; executar apenas consultas.
2. Classificar por ID e ação sugerida: cancelar receita/custo ligado a evento cancelado, migrar `settledAt` válido para uma baixa integral com `settledOn` em São Paulo, validar datas ausentes/inválidas, abrir previsão liquidada incorretamente, preencher vínculo/origem e remover marcador legado. Diferença entre competência e liquidação não é erro por si só e nunca deve sobrescrever a data efetiva.
3. Produzir CSV/JSON com valor anterior, valor proposto, motivo, evento/pedido relacionado e impacto em Caixa/Competência.
4. Separar itens ambíguos para decisão humana: cancelados com valor já recebido, reembolsos, multas, pagamentos parciais e datas ausentes.

**Base já identificada para junho/julho de 2026:** R$ 17.788,40 de receitas e R$ 320,00 de custos vinculados a eventos cancelados ainda ativos; R$ 14.695,90 de receitas e R$ 550,00 de custos com competência diferente da liquidação. Esses valores devem ser reavaliados por lançamento, não corrigidos em lote sem aprovação.

**Observação sobre pedidos:** a leitura de junho/julho não encontrou pedido pendente com receita liquidada. A correção continua necessária porque o código liquida automaticamente todo pedido `entregue` e ainda usa `totalCost` como valor de receita.

**Critério de aceite:** a prévia pode ser reproduzida, não escreve no MongoDB e fecha com os totais dos relatórios de origem.

### 4.2 Aprovar e executar migração idempotente

**Arquivos:** criar `server/scripts/apply-finance-reconciliation.ts`, tabela/coleção de auditoria de migração.

1. Exigir arquivo de aprovação contendo IDs, ação, responsável e data.
2. Reconsultar cada lançamento antes de alterar e abortar itens que tenham mudado desde a prévia.
3. Registrar `migrationRunId`, estado anterior e estado novo. Reexecução deve ignorar itens já aplicados.
4. Executar em lotes pequenos, emitir relatório de sucesso/falha e permitir reversão por `migrationRunId`.
5. Rodar a reconciliação novamente em modo leitura e comparar os totais previstos com os realizados.

**Critério de aceite:** nenhum ajuste histórico é silencioso, duplicado ou irreversível; todo ID alterado é auditável.

## Fase 5 — Testes, validação e liberação

### 5.1 Cobertura automatizada

**Arquivos:** ampliar `server/routes/__tests__/dreTemplate.test.ts`; criar testes para política, eventos, pedidos, API financeira, tenancy e scripts.

1. Testes unitários da política financeira e dos rótulos derivados.
2. Testes de integração dos comandos de liquidar, reabrir e cancelar.
3. Testes de regressão: sinal em mês diferente, duas baixas parciais em meses diferentes, baixa em virada UTC/São Paulo, concorrência/retry de baixa, evento cancelado, pedido pendente, pedido entregue sem confirmação de recebimento, custo técnico diferente do preço do pedido, OFX duplicado ou conciliado, Campinas pós-corte e DRE de junho.
4. Testes de autorização para todas as operações de escrita e leitura consolidada.
5. Testes de UI para filtros, mensagens explicativas e prévia de conciliação.

### 5.2 Roteiro de homologação financeira

1. Selecionar amostra de eventos e pedidos de junho/julho.
2. Comparar Caixa do sistema com extratos/planilha aprovada por Rogério.
3. Comparar Competência com agenda de eventos e pedidos previstos.
4. Validar consolidação Campinas/Sorocaba de agosto em diante nas duas visões, incluindo evento de julho liquidado em agosto.
5. Validar com Rogério/Lucas a regra comercial dos pedidos da Fábrica antes de migrar qualquer lançamento de pedido.
6. Aprovar separadamente DRE de Caixa e/ou Competência com Lucas Martins e Rogério antes da liberação geral.

**Critério de liberação:** zero item cancelado nos totais, zero pedido pendente recebido, filtros consistentes e reconciliação pós-migração sem divergência não justificada.

### 5.3 Validar custos de massa e pizzas congeladas

**Responsáveis:** Rogério fornece a planilha e premissas; Lucas Martins revisa e aprova a metodologia.

1. Validar ficha técnica por produto: ingredientes, unidade de medida, rendimento, perda, embalagem, energia/mão de obra quando aplicável e data de vigência do custo.
2. Comparar o custo calculado da planilha com notas/estoque e apontar variações por ingrediente e por tamanho de pizza.
3. Definir se o sistema apenas referencia a planilha aprovada ou se passará a armazenar ficha técnica e custo versionado. Não integrar planilha sem versão, responsável e data de vigência.
4. Se houver integração, custos novos valem somente para produção futura; histórico financeiro e pedidos já fechados mantêm a versão de custo que lhes foi aplicada.

### 5.4 Rotina operacional de despesas

1. Exigir categoria, valor em centavos, competência, vencimento quando houver e origem para cada despesa; pagamento adiciona baixa com comprovante/referência e data local.
2. Rogério confere semanalmente pendências, baixas sem categoria e movimentos OFX não classificados; o painel de conciliação registra o responsável e a decisão.
3. Fechamento mensal compara Caixa com extrato e Competência com agenda/pedidos antes de publicar DRE ou exportação.

## Revisão 2 — código confrontado em 02/08/2026

Esta revisão substitui qualquer interpretação de que a Fase 0 ou os fluxos financeiros já estejam concluídos. Foram aplicadas proteções parciais, mas ainda existem caminhos que podem alterar caixa ou dados de outra unidade.

### Entregue parcialmente e preservado

1. Token ausente ou inválido é rejeitado nas rotas protegidas; `health` e autenticação permanecem públicos.
2. Usuário não administrador fica limitado à própria unidade no middleware principal.
3. Senha em texto claro foi retirada de schema, respostas e telas; a limpeza dos documentos existentes ainda exige execução controlada.
4. Sinal de evento e receita de venda externa de pedido não são mais liquidados na criação; `GET /api/production-orders` não escreve; o backfill não inicia com o servidor.
5. O DRE compartilhado ignora `settlementStatus: cancelled`, e há testes iniciais para autenticação, tenancy, sinal, pedido e cancelamento.

### Bloqueios que reabrem a Fase 0

1. **Isolamento de eventos:** substituir `findEventInAllCollections` por busca na coleção da unidade autorizada. A leitura de eventos também não pode devolver Matriz e Franquia a um usuário sem escopo administrativo explícito.
2. **Isolamento de receitas de produção:** trocar o uso direto de `X-System` em `server/routes/production-recipes.ts` por `getTenantUnit(req)` e restringir o escopo aceito.
3. **Estorno protegido:** remover a mutação de `automatic` na rota `POST /api/finances/:id/reverse`; lançamento automático só pode ser alterado por seu evento ou pedido de origem.
4. **Cancelamento consistente:** até a migração para estado canônico, cada cancelamento deve registrar metadados de auditoria e a listagem não pode tratar `reversedAt` e `settlementStatus` de maneira divergente.
5. **Autorização por rota:** acrescentar testes de leitura e escrita de evento, receita de produção e lançamento financeiro usando IDs de outra unidade.

**Novo critério de saída da Fase 0:** nenhuma rota protegida deriva unidade de um cabeçalho controlado pelo cliente; qualquer ID de outra unidade retorna 404/403; não existe comando manual capaz de estornar, reabrir ou alterar lançamento automático.

### Ajustes obrigatórios nas fases seguintes

1. **Fase 1:** o contrato de baixas deve anteceder qualquer mudança de interface. Enquanto `status` existir por compatibilidade, ele será somente derivado na resposta; criação e atualização não aceitarão `status`, `settlementStatus`, `settledAt`, `origin`, `kind`, `automatic`, `source` ou metadados de estorno enviados pelo cliente.
2. **Fase 1:** a rota `DELETE /api/finances/:id` deve virar cancelamento auditável antes da liberação; exclusão física só vale para rascunho isolado, definido no servidor e sem referência em relatório.
3. **Fase 2 de eventos:** substituir o atalho `financial-close` por comandos de baixa, reabertura e cancelamento; corrigir o cálculo do contratado para `finalValue` quando preenchido, senão `budget`, sem elevar o contrato pelo sinal; nunca atualizar ou apagar previsão que já possua baixa.
4. **Fase 2 de pedidos:** manter transferência interna como padrão e validar venda externa com cliente, `commercialValue` separado, entrega e vínculo ao lançamento. Entrega apenas libera a baixa; não a executa.
5. **Fase 2 de OFX:** o parser, a deduplicação e a sugestão de vínculo devem migrar ao servidor antes de o frontend poder gravar qualquer movimento de extrato.
6. **Fase 3:** as três telas financeiras e a tela legada inativa da Fábrica ainda usam seletores de `status`, `toISOString()` e cálculos próprios. A tela compartilhada/política única deve substituir esses fluxos antes da remoção do legado.
7. **Fase 4:** não há script versionado de prévia somente leitura. A reconciliação manual de junho/julho serve como linha de base, mas a próxima execução deve ser reproduzível por script e jamais gravar sem arquivo de aprovação.

### Ordem de execução revisada

1. Fechar os cinco bloqueios da Fase 0 e validar isolamento por testes de rota.
2. Implementar contrato de centavos, baixas, data local, estado derivado e política financeira antes de alterar telas ou dados históricos.
3. Migrar eventos, pedidos e OFX para comandos de negócio que usam essa política.
4. Aplicar consolidação Campinas → Sorocaba e então substituir as três experiências de frontend, DRE e exportações.
5. Criar prévia de reconciliação, obter aprovação por ID e só então aplicar migração idempotente.
6. Executar testes, homologação financeira e validação da planilha de custos antes da liberação.

## Ordem de execução

Seguir a ordem de execução revisada acima. A ordem original permanece como divisão de fases, mas não autoriza iniciar migração histórica ou trabalho de interface antes de encerrar os bloqueios de segurança e integridade.
