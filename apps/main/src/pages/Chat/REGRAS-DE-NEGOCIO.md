# Regras de negócio — Chat

**Portal:** `main`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Oferecer consulta assistida e ações operacionais por linguagem natural sem contornar as regras da aplicação.

## Acesso e atores

A matriz pode consultar o escopo consolidado conforme suas permissões; alterações devem respeitar a unidade efetiva calculada no servidor.

A visualização e as ações dependem da permissão da página e das permissões de ação definidas para o usuário.

## Regras da página

1. Toda consulta deve usar o tenant e as permissões do usuário autenticado.
2. Ações de criação ou alteração devem pedir confirmação quando tiverem efeito financeiro, fiscal ou irreversível.
3. O chat não pode escolher unidade, origem, classificação, liquidação ou vínculo automático por conta própria.
4. Toda ação executada pelo chat deve usar os mesmos comandos e validações das telas.
5. Ações concluídas devem gerar auditoria identificando que foram originadas no chat.

## Efeitos e integrações

- Consulta eventos, financeiro, tarefas, funcionários e contratantes.
- Pode criar tarefa ou lançamento somente por comandos autorizados.

## Pendências de negócio

- Definir quais intenções podem alterar dados.
- Definir se confirmação é obrigatória para cada tipo de ação.
- Implementar autorização e filtros de tenant nas ações do chat.

