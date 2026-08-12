# Filtro financeiro no padrão Conta Azul

## Objetivo

Padronizar o filtro de período do Financeiro nos portais principal, franquia e fábrica com o formato da Conta Azul e fazer o intervalo selecionado controlar todas as informações financeiras visíveis.

## Experiência

O Financeiro abre em **Este mês**. O cabeçalho do filtro mostra o intervalo ativo em formato brasileiro, entre botões para avançar ou retroceder. Ao abrir o seletor, o usuário pode escolher **Esta semana**, **Este mês**, **Este ano**, **Últimos 30 dias**, **Últimos 12 meses**, **Todo o período** ou **Período personalizado**. O período personalizado aceita data inicial e final válidas.

As setas deslocam o período atualmente exibido: semana por semana, mês por mês, ano por ano, janelas móveis pela mesma duração e intervalos personalizados pela própria duração. Em **Todo o período** as setas ficam indisponíveis.

## Regra de negócio

O filtro desta tela é uma visão de **competência**: compara o intervalo com `finance.date`. O sinal pago já utiliza `depositDate` como `finance.date`; sem ela, utiliza a data do evento. Portanto, um sinal aparece no mês em que foi efetivamente recebido, sem precisar de regra paralela no filtro.

O mesmo intervalo filtra lançamentos, cards, gráficos, resumos, categorias, eventos e o painel antes chamado de mensal. Este passa a se chamar **Painel do Período**, pois pode representar qualquer intervalo. Filtros locais de mês, ano e intervalo serão removidos para não gerar números diferentes na mesma tela.

## Arquitetura

`shared/financePeriod.ts` concentra tipos, atalhos, navegação, rótulo e teste inclusivo de datas. `shared/FinancePeriodFilter.tsx` fornece o mesmo controle visual aos três portais; cada portal apenas informa sua cor de destaque. Os dados permanecem nos respectivos contextos e são filtrados localmente pela regra compartilhada.

## Limites

- Não altera lançamentos, status, baixas ou dados do banco.
- Não cria uma visão adicional de caixa realizado; esta entrega conserva a competência atual.
- Não inclui datas inválidas no resultado.

## Validação

Testes unitários cobrem atalhos, limites inclusivos, todo o período e navegação. Testes de interface verificam o uso do filtro compartilhado nos três Financeiros. A validação final inclui suíte, TypeScript e build dos três portais.
