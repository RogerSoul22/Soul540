# Mapa de regras de negócio — Soul540

**Status:** rascunho para aprovação
**Data:** 2026-10-10
**Escopo:** produto inteiro: matriz, franquia, fábrica, API, financeiro, operação, fiscal e integrações internas.

## 1. Objetivo

Este documento consolida as regras de negócio identificadas no código, nas telas e nas decisões já registradas no projeto. Ele também evidencia conflitos entre o comportamento atual e as regras desejadas, além das decisões que ainda precisam ser tomadas antes da implementação definitiva.

Este é um mapa de negócio, não uma alteração de código. A implementação deve começar somente depois da aprovação das regras prioritárias e da definição dos pontos marcados como pendentes.

## 2. Como interpretar o mapa

- **Confirmada:** implementada no servidor ou explicitamente definida em uma decisão de produto.
- **Atual:** comportamento observado no código, mesmo quando ainda não há decisão formal.
- **Conflitante:** o código atual e uma decisão/documento aprovado apontam para comportamentos diferentes.
- **Pendente:** depende de decisão do negócio.
- **Inferida:** recomendação técnica ou operacional, ainda não aprovada.

### Hierarquia da fonte de verdade

1. Regra de segurança e isolamento implementada no servidor.
2. Decisão de negócio aprovada e registrada em `docs/plans` ou `docs/superpowers/specs`.
3. Contratos compartilhados e validações de domínio.
4. Comportamento das telas.
5. Inferências feitas a partir de nomes, defaults ou fluxos incompletos.

Quando houver conflito, a regra não deve ser considerada fechada: ela entra na lista de decisões pendentes.

## 3. Visão geral do produto

O Soul540 possui três contextos operacionais:

| Contexto               | Responsabilidade                                                | Dados padrão visíveis                             |
| ---------------------- | --------------------------------------------------------------- | ------------------------------------------------- |
| Matriz (`main`)        | gestão central, eventos, financeiro consolidado e administração | todos os contextos, conforme permissão            |
| Franquia (`franchise`) | operação de uma unidade/franquia                                | somente a própria unidade e administradores       |
| Fábrica (`factory`)    | produção e expedição                                            | produção própria e dados operacionais autorizados |

A API é compartilhada entre os contextos. A unidade deve ser determinada no servidor e nunca confiada apenas ao cliente.

## 4. Regras globais

### 4.1 Identidade, autenticação e unidade

| Regra                                                                                                 | Status              | Evidência / observação                                                                                             |
| ----------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Usuário precisa estar autenticado para acessar a área protegida da API.                               | Confirmada          | `apps/api/src/infrastructure/middleware/auth.ts` e composição em `apps/api/src/app.ts`.                            |
| Token pode vir de cookie HTTP-only ou cabeçalho Bearer.                                               | Confirmada          | Middleware de autenticação.                                                                                        |
| Login usa e-mail normalizado em minúsculas e senha com hash bcrypt.                                   | Confirmada          | `auth.routes.ts`.                                                                                                  |
| Usuário não administrador só pode entrar no sistema correspondente à sua unidade.                     | Confirmada          | Validação de `unit` contra `X-System`.                                                                             |
| Administrador pode acessar mais de um contexto.                                                       | Confirmada          | Regra de autenticação e tenant.                                                                                    |
| Usuário comum fica restrito à própria unidade; o cliente não pode trocar essa unidade com `X-System`. | Confirmada          | `tenant.ts`.                                                                                                       |
| Matriz pode consultar dados de outras unidades quando o escopo solicitado for permitido.              | Confirmada          | Filtros de tenant e escopo administrativo.                                                                         |
| Toda consulta e mutação deve aplicar filtro de unidade no servidor.                                   | Confirmada / lacuna | Implementada nos módulos principais, mas deve ser auditada nos módulos auxiliares e no chat.                       |
| A unidade enviada pelo cliente não pode substituir a unidade calculada pelo servidor.                 | Confirmada / lacuna | Há risco no cadastro de usuários, que aceita `body.unit` sem restringir explicitamente o administrador não matriz. |
| Dados sem unidade pertencem à matriz somente quando essa for a regra explícita do modelo.             | Inferida            | Deve ser evitado como fallback silencioso em novas entidades.                                                      |

### 4.2 Dinheiro, datas e idempotência

