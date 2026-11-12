# Pedidos de insumos entre franquias e FÃ¡brica

**Status:** implementada; aguardando validaÃ§Ã£o operacional
**Data:** 2026-11-11
**Escopo:** solicitaÃ§Ã£o de insumos pelas unidades de franquia, separaÃ§Ã£o e envio pela FÃ¡brica, confirmaÃ§Ã£o de recebimento e atualizaÃ§Ã£o dos estoques.

## Objetivo

Permitir que uma franquia solicite pelo Soul540 os insumos fornecidos pela FÃ¡brica e acompanhe o atendimento atÃ© o recebimento. Hoje cada contexto mantÃ©m seu prÃ³prio estoque; a tela `Pedidos` da FÃ¡brica trata de produÃ§Ã£o e nÃ£o representa esse fluxo de abastecimento.

## Resultado esperado

- A franquia escolhe itens do catÃ¡logo de insumos da FÃ¡brica, informa quantidades e envia a solicitaÃ§Ã£o.
- A FÃ¡brica vÃª pedidos de todas as franquias, confere disponibilidade e pode ajustar as quantidades antes de despachar.
- Ao despachar, o sistema baixa do estoque da FÃ¡brica as quantidades enviadas e registra quem/quando realizou a aÃ§Ã£o.
- A franquia confirma o que recebeu. O estoque da franquia recebe somente as quantidades confirmadas.
- DiferenÃ§as no recebimento ficam registradas no pedido para conferÃªncia posterior.

## Abordagens consideradas

1. **Pedido rastreÃ¡vel com atualizaÃ§Ã£o nos marcos de envio e recebimento â€” recomendada.** Uma entidade central guarda o pedido e seu histÃ³rico; a FÃ¡brica movimenta seu estoque no despacho e a franquia movimenta o dela na confirmaÃ§Ã£o. DÃ¡ visibilidade e reduz lanÃ§amentos duplicados.
2. **SolicitaÃ§Ã£o simples com ajuste manual dos dois estoques.** Exige menos integraÃ§Ã£o inicial, mas deixa o pedido sem confirmaÃ§Ã£o confiÃ¡vel e depende de alguÃ©m repetir quantidades manualmente em cada portal.

Esta proposta segue a primeira abordagem, conforme o fluxo aprovado na conversa.

## Fluxo e regras propostas

```text
Franquia: rascunho â†’ enviado
FÃ¡brica: enviado â†’ em separaÃ§Ã£o â†’ despachado
Franquia: despachado â†’ recebido
                       â†˜ recebido com divergÃªncia (quantidades conferidas por item)
```

- Um pedido pertence Ã  franquia determinada pela sessÃ£o no servidor. A franquia nÃ£o escolhe nem altera seu `franchiseId` pelo formulÃ¡rio.
- Itens solicitados usam o catÃ¡logo da FÃ¡brica e guardam cÃ³pia do nome e unidade de medida para preservar o histÃ³rico.
- A FÃ¡brica pode alterar a quantidade a enviar antes do despacho. A franquia vÃª a quantidade despachada antes de confirmar.
- O despacho baixa do estoque da FÃ¡brica a quantidade efetivamente enviada. NÃ£o se permite estoque negativo.
- A confirmaÃ§Ã£o registra quantidade recebida por item; somente essa quantidade entra no estoque da franquia. A diferenÃ§a fica registrada como divergÃªncia.
- Cada aÃ§Ã£o de mudanÃ§a de estado Ã© autorizada no backend, idempotente e auditada com ator, unidade e data.
- Pedido enviado nÃ£o Ã© apagado. Cancelamento sÃ³ Ã© permitido antes do despacho; depois do despacho, correÃ§Ãµes sÃ£o registradas como divergÃªncia, sem apagar o histÃ³rico.
- O fluxo nÃ£o cria lanÃ§amento financeiro nem altera custo de produÃ§Ã£o.

## Dados e integraÃ§Ã£o

Criar uma coleÃ§Ã£o de pedidos compartilhada entre as unidades, com identificador, franquia de origem, status, datas, observaÃ§Ãµes, itens e eventos de histÃ³rico. Cada item guarda o ID do insumo da FÃ¡brica, snapshot de nome/unidade, quantidade solicitada, quantidade despachada e quantidade recebida.

