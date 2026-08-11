# Sinal de Evento Pago Implementation Plan

> Revisão de reconciliação: além de valores ausentes, o processo corrige `amountCents` divergente. Valores com fração de centavo permanecem para revisão manual, sem gerar baixa automática.

> Atualização após a prévia: sinais legados podem aparecer como `paid` e `settled`, mas não conter itens em `settlements`, `settledCents` ou `amountCents`. A ação `settle_automatic_deposit` trata esses registros e sinais pendentes sem baixa, somente para lançamentos automáticos ativos de `kind: deposit`. A baixa canônica preserva o `settledAt` histórico existente; sem ele, usa o instante da migração. Quando a baixa já existe, a migração completa apenas `amountCents`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Fazer o sinal de eventos principal e de franquia entrar como receita paga, com baixa integral na data do sinal, e migrar sinais automáticos pendentes já existentes.

**Architecture:** O sincronizador de eventos continuará criando saldo e custos como previsões, mas criará o sinal com uma baixa canônica e imutável. A reconciliação ganhará uma ação específica para identificar somente sinais automáticos ativos sem baixa; o migrador aplicará essa ação globalmente, de forma idempotente, nas coleções principal e de franquia.

**Tech Stack:** TypeScript, Express, Mongoose, Node test runner, MongoDB.

## Global Constraints

- Usar depositDate; sem ela, usar a data do evento.
- A fábrica não participa: ela não cria nem sincroniza financeiro de eventos.
- Não modificar lançamentos manuais, valores, categoria, origem ou vínculo de evento.
- Toda escrita exige prévia, confirmação explícita, backup existente e rollback novo.
- Sinal já baixado não pode ser alterado silenciosamente.

---

## File Structure

- server/routes/events.ts: cria a baixa canônica do sinal novo.
- server/routes/__tests__/eventFinance.test.ts: prova sinal pago, baixa integral e saldo pendente.
- server/services/financeReconciliation.ts: encontra sinais automáticos pendentes.
- server/services/__tests__/financeReconciliation.test.ts: testa o achado específico.
- server/services/financeMigration.ts: monta atualização idempotente do sinal histórico.
- server/services/__tests__/financeMigration.test.ts: testa dados e filtro da migração.
- server/scripts/migrate-finances.ts: executa a ação global somente em principal e franquia.
- server/__tests__/reconcile-script.test.ts: evita regressão da janela de datas no CLI.

## Task 1: Baixa automática do sinal novo

**Files:**
- Modify: server/routes/events.ts
- Modify: server/routes/__tests__/eventFinance.test.ts

**Interfaces:**
- Consumes: buildSettlementRecord(input, settledBy, settledAt?, id?) de server/services/financeCommands.ts.
- Produces: lançamento kind deposit com status paid, settlementStatus settled, settledCents igual a amountCents e uma única baixa em settlements.

- [ ] **Step 1: Escrever o teste que falha**

Substituir o teste de sinal pendente por:

~~~ts
test('creates an event deposit as a settled receipt on the deposit date', async () => {
  // criar evento com depositValue: 300 e depositDate: '2026-06-20'
  // executar syncEventFinances(event, financeModel, 'main')
  assert.equal(deposit.status, 'paid');
  assert.equal(deposit.settlementStatus, 'settled');
  assert.equal(deposit.settledCents, 30_000);
  assert.equal(deposit.settlements[0].amountCents, 30_000);
  assert.equal(deposit.settlements[0].settledOn, '2026-06-20');
  assert.equal(deposit.settlements[0].idempotencyKey, 'event-deposit:event-1');
});
~~~

No mesmo caso, localizar o lançamento kind balance e exigir status pending e settlementStatus open.

- [ ] **Step 2: Confirmar o teste vermelho**

Run: npm.cmd exec -- tsx --test server/routes/__tests__/eventFinance.test.ts

Expected: falha porque o sinal atual contém status pending, settlementStatus open e settlements vazio.

- [ ] **Step 3: Implementar a baixa canônica**

Importar buildSettlementRecord em events.ts. Dentro de upsertAutomaticEventFinance, quando kind for deposit, calcular:

