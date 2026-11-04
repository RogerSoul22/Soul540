# Correções de usabilidade em formulários e eventos

## Objetivo

Corrigir regressões observáveis introduzidas nas mudanças recentes: permitir digitar datas mantendo o calendário, exibir todos os próximos eventos na página principal e não adicionar controles de limpeza automaticamente a todos os campos de texto.

## Abordagens consideradas

- Restaurar os campos nativos de data. É simples e retoma a edição, mas remove a experiência do calendário próprio.
- Manter o calendário próprio e aceitar texto em `dd/mm/aaaa` (e `mm/aaaa` para mês). Esta é a abordagem escolhida: preserva o seletor e recupera a edição digitada, normalizando o valor enviado para ISO.
- Manter a página de eventos limitada a seis e confiar apenas nas páginas por status. Isso não atende às reclamações de visibilidade; a lista principal deve mostrar todos os próximos eventos.

## Escopo

- Campo de data/mês aceita digitação e seleção pelo calendário.
- Datas incompletas ou inválidas não substituem o valor no backend; o formulário deve sinalizar validade e respeitar obrigatoriedade e limites.
- A página principal de Eventos apresenta todos os eventos futuros elegíveis, sem limite artificial de seis.
- O botão “limpar” nos campos de texto passa a ser opt-in; chamadas que definirem `clearable` continuam funcionando.

## Restrições e fora de escopo

- Preservar os valores ISO enviados aos formulários e APIs.
- Preservar regras financeiras, autenticação, permissões, escopo de franquia/fábrica, fila offline e fluxo fiscal.
- Não reverter mudanças visuais deliberadas em bloco sem evidência de regressão específica.

## Critérios de aceite

- Usuário consegue digitar `dd/mm/aaaa` ou `ddmmaaaa` e também escolher a data no calendário.
- A mudança continua propagando o valor como `aaaa-mm-dd`; o campo vazio continua sujeito à regra `required`.
- Usuário vê todos os próximos eventos elegíveis na tela inicial de Eventos.
- Campos de texto não recebem o botão “X” automaticamente; campos com `clearable` explícito ainda o recebem.