| Regra                                                                                                                 | Status     |
| --------------------------------------------------------------------------------------------------------------------- | ---------- |
| Valores monetários são representados em centavos no domínio e aceitam no máximo duas casas decimais na entrada.       | Confirmada |
| Datas de negócio são strings `YYYY-MM-DD`, sem conversão acidental de fuso.                                           | Confirmada |
| A referência de data operacional deve considerar o fuso de São Paulo.                                                 | Confirmada |
| Liquidações repetidas com a mesma chave de idempotência não podem duplicar o pagamento.                               | Confirmada |
| Origem, tipo, unidade, vínculo automático e reversão financeira são controlados pelo servidor.                        | Confirmada |
| Comandos financeiros devem ser preferidos a alterações genéricas de campos derivados.                                 | Confirmada |
| Migrações e backfills devem ser comandos explícitos de manutenção, nunca executados automaticamente na inicialização. | Confirmada |

### 4.3 Auditoria

| Regra                                                                                                                          | Status                                                       |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Criações, alterações e exclusões relevantes devem gerar registro de auditoria.                                                 | Confirmada nos módulos que já chamam o serviço de auditoria. |
| O registro deve indicar ação, entidade, usuário e unidade efetiva.                                                             | Confirmada                                                   |
| Reversão financeira deve ser auditável e não deve apagar o histórico da transação.                                             | Confirmada no domínio / conflitante em alguns fluxos atuais. |
| Toda ação administrativa sensível deve registrar o motivo quando houver reversão, cancelamento, reabertura ou exclusão lógica. | Inferida; recomendada                                        |

## 5. Usuários, permissões e papéis

### Regras identificadas

1. Usuários possuem nome, e-mail, senha, unidade, flag de administrador e permissões de páginas.
2. Rotas de usuários exigem administrador.
3. A tela de permissões deve listar páginas agrupadas por área e permitir configurar o acesso individual.
4. A navegação deve ocultar páginas não autorizadas.
5. A própria rota deve impedir acesso direto a uma página sem permissão; esconder o item do menu não é suficiente.
6. Administrador deve acessar a administração de permissões.
7. Usuários de franquia e fábrica não devem excluir usuários pela própria unidade.

### Estado atual e lacunas

- A restrição administrativa do cadastro de usuários está implementada.
- A filtragem visual por página está prevista no documento de permissões.
- A autorização de ação e a proteção de todas as rotas no backend ainda não estão uniformes.
- O modelo atual é orientado a páginas; ainda não está definido se haverá permissões de ação, como `financeiro.liquidar`, `eventos.cancelar` ou `fiscal.emitir`.

**Decisão pendente:** adotar somente permissão por página ou combinar página + ações sensíveis. A recomendação é manter página para navegação e adicionar ações para operações irreversíveis.

## 6. Eventos e operação comercial

### 6.1 Cadastro

Um evento pode conter, entre outros dados:

- nome, data, data final, horário, duração e local;
- cidade, deslocamento e indicação de evento fora da cidade;
- cliente/contratante, telefone e quantidade de convidados;
- orçamento, valor final, sinal, data do sinal e chave Pix;
- cardápio, observações, funcionário responsável e equipe selecionada;
- equipe, funções, extras, custos de viagem e imagens do local;
- previsão e realização de pizzas;
- dados operacionais da fábrica: massa, molho, queijo, embalagens e status de produção;
- status financeiro e status de fechamento financeiro.

### 6.2 Estados

O código utiliza estados como `planning`, `confirmed`, `completed` e `cancelled`, mas as transições não estão centralizadas em uma máquina de estados.

| Transição / regra                                                         | Status                    |
| ------------------------------------------------------------------------- | ------------------------- |
| Novo evento começa em planejamento.                                       | Confirmada                |
| Evento confirmado pode ser usado como referência para produção vinculada. | Confirmada                |
| Evento concluído não deve aparecer como próximo evento no dashboard.      | Confirmada                |
| Evento cancelado não deve aparecer como próximo evento.                   | Confirmada                |
| Fábrica não cria eventos.                                                 | Confirmada                |
| Fábrica pode atualizar apenas dados operacionais autorizados.             | Confirmada                |
| Fábrica não exclui eventos.                                               | Confirmada                |
| Apenas matriz/franquia criam, editam e excluem eventos comerciais.        | Confirmada                |
| Exclusão física de evento é permitida atualmente para matriz/franquia.    | Atual; precisa de decisão |
| Cancelamento e exclusão são operações diferentes.                         | Inferida; recomendada     |

