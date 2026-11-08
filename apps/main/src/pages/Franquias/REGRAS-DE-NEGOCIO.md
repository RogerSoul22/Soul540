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
2. A troca de status (implantação → ativa, suspensão, congelamento, encerramento, reativação) é decisão manual do administrador da matriz. O sistema não impõe critério, checklist ou automação para essa troca — é julgamento do negócio, feito tela a tela.
3. Usuário de uma franquia não pode administrar outra franquia.
4. Encerramento ou suspensão não deve apagar histórico de eventos, financeiro ou usuários (hoje é soft: muda `status` e marca `deletedAt`).
5. O que acontece com o acesso de usuários de uma franquia logo após ela ser suspensa/encerrada também é decisão manual do administrador (ex.: desativar usuários um a um), não um efeito automático do sistema.
6. Taxa mensal (`monthlyFee`) é só um valor de referência cadastrado. Cobrança, lembrete e controle de inadimplência são **decisão explícita de não automatizar**: isso é feito manualmente, fora do sistema. Não deve ser confundida com receita de evento.

## Efeitos e integrações

- Define o tenant usado por usuários e dados operacionais.
- Pode alimentar indicadores consolidados e permissões.
- Status `suspensa`/`encerrada` restringe login e acesso ao portal da unidade; os demais status (`ativa`, `em_implantacao`, `congelada`) não restringem nada.

## Pendências de negócio

- Definir transferência de titularidade/unidade e dados entre franqueados.
