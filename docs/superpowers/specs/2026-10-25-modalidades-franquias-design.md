# Modalidades de feirinha e evento avulso

## Intenção

Permitir que cada franquia classifique seus agendamentos e lançamentos financeiros como **Feirinha** ou **Evento avulso**, mantendo os dados separados também no sistema principal.

## Decisões

- O domínio terá somente `feirinha` e `evento_avulso`.
- Dados existentes sem modalidade serão tratados como `evento_avulso`, sem migração destrutiva.
- O agendamento será a origem da modalidade dos lançamentos financeiros automáticos.
- Lançamentos financeiros manuais terão seleção explícita de modalidade, com `evento_avulso` como padrão.
- Feirinha é recorrente semanalmente e será cadastrada como uma programação recorrente, com dia da semana, início e término opcional.
- As ocorrências semanais da Feirinha serão virtuais até serem confirmadas; somente a confirmação materializa o agendamento e seus lançamentos financeiros.
- Cada ocorrência confirmada terá identidade, status, valores e ciclo financeiro próprios, podendo ser editada ou cancelada sem alterar a programação das demais semanas.
- A modalidade ficará disponível para filtro e identificação nas telas de Agendamentos e Financeiro da franquia e da matriz.
- A matriz continuará consolidando por franquia, mas poderá separar os resultados por modalidade sem misturar os valores.

## Escopo

### Agendamentos

- Adicionar `modality` ao contrato compartilhado, ao modelo Mongo e aos payloads de criação/edição.
- Incluir a seleção “Feirinha” / “Evento avulso” no formulário da franquia.
- Para Feirinha, incluir programação semanal com dia da semana, data inicial e data final opcional.
- Exibir ocorrências previstas da programação; permitir confirmar uma ocorrência para criar o agendamento real.
- Permitir editar/cancelar uma ocorrência confirmada sem alterar as demais ocorrências da série.
- Exibir a modalidade no card/listagem e permitir filtrar por modalidade na franquia e na matriz.

### Financeiro

- Adicionar `modality` aos contratos e aos modelos de financeiro da franquia e da matriz.
- Propagar a modalidade do agendamento para previsões automáticas de saldo, sinal e deslocamento.
- Incluir a seleção de modalidade nos lançamentos manuais e nas recorrências/importações quando aplicável.
- Não criar lançamentos financeiros para ocorrências virtuais; gerar os lançamentos apenas na confirmação da ocorrência.
- Exibir e filtrar lançamentos por modalidade; os resumos e exportações devem respeitar o filtro ativo.

### Sistema principal

- Manter a consulta consolidada de franquias existente.
- Permitir filtrar agendamentos e financeiro por `feirinha` ou `evento_avulso` nos escopos principal, franquias e consolidado.
- Mostrar a modalidade nos itens para que a origem do total fique clara.

## Não escopo

- Criar coleções, rotas ou menus separados para cada modalidade.
- Alterar o cálculo financeiro dos eventos além de carregar a modalidade.
- Renomear franquias, usuários ou permissões.

## Abordagem considerada

Foi descartado representar as modalidades apenas por categorias financeiras, pois isso não classificaria o agendamento nem garantiria que os lançamentos automáticos permanecessem vinculados ao mesmo grupo. Também foi descartada a criação de fluxos separados, pois duplicaria as regras atuais. Um único campo enum compartilhado mantém a separação explícita e a consolidação simples.

## Critérios de aceite

1. Um novo agendamento pode ser salvo como Feirinha ou Evento avulso.
2. Uma Feirinha pode ser configurada para repetir semanalmente, com início e término opcional.
3. Ocorrência virtual não gera agendamento persistido nem lançamento financeiro.
4. Confirmar uma ocorrência cria o agendamento persistido e seus lançamentos automáticos.
5. Ao editar a modalidade de um agendamento, seus lançamentos automáticos passam a refletir a nova modalidade.
6. Um lançamento manual pode ser salvo com qualquer uma das duas modalidades.
7. Agendamentos e lançamentos sem modalidade antiga aparecem como Evento avulso.
8. Franquia e matriz conseguem filtrar cada modalidade independentemente.
9. A soma exibida após o filtro não inclui a outra modalidade.
10. Testes cobrem recorrência semanal, confirmação de ocorrência, normalização de legado, propagação para financeiro automático e isolamento das consultas por modalidade.
