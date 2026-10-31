# Regras de negócio — Franquias

**Portal:** `main`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Administrar unidades franqueadas, seus dados cadastrais, implantação e situação operacional.

## Acesso e atores

Somente o contexto matriz administra o ciclo de vida de franquias.

A visualização e as ações dependem da permissão da página e das permissões de ação definidas para o usuário.

## Regras da página

1. Cadastro deve possuir nome, responsável, cidade, estado e unidade.
2. A franquia inicia em implantação e só deve ficar ativa após os requisitos definidos pelo negócio.
3. Usuário de uma franquia não pode administrar outra franquia.
4. Encerramento ou suspensão não deve apagar histórico de eventos, financeiro ou usuários.
5. Taxa mensal deve ter regra própria de cobrança e não deve ser confundida com receita de evento.

## Efeitos e integrações

- Define o tenant usado por usuários e dados operacionais.
- Pode alimentar cobrança, indicadores consolidados e permissões.
- Pode restringir login e operações da unidade.

## Pendências de negócio

- Definir estados de implantação/ativa/suspensa/encerrada.
- Definir cobrança, inadimplência e reativação.
- Definir transferência de unidade e dados.

