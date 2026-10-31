# Regras de negócio — Usuario

**Portal:** `main`
**Status:** mapa específico da página; regras pendentes ainda não foram implementadas como contrato definitivo.

Esta página deve obedecer às regras globais de tenant, autenticação, dinheiro, datas e auditoria descritas em [Regras gerais do Soul540](../../../../../docs/superpowers/specs/2026-10-10-regras-de-negocio-soul540-design.md).

## Objetivo

Administrar usuários do contexto matriz e seus dados de acesso.

## Acesso e atores

A matriz pode administrar usuários de todas as unidades conforme autorização administrativa.

A visualização e as ações dependem da permissão da página e das permissões de ação definidas para o usuário.

## Regras da página

1. Rotas de cadastro, edição e exclusão exigem administrador.
2. E-mail é único e normalizado.
3. Senha é armazenada somente como hash.
4. Usuário de unidade não pode criar ou mover usuário para outra unidade sem autorização matriz.
5. Exclusão de usuário de franquia/fábrica deve ser bloqueada ou substituída por desativação.
6. Alterações devem gerar auditoria.

## Efeitos e integrações

- Define identidade, unidade e permissões do sistema.
- Afeta login, menus, guards e filtros de tenant.

## Pendências de negócio

- Definir desativação e reativação.
- Definir transferência de usuário entre unidades.
- Definir política de exclusão de administrador.