~~~ts
const financeDate = event.depositDate || event.date;
const amountCents = toCents(amount);
const settlement = buildSettlementRecord({
  amount,
  settledOn: financeDate,
  paymentMethod: event.paymentMethod,
  reason: 'Sinal informado no evento',
  idempotencyKey: 'event-deposit:' + eventId,
}, 'system');
~~~

Usar esse objeto no payload: status paid, settlementStatus settled, settledCents amountCents, settledAt settlement.settledAt e settlements [settlement]. Manter o payload atual de balance e travel. O retorno antecipado por canChangeForecast preserva baixa já existente.

- [ ] **Step 4: Confirmar o teste verde**

Run: npm.cmd exec -- tsx --test server/routes/__tests__/eventFinance.test.ts

Expected: todos os testes do financeiro de eventos passam.

- [ ] **Step 5: Commit da tarefa**

~~~powershell
git add server/routes/events.ts server/routes/__tests__/eventFinance.test.ts
git commit -m "fix: baixar sinal de evento automaticamente"
~~~

## Task 2: Planejador de migração de sinal histórico

**Files:**
- Modify: server/services/financeReconciliation.ts
- Modify: server/services/__tests__/financeReconciliation.test.ts
- Modify: server/services/financeMigration.ts
- Modify: server/services/__tests__/financeMigration.test.ts

**Interfaces:**
- Consumes: finance com kind deposit, automatic true, status pending, settledCents zero, sem settlements e data válida.
- Produces: ação settle_automatic_deposit e plano com baixa migration-v1:<financeId>:automatic-deposit.

- [ ] **Step 1: Escrever o teste de reconciliação que falha**

Passar a reconcileFinances um sinal automático pendente e exigir:

~~~ts
assert.equal(findings[0].action, 'settle_automatic_deposit');
assert.equal(findings[0].proposedChange, 'Registrar o sinal automático como pago na data do lançamento');
~~~

Adicionar um sinal com automatic false e exigir que ele não gere essa ação.

- [ ] **Step 2: Confirmar o teste vermelho**

Run: npm.cmd exec -- tsx --test server/services/__tests__/financeReconciliation.test.ts

Expected: falha porque settle_automatic_deposit não existe.

- [ ] **Step 3: Implementar a detecção**

Adicionar settle_automatic_deposit ao tipo ReconciliationAction e ao texto de impacto. Emitir a ação apenas se kind for deposit, automatic for true, data for válida, settlements estiver ausente ou vazio e settledCents for zero. Não emitir a ação para linhas canceladas, manuais ou que já tenham qualquer baixa.

- [ ] **Step 4: Escrever o teste do plano que falha**

~~~ts
const plan = buildFinanceMigrationPlan({
  id: 'deposit-1', type: 'revenue', amount: 300, amountCents: 30_000,
  date: '2026-06-20', status: 'pending', settlementStatus: 'open',
  kind: 'deposit', automatic: true, settlements: [], settledCents: 0,
}, ['settle_automatic_deposit'], '2026-08-11T12:00:00.000Z');

assert.equal(plan?.update.$set.status, 'paid');
assert.equal(plan?.update.$set.settlementStatus, 'settled');
assert.equal(plan?.update.$set.settledCents, 30_000);
assert.equal(plan?.update.$set.settlements[0].settledOn, '2026-06-20');
assert.equal(plan?.update.$set.settlements[0].idempotencyKey, 'migration-v1:deposit-1:automatic-deposit');
~~~

Exigir filtro que preserve concorrência: _id, kind deposit, automatic true, status pending, settledCents zero e settlements.0 inexistente.

- [ ] **Step 5: Confirmar o teste vermelho**

Run: npm.cmd exec -- tsx --test server/services/__tests__/financeMigration.test.ts

Expected: falha porque o planejador ainda não reconhece a ação.

- [ ] **Step 6: Implementar o plano idempotente**

Estender LegacyFinanceForMigration com kind e automatic. Criar baixa integral na data finance.date, com settledAt igual a migratedAt e reason Migração de sinal automático. Preencher status paid, settlementStatus settled, settledCents e settlements. Não reutilizar a normalização de status legado e não alterar linhas com baixa existente.

