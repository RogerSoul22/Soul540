# Sinal de evento como pagamento confirmado

> Revisão de reconciliação: além da ausência, `amountCents` divergente do valor monetário também deve ser corrigido. Um valor com fração de centavo não é baixado automaticamente e exige revisão manual.

> Atualização de implementação: a migração alcança sinal automático ativo sem itens em `settlements` ou sem `amountCents`, tanto com status `pending` quanto `paid`. Ela preserva `settledAt` histórico quando existir; caso contrário, registra o instante da migração. O filtro de escrita exige `kind: deposit`, `automatic: true`, o status e valor originais, além de proteger o campo canônico ausente.

## Objetivo

Todo sinal informado no evento representa valor já recebido. O lançamento financeiro automático do sinal deve nascer como `paid`, com uma baixa integral, e refletir o caixa na data do sinal.

## Escopo

- Aplicar a regra às unidades principal e franquia, que são as únicas que criam e sincronizam o financeiro de eventos.
- Manter a fábrica fora deste fluxo: ela só atualiza dados operacionais de eventos e não possui criação financeira de sinal.
- Manter o saldo contratual como previsão pendente até sua baixa própria.
- Corrigir somente lançamentos automáticos de evento com `kind: deposit`; lançamentos manuais não fazem parte da migração.

## Regra de negócio

1. Se `depositValue` for maior que zero, sincronizar um lançamento de receita de sinal.
2. A data de competência e da baixa é `depositDate`; sem ela, usar a data do evento.
3. O sinal recebe uma baixa imutável de valor integral e fica com `status: paid`, `settlementStatus: settled` e saldo em aberto zero.
4. Cancelamentos continuam removendo os lançamentos automáticos vinculados, inclusive sinais já baixados, conforme a regra atual de cancelamento de eventos.
5. Uma alteração posterior no valor ou na data de um sinal já baixado não pode sobrescrever sua baixa; deve seguir o fluxo de ajuste financeiro existente.

## Migração histórica

- Executar primeiro uma prévia somente leitura nas coleções financeiras principal e de franquia.
- Selecionar apenas sinais automáticos ativos sem baixa registrada.
- Criar uma baixa integral datada por `depositDate` do evento, ou pela data já gravada no lançamento quando a data do sinal não estiver disponível.
- Preservar valores, vínculo do evento, categoria, origem e demais lançamentos.
- Exigir confirmação explícita, referência de backup e arquivo de rollback antes de gravar.

## Implementação

- Centralizar a criação da baixa de sinal no sincronizador financeiro de eventos, usando o mesmo formato canônico das demais baixas.
- Incluir uma ação de migração específica para sinais automáticos legados, separada da normalização genérica de status.
- Garantir idempotência: uma nova sincronização ou reexecução da migração não cria segunda baixa.

## Testes e validação

- Sinal novo cria lançamento `paid` com baixa integral e data correta.
- Saldo do evento continua pendente e não duplica a receita do contrato.
- Alteração de sinal já baixado não o reabre silenciosamente.
- Prévia identifica apenas sinais automáticos legados sem baixa; aplicação é idempotente.
- Validar principal e franquia, a ausência de sinais elegíveis após a migração e a exibição de `Pago` no financeiro.
