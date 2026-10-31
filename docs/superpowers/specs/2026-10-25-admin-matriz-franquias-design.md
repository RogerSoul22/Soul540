# Administrador da matriz e visão consolidada de franquias

Status: aprovado para implementação

## Intenção

Impedir que o administrador global entre no portal operacional de uma franquia, mantendo no sistema Principal uma visão consolidada dos agendamentos/eventos e do financeiro de todas as franquias.

## Regra de acesso

- Administrador global: usuário administrativo da unidade `main`; autentica somente no sistema Principal.
- Usuário de franquia: permanece limitado ao `franchiseId` próprio e pode acessar o portal da sua franquia.
- Usuário de fábrica: permanece limitado ao sistema Fábrica.
- O sistema Principal pode consultar dados consolidados das franquias, sem alterar o escopo de login do administrador global.

## Abordagem escolhida

Separar administrador global da matriz de administrador local de franquia usando `unit` e `franchiseId`, em vez de bloquear todo usuário com `isAdmin`. O login rejeitará somente administrador global no sistema `franchise`; consultas consolidadas no Principal usarão filtros explícitos para franquias e retornarão a origem de cada registro.

## Escopo

- Ajustar autenticação e testes de seleção de sistema.
- Garantir consulta agregada de eventos/agendamentos de franquias no Principal.
- Garantir consulta agregada de financeiro de franquias no Principal.
- Preservar isolamento e operações dos portais de franquia.
- Atualizar contratos/tipos e cobertura de testes quando necessário.

## Fora de escopo

- Alterar permissões de módulos existentes.
- Permitir edição global de dados de franquias a partir da visão consolidada.
- Executar migração de dados ou alterar credenciais.
