# Regras de negócio — Contratantes

**Portal:** `franchise`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Manter o cadastro de clientes/contratantes usado por eventos, contratos e documentos fiscais.

## Acesso e atores

A franquia acessa somente os dados da própria unidade e não pode escolher outra unidade pela requisição.

A visualização e as ações dependem da permissão da página e das permissões de ação definidas para o usuário.

## Regras da página

1. Nome e tipo de pessoa devem ser informados.
2. CPF/CNPJ deve ser validado e não pode duplicar outro contratante ativo na mesma unidade.
3. Dados de contato devem estar disponíveis para o evento e para a emissão fiscal.
4. Contratante arquivado não deve aparecer como opção em novos eventos, mas deve permanecer em históricos.
5. Exclusão física deve ser bloqueada quando houver evento, contrato, financeiro ou nota vinculada.

## Efeitos e integrações

- É usado por eventos e contratos.
- Pode fornecer CPF/CNPJ e endereço para notas fiscais.
- Pode ser usado em filtros do dashboard e do chat.

## Pendências de negócio

- Definir campos obrigatórios por tipo de pessoa.
- Definir regra de fusão de cadastros duplicados.
- Definir arquivamento e reativação.