### 6.3 Transições recomendadas para aprovação

```text
planning -> confirmed -> completed
planning ---------------------> cancelled
confirmed ---------------------> cancelled
completed -> [somente correção administrativa, sem reabrir operação automaticamente]
cancelled -> [sem retorno automático; reabertura exige decisão administrativa]
```

**Decisões pendentes:**

- Se `planning` pode ir diretamente para `completed`.
- Se um evento confirmado pode voltar para planejamento.
- Quem pode cancelar, reabrir ou excluir.
- Se exclusão deve ser substituída por cancelamento/arquivamento.
- Se evento concluído pode receber alterações comerciais e financeiras.

## 7. Financeiro de eventos

### 7.1 Geração automática

Ao criar ou atualizar evento comercial, o sistema pode gerar ou atualizar previsões automáticas de:

- saldo do evento;
- sinal do evento;
- deslocamento;
- comissão de funcionários elegíveis.

Fábrica não sincroniza diretamente o financeiro do evento comercial.

### 7.2 Regras de cálculo identificadas

1. Receita-alvo é o valor final quando informado; caso contrário, usa o orçamento.
2. Saldo é a receita-alvo menos o sinal, nunca abaixo de zero.
3. Deslocamento usa valor não negativo.
4. Comissão usa a receita-alvo e a taxa do funcionário limitada entre 0% e 100%.
5. Funcionários selecionados e responsável são deduplicados.
6. Apenas funcionários com taxa de comissão maior que zero geram comissão automática.
7. Comissão é criada como custo automático com vencimento na data do evento.
8. Previsões abertas podem ser recalculadas; lançamentos já parcialmente ou totalmente liquidados devem ser preservados.

### 7.3 Conflitos que precisam de decisão

| Tema               | Comportamento atual                                                                     | Regra desejada registrada                                                                                         | Decisão necessária                                                                    |
| ------------------ | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Sinal              | É criado como já pago/liquidado quando o valor existe.                                  | Há documento que trata todo sinal informado como recebido; outro documento trata previsões de sinal como abertas. | Confirmar se informar sinal significa recebimento efetivo ou apenas valor contratado. |
| Cancelamento       | Pode remover fisicamente lançamentos automáticos, inclusive em certos casos liquidados. | Regra financeira canônica recomenda preservar histórico e cancelar/reverter por comando.                          | Definir retenção, devolução, crédito ou multa e proibir exclusão física.              |
| Alteração de preço | Sincroniza previsões abertas.                                                           | Não deve reescrever valores já liquidados; deve criar ajuste auditável.                                           | Confirmar política de ajuste.                                                         |
| Fechamento         | Pode marcar fechamento do evento e bloquear parte da sincronização.                     | Fechamento financeiro é distinto do status financeiro e deve exigir comando explícito.                            | Definir quem fecha/reabre e quais campos ficam bloqueados.                            |

## 8. Financeiro geral

### 8.1 Estados canônicos

```text
open -> partial -> settled
open/partial/settled -> cancelled (somente comando explícito e auditado)
```

Regras:

- `open` representa valor ainda não liquidado.
- `partial` representa liquidação parcial.
- `settled` representa valor totalmente liquidado.
- `cancelled` representa lançamento cancelado/revertido, preservando o histórico.
- Status de tela (`pending`/`paid`) é compatibilidade operacional; o estado financeiro canônico é a liquidação.
- Uma liquidação não pode exceder o saldo restante.
- Uma operação idempotente não pode criar duas liquidações.
- Reabrir lançamento com liquidação existente deve preservar o histórico e recalcular o saldo.

### 8.2 Caixa, competência e DRE

| Visão       | Data usada                                                   | Regra                                                         |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| Caixa       | data de cada liquidação                                      | entra somente o que foi efetivamente recebido/pago no período |
| Competência | data do lançamento, evento ou vencimento conforme a natureza | mostra a previsão/obrigação do período                        |
| DRE         | lançamentos não cancelados e corretamente classificados      | não deve incluir itens sem classificação válida               |

O período selecionado deve controlar simultaneamente cartões, gráficos, tabela e eventos relacionados. O padrão documentado é “Este mês”.

### 8.3 Lançamentos manuais, recorrentes e OFX

