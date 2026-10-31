# Regras de negócio — Tarefas

**Portal:** `main`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Organizar atividades operacionais, responsáveis, prazos e histórico de conclusão.

## Acesso e atores

A matriz pode consultar o escopo consolidado conforme suas permissões; alterações devem respeitar a unidade efetiva calculada no servidor.

A visualização e as ações dependem da permissão da página e das permissões de ação definidas para o usuário.

## Regras da página

1. Tarefa deve possuir título e status válido.
2. Status deve representar o fluxo real: backlog, em andamento, bloqueada e concluída, conforme catálogo aprovado.
3. Concluir pela primeira vez gera histórico com data e responsável.
4. Reabrir tarefa não deve apagar conclusões anteriores.
5. Tarefa vencida deve ser identificável sem alterar seu histórico.
6. Tarefa vinculada a evento deve respeitar o tenant e o acesso ao evento.

## Efeitos e integrações

- Alimenta dashboard e checklist operacional.
- Pode ser criada pelo chat ou por fluxo de evento.
- Pode gerar notificações e indicadores de atraso.

## Pendências de negócio

- Definir estados e transições.
- Definir dependências e bloqueios.
- Definir notificações e recorrência.

