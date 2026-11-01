# Regras de negócio — Eventos

**Portal:** `factory`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Planejar, confirmar, executar e acompanhar eventos comerciais da unidade.

## Acesso e atores

A fábrica consulta eventos elegíveis para produção e atualiza somente massa, molho, queijo, embalagens, status e outros campos operacionais permitidos.

A visualização e as ações dependem da permissão da página e das permissões de ação definidas para o usuário.

## Regras da página

1. Evento começa em planejamento e deve possuir dados mínimos antes de ser confirmado.
2. Evento confirmado pode ser vinculado à produção e aparecer no planejamento operacional.
3. Evento concluído deixa de ser próximo e não deve ser reaberto automaticamente.
4. Evento cancelado não deve ser tratado como ativo nem gerar nova produção.
5. Somente matriz/franquia criam e alteram dados comerciais; fábrica altera apenas campos operacionais autorizados.
6. Alteração de orçamento, valor final, sinal, equipe ou deslocamento deve sincronizar somente previsões financeiras abertas.
7. Dados já liquidados não podem ser reescritos silenciosamente.
8. A exclusão física deve ser evitada quando houver vínculos; o cancelamento deve preservar histórico.

## Efeitos e integrações

- Sincroniza receitas, saldo, deslocamento e comissões.
- Pode gerar ordem de produção.
- Alimenta dashboard, checklist, contratos e notas fiscais.

## Pendências de negócio

- Aprovar máquina de estados.
- Definir política de cancelamento com sinal pago.
- Definir fechamento financeiro, reabertura e exclusão/arquivamento.