- Lançamento manual exige tipo, categoria, descrição, valor e data válidos.
- Categoria e classificação devem ser coerentes com receita/custo.
- Recorrência usa frequência, intervalo e, opcionalmente, data final ou quantidade total.
- Importação OFX deve usar identificador externo e idempotência.
- Transação OFX duplicada não pode gerar novo lançamento.
- Transação ambígua deve pedir decisão antes de criar ou vincular.
- Lançamento importado deve preservar sua origem bancária.
- Cliente não pode definir `automatic`, `origin`, `kind`, `eventId`, `unit` ou reversão diretamente.

## 9. Fábrica e ordens de produção

### 9.1 Cadastro e vínculo

Uma ordem possui unidade, número sequencial por unidade, filial, itens, tamanho, ingredientes, custo, evento opcional, origem e tratamento contábil.

Regras confirmadas:

1. Número da ordem é sequencial dentro da unidade.
2. Ordem pode ser vinculada a evento elegível da matriz/franquia.
3. Evento vinculado deve estar em estado operacional permitido, atualmente confirmado ou concluído.
4. Tratamento padrão atual é `internal_transfer`.
5. Fábrica consulta e altera ordens dentro do próprio tenant.
6. Financeiro da ordem só é sincronizado quando a ordem está entregue e possui custo positivo.
7. Ordem entregue gera atualmente uma receita automática na fábrica, categoria ingredientes.

### 9.2 Conflito contábil principal

O documento financeiro canônico define que transferência interna entre matriz/franquia e fábrica não deve criar caixa por padrão. Venda externa exige preço, cliente e pagamento explícitos.

O código atual cria receita automática para ordem entregue sem usar de forma efetiva o campo `accountingTreatment`.

**Regra a aprovar:**

| Tratamento          | Financeiro esperado                                                            |
| ------------------- | ------------------------------------------------------------------------------ |
| `internal_transfer` | movimentação operacional/contábil interna, sem entrada de caixa por padrão     |
| `external_sale`     | receita somente com cliente, preço, forma de pagamento e condições preenchidos |

### 9.3 Estados recomendados

```text
a_preparar -> em_producao -> pronto -> entregue
     \-------------------------------> cancelado
```

O código atual não centraliza todas as transições. Deve ser definido quem pode avançar, voltar, cancelar e concluir uma ordem.

## 10. Receitas e consumo de produção

- Existe uma receita por unidade de fábrica.
- A receita possui ingredientes/insumos e tamanhos com quantidade padrão.
- A leitura pode criar uma receita padrão quando ainda não existe.
- A edição substitui ingredientes e tamanhos.

**Pendente:** definir se alteração da receita afeta ordens já criadas, somente ordens futuras ou uma versão específica da receita. A recomendação é versionar a receita usada em cada ordem.

## 11. Estoque de insumos e utensílios

### Estado atual

O sistema possui cadastros de insumos e utensílios com quantidade, unidade, custo, fornecedor, validade, categoria e status. Há categorias próprias e telas de manutenção.

### Regras que precisam ser formalizadas

1. Entrada de estoque deve registrar origem, quantidade, custo, data e responsável.
2. Saída de estoque deve registrar motivo, quantidade e responsável.
3. Ajuste manual deve exigir motivo e auditoria.
4. Quantidade nunca pode ficar negativa, salvo exceção aprovada.
5. Abaixo do estoque mínimo deve gerar alerta.
6. Insumo vencido não pode ser consumido.
7. Produção entregue deve baixar insumos automaticamente somente se houver ficha técnica e consumo calculável.
8. Cancelamento de produção deve estornar consumo somente se o consumo ainda não tiver sido confirmado fisicamente.
9. Custo médio, custo da última compra ou custo fixo devem ser definidos para cálculo de produção.
10. Utensílios devem ter controle de disponibilidade, manutenção, perda e transferência entre unidades.

**Status:** pendente. O código atual é predominantemente cadastro, sem livro de movimentos completo.

### Pedidos de abastecimento entre unidades e Fábrica

