# Regras de negócio — EstoqueInsumos

**Portal:** `main`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Controlar o cadastro e a disponibilidade de insumos usados pela operação e pela produção.

## Acesso e atores

A matriz pode consultar o escopo consolidado conforme suas permissões; alterações devem respeitar a unidade efetiva calculada no servidor.

A visualização e as ações dependem da permissão da página e das permissões de ação definidas para o usuário.

## Regras da página

1. Insumo deve possuir nome, unidade de medida e quantidade válida.
2. Categoria, custo, fornecedor, validade e estoque mínimo devem ser preservados quando informados.
3. Entrada, saída e ajuste devem ser operações identificáveis, com quantidade, motivo e responsável.
4. Quantidade não deve ficar negativa sem uma exceção de negócio aprovada.
5. Insumo vencido não pode ser reservado ou consumido.
6. Abaixo do mínimo deve gerar indicação de reposição.
7. Importações XML devem ser idempotentes e não podem duplicar entradas.

## Efeitos e integrações

- Pode alimentar receitas e ordens de produção.
- Pode gerar alertas de estoque mínimo e validade.
- Pode impactar custo de produção quando houver consumo confirmado.

## Pendências de negócio

- Criar livro de movimentos.
- Definir custo médio ou custo da última compra.
- Definir consumo automático pela produção e estorno de consumo.