O estoque de franquia jÃ¡ usa uma coleÃ§Ã£o separada e nÃ£o possui vÃ­nculo estÃ¡vel com o catÃ¡logo da FÃ¡brica. A implementaÃ§Ã£o adicionarÃ¡ uma referÃªncia ao insumo de origem para que recebimentos recorrentes atualizem o mesmo item. Itens existentes sem referÃªncia nÃ£o serÃ£o associados automaticamente por nome; no primeiro recebimento, a franquia poderÃ¡ vincular a um item existente compatÃ­vel ou criar um novo, evitando mesclar cadastros por engano.

A API terÃ¡ rotas autenticadas para listar catÃ¡logo e pedidos, criar pedido, iniciar separaÃ§Ã£o, despachar, confirmar recebimento e cancelar antes do despacho. A API define unidade e franquia pela sessÃ£o; nÃ£o confia nos valores enviados pelo navegador. Consultas da franquia sÃ£o isoladas Ã  prÃ³pria unidade; a FÃ¡brica vÃª os pedidos de todas as franquias. AtualizaÃ§Ãµes de estoque precisam ser atÃ´micas/idempotentes para impedir baixa ou entrada duplicada em repetiÃ§Ã£o de requisiÃ§Ã£o.

## Telas e acesso

- **Franquias:** nova Ã¡rea â€œPedidos de insumosâ€ com aÃ§Ã£o para criar solicitaÃ§Ã£o, lista com status e detalhe para confirmar recebimento e informar divergÃªncias.
- **FÃ¡brica:** Ã¡rea equivalente com fila de solicitaÃ§Ãµes, detalhe, ajuste das quantidades a enviar e aÃ§Ã£o de despacho.
- A nova permissÃ£o de pÃ¡gina controla menu e acesso. A API tambÃ©m valida cada transiÃ§Ã£o por unidade e permissÃ£o.
- O catÃ¡logo selecionÃ¡vel pela franquia vem do estoque de insumos da FÃ¡brica; a franquia nÃ£o altera cadastro, custo ou saldo desse catÃ¡logo.

## Fora do escopo inicial

- Compra de insumos de fornecedores externos.
- CobranÃ§a, faturamento ou integraÃ§Ã£o com o financeiro.
- Rastreamento de transportadora, cÃ¡lculo de frete ou mÃºltiplas remessas para o mesmo pedido.
- Baixa automÃ¡tica de consumo por produÃ§Ã£o.
- Livro geral de movimentos de estoque, que permanece uma pendÃªncia separada nos mapas das pÃ¡ginas de estoque.

## DecisÃµes de implementaÃ§Ã£o

- Reutilizar a API Express/Mongoose e os estoques existentes do Soul540.
- Registrar um mÃ³dulo de pedidos compartilhado, em vez de reutilizar `production-orders`, pois pedidos de produÃ§Ã£o e abastecimento tÃªm atores, itens e transiÃ§Ãµes diferentes.
- Implementar regras puras de transiÃ§Ã£o/validaÃ§Ã£o antes das rotas; expor contratos compartilhados para os portais.
- Criar telas nas franquias ativas e na FÃ¡brica, usando os componentes existentes do PentÃ¡gono.
- Adicionar testes de regra, API (incluindo isolamento entre franquias, transiÃ§Ãµes invÃ¡lidas e idempotÃªncia) e interface do fluxo de criaÃ§Ã£o/confirmaÃ§Ã£o.

## AprovaÃ§Ã£o

O usuÃ¡rio aprovou este fluxo em 2026-11-11. O plano de implementaÃ§Ã£o estÃ¡ em `docs/superpowers/plans/2026-11-11-pedidos-insumos-franquia-fabrica.md`.

## Ajuste de catÃ¡logo e estoque (2026-11-12)

- O catÃ¡logo disponÃ­vel para os pedidos vem da seÃ§Ã£o **Insumos** da receita de produÃ§Ã£o da FÃ¡brica (`ProductionRecipe.insumos`), nÃ£o dos registros do Estoque de Insumos.
- A criaÃ§Ã£o do pedido nÃ£o exige saldo disponÃ­vel no estoque da FÃ¡brica.
- Despachar o pedido registra quantidades e histÃ³rico, mas nÃ£o baixa automaticamente o estoque da FÃ¡brica.
- Ao confirmar o recebimento, somente as quantidades recebidas continuam sendo adicionadas ao estoque da franquia.
