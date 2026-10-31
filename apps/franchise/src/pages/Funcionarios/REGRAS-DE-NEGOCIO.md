# Regras de negócio — Funcionarios

**Portal:** `franchise`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Cadastrar pessoas que trabalham na operação e parametrizar disponibilidade, função e comissão.

## Acesso e atores

A franquia acessa somente os dados da própria unidade e não pode escolher outra unidade pela requisição.

A visualização e as ações dependem da permissão da página e das permissões de ação definidas para o usuário.

## Regras da página

1. Funcionário deve possuir nome, função e status.
2. Somente funcionários ativos podem ser selecionados em novas equipes.
3. Taxa de comissão deve ficar entre 0% e 100%.
4. Alterar taxa ou status não deve reescrever comissões já liquidadas.
5. Remover funcionário de equipe altera apenas previsão ainda aberta.
6. Dados de salário e comissão devem respeitar a permissão administrativa.

## Efeitos e integrações

- É usado em eventos, tarefas e comissões.
- Pode alimentar dashboard e planejamento operacional.

## Pendências de negócio

- Definir aprovação de comissão.
- Definir comissão sobre sinal, saldo ou valor total.
- Definir histórico de alterações de remuneração.