- Matriz e franquias podem solicitar itens ativos do estoque da Fábrica; a unidade e a franquia solicitante são determinadas pela sessão autenticada.
- A Fábrica ajusta quantidades na separação. No despacho, o estoque da Fábrica é baixado em transação e não pode ficar negativo.
- A unidade solicitante confirma a quantidade recebida. Só essa quantidade entra no estoque local; o pedido conserva quantidades solicitadas, despachadas, recebidas e seu histórico.
- Diferença entre despacho e recebimento fica marcada no pedido. A confirmação não pode ser repetida para movimentar estoque novamente.
- No primeiro recebimento, a unidade pode vincular um item local de mesmo nome e unidade ou deixar o sistema criar o item local vinculado. Não há associação automática por nome.
- Pedidos podem ser cancelados antes do despacho. Depois do despacho, seguem para confirmação de recebimento e não geram lançamentos financeiros.

Essas regras cobrem o fluxo de pedidos e não substituem um livro geral de movimentos para entradas e ajustes manuais de estoque.

## 12. Contratantes, contratos e cardápios

### Contratantes

O cadastro suporta pessoa física/jurídica, categoria, documento, status e receita total. Ainda faltam regras formais para:

- documento obrigatório e validação por tipo;
- duplicidade por documento;
- arquivamento versus exclusão;
- vínculo com contratos e eventos;
- alteração de dados após emissão fiscal.

### Contratos

O contrato pode conter cliente, evento, valores, quantidades, serviços extras, mínimo de convidados, bebidas, condições de pagamento, termos, cardápio, aviso prévio, multa e status.

Regras atuais ou documentadas:

- status inicial é rascunho;
- evento pode ser vinculado ao contrato;
- existe configuração de prazo de cancelamento e multa;
- existe indicador de pagamento.

**Pendências:** aprovação, assinatura, versão imutável, alteração após assinatura, cálculo da multa, efeito do cancelamento no evento e sincronização do valor contratado com o financeiro.

### Cardápios

Cardápios possuem categorias, itens e preços e podem ser relacionados a eventos. Deve ser definido se o preço usado no contrato/evento é uma cópia imutável ou uma referência viva ao cardápio atual. A recomendação é copiar a versão usada no contrato.

## 13. Funcionários, prestadores e comissões

- Funcionários possuem status, cargo, salário, comissão, disponibilidade e habilidades.
- Taxa de comissão deve ficar entre 0% e 100%.
- Prestadores podem ser PF ou PJ conforme o contexto.
- Comissão automática usa a receita-alvo do evento e a equipe vinculada.
- Funcionário removido da equipe antes da liquidação pode alterar previsão aberta.
- Comissão já liquidada não deve ser reescrita automaticamente.

**Pendentes:** momento em que a comissão nasce como obrigação, aprovação manual, pagamento fora do financeiro, comissão sobre sinal ou saldo, e regra para cancelamento depois de comissão paga.

## 14. Tarefas e checklist operacional

- Tarefa possui título, descrição, status, prioridade, responsável, vencimento e evento opcional.
- Concluir uma tarefa gera histórico automático na primeira conclusão.
- Dashboard considera pendentes as tarefas cujo status não é concluído.
- Checklist de envio é uma área operacional compartilhada.

**Pendentes:** estados válidos e transições, reabertura, bloqueio por dependência, obrigatoriedade de checklist para mudar evento de estado e prazo/alerta de tarefa atrasada.

## 15. Notas fiscais

### NF-e / NFS-e

Regras confirmadas ou implementadas:

1. Emissão exige CPF/CNPJ do cliente.
2. NF-e exige ao menos um item.
3. Itens de NF-e exigem NCM e CFOP.
4. Cliente precisa de endereço completo para emissão.
5. Certificado deve existir e certificado próximo do vencimento deve gerar alerta.
6. NF-e recebe número, chave, protocolo e XML quando autorizada.
7. NFS-e depende de pagamento/identificador Asaas.
8. Emissão pode ficar em processamento e depois ser consultada.
9. Rejeição registra erro de emissão.

### Pendências críticas

- Após autorizada, a nota deve ser imutável.
- Cancelamento deve ser uma operação fiscal própria, com prazo e motivo.
- Deve existir carta de correção quando aplicável.
- Exclusão física após emissão deve ser proibida.
- Deve haver diferenciação clara entre rascunho, processando, emitida, rejeitada, cancelada e inutilizada.
- Dados fiscais devem ser separados dos dados comerciais editáveis.

## 16. Franquias

O cadastro de franquia possui nome, responsável, cidade, estado, taxa mensal, status e data de abertura.

**Regras atuais:** isolamento por unidade e restrição de gestão para usuários não matriz.

