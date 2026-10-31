# Regras de negócio — MinhaConta

**Portal:** `franchise`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Permitir que o usuário consulte e atualize seus próprios dados de conta dentro dos limites autorizados.

## Acesso e atores

A franquia acessa somente os dados da própria unidade e não pode escolher outra unidade pela requisição.

A visualização e as ações dependem da permissão da página e das permissões de ação definidas para o usuário.

## Regras da página

1. Usuário pode atualizar dados pessoais permitidos e senha.
2. Usuário não pode trocar a própria unidade por esta página.
3. Alteração de e-mail deve respeitar unicidade e confirmação quando aplicável.
4. Senha deve cumprir a política de segurança e não deve ser registrada em auditoria.
5. Alterações sensíveis devem gerar auditoria.

## Efeitos e integrações

- Atualiza a identidade usada no login e nas auditorias.
- Pode afetar nome exibido, mas não históricos existentes.

## Pendências de negócio

- Definir campos editáveis.
- Definir confirmação de e-mail e troca de senha.
- Definir encerramento da própria conta.

