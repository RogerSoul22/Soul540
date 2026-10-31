# Regras de negócio — EstoqueUtensilios

**Portal:** `main`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Controlar quantidade, localização e disponibilidade de utensílios usados pela unidade.

## Acesso e atores

A matriz pode consultar o escopo consolidado conforme suas permissões; alterações devem respeitar a unidade efetiva calculada no servidor.

A visualização e as ações dependem da permissão da página e das permissões de ação definidas para o usuário.

## Regras da página

1. Utensílio deve possuir nome, quantidade e, quando aplicável, valor unitário.
2. Status deve distinguir disponibilidade, uso, manutenção, perda e descarte.
3. Transferência entre unidades deve registrar origem, destino e responsável.
4. Ajuste de quantidade deve exigir motivo e auditoria.
5. Utensílio indisponível não pode ser reservado para uma operação.

## Efeitos e integrações

- Pode apoiar planejamento de evento e operação.
- Pode alimentar inventário e auditoria patrimonial.

## Pendências de negócio

- Definir estados oficiais.
- Definir manutenção e baixa.
- Definir se o planejamento de evento reserva utensílios automaticamente.