- [ ] **Step 7: Confirmar os serviços verdes**

Run: npm.cmd exec -- tsx --test server/services/__tests__/financeReconciliation.test.ts server/services/__tests__/financeMigration.test.ts

Expected: todos os testes desses serviços passam.

- [ ] **Step 8: Commit da tarefa**

~~~powershell
git add server/services/financeReconciliation.ts server/services/__tests__/financeReconciliation.test.ts server/services/financeMigration.ts server/services/__tests__/financeMigration.test.ts
git commit -m "feat: planejar baixa de sinais automáticos"
~~~

## Task 3: Ação global no CLI

**Files:**
- Modify: server/scripts/migrate-finances.ts
- Modify: server/__tests__/reconcile-script.test.ts

**Interfaces:**
- Consumes: --actions=settle_automatic_deposit.
- Produces: prévia e aplicação global somente nas unidades main e franchise.

- [ ] **Step 1: Escrever o teste de CLI que falha**

Exigir a nova ação em MIGRATABLE_ACTIONS, reconhecimento de isAutomaticDepositOnlyMigration, janela global de reconciliação e conjunto de unidades ['main', 'franchise'].

- [ ] **Step 2: Confirmar o teste vermelho**

Run: npm.cmd exec -- tsx --test server/__tests__/reconcile-script.test.ts

Expected: falha porque o CLI contém somente as três ações anteriores.

- [ ] **Step 3: Implementar a seleção global**

Adicionar settle_automatic_deposit em MIGRATABLE_ACTIONS. Criar isAutomaticDepositOnlyMigration. Para essa ação exclusiva, usar período '' até '\uffff', unidades main e franchise e uma consulta de kind deposit, automatic true e não cancelado. Manter consulta por período e todas as unidades nas demais ações.

- [ ] **Step 4: Confirmar o CLI verde**

Run: npm.cmd exec -- tsx --test server/__tests__/reconcile-script.test.ts

Expected: testes de safeguards, status legado e sinal histórico passam.

- [ ] **Step 5: Commit da tarefa**

~~~powershell
git add server/scripts/migrate-finances.ts server/__tests__/reconcile-script.test.ts
git commit -m "feat: migrar sinais automáticos pagos"
~~~

## Task 4: Migrar e validar os dados

**Files:**
- Create: C:\Users\filip\OneDrive\Área de Trabalho\ideias\finance-deposit-migration-rollback-2026-08-11.json (gerado fora do repositório)

**Interfaces:**
- Consumes: a ação exclusiva settle_automatic_deposit e o backup financeiro existente.
- Produces: zero sinais automáticos elegíveis pendentes após aplicação.

- [ ] **Step 1: Executar prévia**

~~~powershell
npm.cmd exec -- tsx server/scripts/migrate-finances.ts --actions=settle_automatic_deposit
~~~

Expected: somente sinais automáticos principais ou de franquia sem baixa.

- [ ] **Step 2: Aplicar com rollback**

~~~powershell
npm.cmd exec -- tsx server/scripts/migrate-finances.ts --actions=settle_automatic_deposit --apply --confirm=APLICAR_MIGRACAO_FINANCEIRA --backup=../finance-status-received-backup-2026-08-09.json --rollback=../finance-deposit-migration-rollback-2026-08-11.json
~~~

Expected: cada candidato recebe exatamente uma baixa.

- [ ] **Step 3: Confirmar zero candidatos**

Run: npm.cmd exec -- tsx server/scripts/migrate-finances.ts --actions=settle_automatic_deposit

Expected: totals.candidates igual a 0.

- [ ] **Step 4: Validar a aplicação**

Run: npm.cmd exec -- tsx --test (Get-ChildItem -Path server,shared -Recurse -File -Filter '*.test.ts' | ForEach-Object FullName); npm.cmd exec -- tsc --noEmit; npm.cmd run build

Expected: testes, tipos e os três builds passam.

- [ ] **Step 5: Commit da documentação**

~~~powershell
git add docs/superpowers/specs/2026-08-11-sinal-evento-pago-design.md docs/superpowers/plans/2026-08-11-sinal-evento-pago.md
git commit -m "docs: registrar sinal de evento pago"
~~~
