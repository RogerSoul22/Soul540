# Regras de negócio — Cardapios

**Portal:** `main`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Cadastrar versões de cardápio, categorias, itens e preços que possam ser associadas a eventos e contratos.

## Acesso e atores

A matriz pode administrar cardápios compartilháveis, mas a unidade que usar o cardápio deve receber uma versão identificável.

A visualização e as ações dependem da permissão da página e das permissões de ação definidas para o usuário.

## Regras da página

1. Nome do cardápio é obrigatório dentro da unidade.
2. Itens devem pertencer a uma categoria e possuir preço válido quando forem comercializados.
3. A associação a evento ou contrato deve guardar a versão efetivamente utilizada.
4. Alterar um cardápio não pode reescrever silenciosamente o preço de um contrato já aprovado.
5. Exclusão deve ser impedida ou substituída por arquivamento quando houver contratos ou eventos vinculados.

## Efeitos e integrações

- Alimenta o formulário de eventos e contratos.
- Pode gerar uma cópia de itens e preços no documento comercial.

## Pendências de negócio

- Definir versionamento formal.
- Definir se itens sem preço podem aparecer em cardápio publicado.
- Definir publicação e arquivamento.