**Pendências:** ciclo de implantação, ativação, suspensão, encerramento, cobrança da taxa mensal, inadimplência, transferência de titularidade e efeito do encerramento nos eventos/usuários.

## 17. Dashboard, auditoria e chat

### Dashboard

- Próximos eventos: data futura ou atual, excluindo concluídos e cancelados.
- Tarefas pendentes: status diferente de concluído.
- Funcionários/contratantes ativos: status `ativo`.
- Fábrica não deve exibir eventos comerciais como se fossem eventos próprios, salvo regra explícita.

### Chat

O chat pode consultar eventos, financeiro, tarefas, funcionários e contratantes e possui ações de criação de tarefa/financeiro.

**Lacunas críticas:** as ações do chat precisam obedecer às mesmas permissões, filtros de tenant, validações e auditoria das telas. O modelo não pode criar lançamento financeiro em nome de outra unidade nem escolher origem, classificação ou estado de liquidação sem comando autorizado.

### Auditoria

Auditoria deve cobrir pelo menos:

- login e logout relevantes;
- criação, alteração e cancelamento de eventos;
- liquidações, reversões e reaberturas financeiras;
- emissão, cancelamento e correção fiscal;
- alterações de permissões;
- mudanças de estoque;
- ordens de produção e transferências internas.

## 18. Matriz de prioridades para implementação

### P0 — segurança e integridade

1. Uniformizar autorização no backend por tenant, página e ações sensíveis.
2. Corrigir criação de usuário para impedir que administrador de unidade escolha outra unidade.
3. Garantir que chat use o mesmo isolamento, permissões e auditoria da API.
4. Impedir exclusão física de lançamentos financeiros e notas autorizadas.
5. Resolver a regra de cancelamento de evento com valores já liquidados.

### P1 — consistência financeira

1. Definir sinal: recebido ou previsão.
2. Consolidar o estado canônico de liquidação.
3. Separar previsão aberta de valor liquidado.
4. Implementar fechamento financeiro com permissões, bloqueios e reabertura auditada.
5. Corrigir contabilidade da fábrica conforme `internal_transfer`/`external_sale`.

### P2 — operação

1. Centralizar máquinas de estado de evento, ordem e tarefa.
2. Implementar livro de movimentos de estoque.
3. Versionar receita e cardápio usados por uma ordem/contrato.
4. Formalizar contrato, assinatura, multa e sincronização com evento/financeiro.
5. Formalizar regras de comissão.

### P3 — fiscal e administração

1. Imutabilidade e cancelamento fiscal.
2. Ciclo de vida de franquia e cobrança.
3. Permissões por ação.
4. Auditoria completa de operações sensíveis.

## 19. Decisões necessárias para fechar o domínio

As decisões abaixo devem ser aprovadas antes de iniciar a implementação das regras:

1. Qual é o ciclo oficial do evento e quem pode executar cada transição?
2. Informar o sinal significa que ele foi recebido?
3. O que acontece com sinal pago quando o evento é cancelado: devolução, retenção, crédito ou multa?
4. Evento cancelado preserva todos os lançamentos e os marca como cancelados/revertidos?
5. O que o fechamento financeiro bloqueia e quem pode reabrir?
6. Ordem de fábrica interna gera ou não movimentação de caixa?
7. Quais campos são obrigatórios para uma venda externa da fábrica?
8. Produção baixa estoque automaticamente? Em que momento?
9. Qual política de estoque negativo, validade e ajustes?
10. Contrato assinado pode ser alterado? Como versionar?
11. Cardápio usado em contrato é congelado ou atualizado ao vivo?
12. Como calcular e aprovar comissões?
13. Permissões serão por página, por ação ou ambas?
14. Quais operações o chat pode executar?
15. Nota autorizada pode ser cancelada, corrigida ou apenas consultada?
16. Quais são os estados oficiais de franquia e suas consequências financeiras?

## 20. Próximo passo

Após a aprovação deste mapa e das decisões pendentes, o trabalho deve ser dividido em especificações menores por domínio, nesta ordem:

1. segurança, tenant e permissões;
2. financeiro e eventos;
3. fábrica e estoque;
4. contratos, cardápios e comissões;
5. fiscal;
6. dashboard, chat e melhorias operacionais.

Cada etapa deve incluir contrato de API, regras de transição, validações, auditoria, migração de dados quando necessária e testes de integração.
