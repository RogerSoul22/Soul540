# Regras de negócio — Dashboard

**Portal:** `main`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Apresentar uma visão operacional resumida da unidade, respeitando o escopo e as permissões do usuário.

## Acesso e atores

A matriz pode consultar o escopo consolidado conforme suas permissões; alterações devem respeitar a unidade efetiva calculada no servidor.

A visualização e as ações dependem da permissão da página e das permissões de ação definidas para o usuário.

## Regras da página

1. Próximos eventos usam a data atual como referência e excluem eventos concluídos ou cancelados.
2. Tarefas pendentes são as que não estão concluídas.
3. Indicadores de pessoas consideram somente registros ativos.
4. A contagem e os valores devem usar os filtros de tenant do servidor.
5. O dashboard não deve inferir recebimento financeiro apenas porque existe orçamento ou evento.

## Efeitos e integrações

- Consulta eventos, tarefas, pessoas e indicadores financeiros.
- Pode direcionar o usuário para o detalhe da origem de cada indicador.

## Pendências de negócio

- Definir quais indicadores são oficiais.
- Definir atualização em tempo real ou periodicidade.
- Definir metas e alertas exibidos.

