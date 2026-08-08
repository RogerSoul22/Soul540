# Ajustes financeiro/eventos (agosto 2026) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corrigir o bug de alteração de status de lançamento financeiro, adicionar data do sinal, excluir fisicamente lançamentos automáticos nunca liquidados de eventos cancelados, e separar o filtro de mês/ano na tela financeira da Fábrica.

**Architecture:** Mudanças pontuais em cima da arquitetura já existente (situação financeira calculada a partir de `settlements[]`, comandos idempotentes de baixa/estorno). Nada de arquitetura nova: item 1 adiciona um comando "mudar status" que internamente vira baixa ou reabertura; item 2 é um campo de data adicional consumido por uma função já existente; item 3 ramifica um `if` já existente em `syncEventFinances`; item 4 é troca de filtro no frontend da Fábrica.

**Tech Stack:** Node/Express + Mongoose (backend), React + Vite (3 frontends), `node:test` (testes), Zod (validação).

**Design de referência:** `docs/superpowers/specs/2026-08-08-ajustes-financeiro-eventos-design.md`

---

## Task 1: Função pura que decide o que uma mudança de status deve fazer

**Files:**
- Modify: `server/services/financeCommands.ts`
- Test: `server/routes/__tests__/finance-commands.test.ts`

**Contexto:** Hoje `PUT /finances/:id` recusa qualquer alteração de `status` (ver `server/routes/finances.ts:503-505`). A API também recalcula `status` a partir de `settlementStatus` em toda leitura (`serializeFinanceEntry`, `server/routes/finances.ts:207-219`), então uma mudança de status só "gruda" se ela também atualizar `settlementStatus`/`settlements`. Esta task cria a função pura que decide qual comando de baixa/reabertura aplicar — sem tocar em banco, só decidindo e testável isoladamente, no mesmo estilo de `buildManualFinancePayload`/`buildSettlementRecord` já existentes neste arquivo.

**Step 1: Escrever os testes que falham**

Adicionar ao final de `server/routes/__tests__/finance-commands.test.ts`:

```ts
import { resolveFinanceStatusChange } from '../../services/financeCommands';

test('turns a pending-to-received status change into a settlement for the full open amount', () => {
  const command = resolveFinanceStatusChange(
    { type: 'revenue', date: '2026-08-01', amount: 100, amountCents: 10_000, settledCents: 0, settlementStatus: 'open' },
    'received',
    { settledOn: '2026-08-05', paymentMethod: 'pix' },
    'user-1',
  );

  assert.equal(command.kind, 'settle');
  if (command.kind === 'settle') {
    assert.equal(command.settlement.amountCents, 10_000);
    assert.equal(command.settlement.settledOn, '2026-08-05');
    assert.equal(command.settlement.paymentMethod, 'pix');
    assert.equal(command.settlement.settledBy, 'user-1');
  }
});

test('falls back to the entry date when no settlement date is given', () => {
  const command = resolveFinanceStatusChange(
    { type: 'cost', date: '2026-08-02', amount: 50, amountCents: 5_000, settledCents: 0, settlementStatus: 'open' },
    'paid',
    {},
    'user-1',
  );

  assert.equal(command.kind, 'settle');
  if (command.kind === 'settle') assert.equal(command.settlement.settledOn, '2026-08-02');
});

test('reopens a fully settled entry back to pending', () => {
  const command = resolveFinanceStatusChange(
    { type: 'revenue', date: '2026-08-01', amount: 100, amountCents: 10_000, settledCents: 10_000, settlementStatus: 'settled' },
    'pending',
    {},
    'user-1',
  );
  assert.deepEqual(command, { kind: 'reopen' });
});

test('is a no-op when the requested status matches the current one', () => {
  const settled = resolveFinanceStatusChange(
    { type: 'revenue', date: '2026-08-01', amount: 100, amountCents: 10_000, settledCents: 10_000, settlementStatus: 'settled' },
    'received',
    {},
    'user-1',
  );
  assert.deepEqual(settled, { kind: 'noop' });

  const open = resolveFinanceStatusChange(
    { type: 'cost', date: '2026-08-01', amount: 100, amountCents: 10_000, settledCents: 0, settlementStatus: 'open' },
    'pending',
    {},
    'user-1',
  );
  assert.deepEqual(open, { kind: 'noop' });
});

test('rejects a status change on a cancelled entry', () => {
  assert.throws(() => resolveFinanceStatusChange(
    { type: 'revenue', date: '2026-08-01', amount: 100, amountCents: 10_000, settledCents: 0, settlementStatus: 'cancelled' },
    'received',
    {},
    'user-1',
  ), /cancelado/);
});
```

**Step 2: Rodar e confirmar que falha**

Run: `npx tsx --test server/routes/__tests__/finance-commands.test.ts`
Expected: FAIL — `resolveFinanceStatusChange` não existe ainda.

**Step 3: Implementar**

Em `server/services/financeCommands.ts`, adicionar o import de `fromCents` e a nova função (pode ficar depois de `buildSettlementRecord`):

```ts
import { toCents, fromCents } from '../../shared/money';
```

(troca a linha `import { toCents } from '../../shared/money';` existente)

```ts
type FinanceStatusChangeCommand =
  | { kind: 'settle'; settlement: FinanceSettlement }
  | { kind: 'reopen' }
  | { kind: 'noop' };

export function resolveFinanceStatusChange(
  entry: {
    type: 'revenue' | 'cost';
    date: string;
    amount: number;
    amountCents?: number;
    settledCents?: number;
    settlementStatus?: string;
    paymentMethod?: string;
  },
  targetStatus: 'pending' | 'paid' | 'received',
  input: { settledOn?: string; paymentMethod?: string; reason?: string },
  settledBy: string,
): FinanceStatusChangeCommand {
  if (entry.settlementStatus === 'cancelled') {
    throw new Error('Não é possível alterar o status de um lançamento cancelado');
  }

  const amountCents = Number.isSafeInteger(entry.amountCents) ? (entry.amountCents as number) : toCents(entry.amount);
  const settledCents = entry.settledCents ?? 0;
  const isCurrentlySettled = amountCents > 0 && settledCents >= amountCents;
  const wantsSettled = targetStatus === 'paid' || targetStatus === 'received';

  if (wantsSettled) {
    if (isCurrentlySettled) return { kind: 'noop' };
    const openCents = amountCents - settledCents;
    const settlement = buildSettlementRecord({
      amount: fromCents(openCents),
      settledOn: input.settledOn || entry.date,
      paymentMethod: input.paymentMethod || entry.paymentMethod,
      reason: input.reason || 'Alteração manual de status',
      idempotencyKey: randomUUID(),
    }, settledBy);
    return { kind: 'settle', settlement };
  }

  if (settledCents === 0) return { kind: 'noop' };
  return { kind: 'reopen' };
}
```

**Step 4: Rodar e confirmar que passa**

Run: `npx tsx --test server/routes/__tests__/finance-commands.test.ts`
Expected: PASS (todos os testes, incluindo os pré-existentes).

**Step 5: Commit**

```bash
git add server/services/financeCommands.ts server/routes/__tests__/finance-commands.test.ts
git commit -m "feat: add resolveFinanceStatusChange to translate status edits into settle/reopen commands"
```

---

## Task 2: Ligar `PUT /finances/:id` ao novo comando

**Files:**
- Modify: `server/routes/finances.ts:492-538` (handler `router.put('/:id', ...)`)

**Contexto:** `commandFields` (linha 503) hoje inclui `'status'` e bloqueia a request inteira com 400 se ele vier no corpo. Vamos tirar `'status'` dessa lista e tratá-lo antes, com sua própria lógica — inclusive para lançamentos `automatic: true` (hoje bloqueados por completo na linha 496-498), já que a mudança de status agora nunca escreve o campo cru, só baixa/reabre via o mecanismo já auditável.

**Step 1: Implementar**

Substituir o handler inteiro (`server/routes/finances.ts:492-538`) por:

```ts
router.put('/:id', validate(updateFinanceSchema), async (req, res) => {
  const found = await findFinanceForRequest(req, req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  const oldDoc = found.doc;

  if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
    const entry = oldDoc.toJSON();
    let command;
    try {
      command = resolveFinanceStatusChange(entry, req.body.status, req.body, getAuthenticatedUserId(req));
    } catch (error: any) {
      return res.status(409).json({ error: error.message });
    }

    if (command.kind === 'settle') {
      const amountCents = getFinanceAmountCents(entry);
      const updated = await (found.model as any).findOneAndUpdate(
        {
          _id: entry._id,
          settlementStatus: { $ne: 'cancelled' },
          'settlements.idempotencyKey': { $ne: command.settlement.idempotencyKey },
        },
        [
          {
            $set: {
              settlements: { $concatArrays: [{ $ifNull: ['$settlements', []] }, [command.settlement]] },
              settledCents: { $add: [{ $ifNull: ['$settledCents', 0] }, command.settlement.amountCents] },
              settledAt: command.settlement.settledAt,
            },
          },
          {
            $set: {
              settlementStatus: { $cond: [{ $gte: ['$settledCents', amountCents] }, 'settled', 'partial'] },
              status: { $cond: [{ $gte: ['$settledCents', amountCents] }, entry.type === 'revenue' ? 'received' : 'paid', 'pending'] },
            },
          },
        ],
        { new: true },
      );
      if (!updated) return res.status(409).json({ error: 'Não foi possível alterar o status; atualize e tente novamente' });
      await logAudit({
        req,
        action: 'update',
        resource: 'finances',
        resourceId: req.params.id,
        description: `Alterou status de "${STATUS_LABELS[entry.status] || entry.status}" para "${STATUS_LABELS[req.body.status] || req.body.status}": ${updated.description}`,
      });
      return res.json(serializeFinanceEntry(updated));
    }

    if (command.kind === 'reopen') {
      const updated = await found.model.findByIdAndUpdate(
        entry._id,
        { $set: { settlementStatus: 'open', settledCents: 0, status: 'pending' }, $unset: { settledAt: 1, settlements: 1 } },
        { new: true },
      );
      await logAudit({
        req,
        action: 'update',
        resource: 'finances',
        resourceId: req.params.id,
        description: `Alterou status de "${STATUS_LABELS[entry.status] || entry.status}" para "Pendente": ${updated?.description}`,
      });
      return res.json(serializeFinanceEntry(updated));
    }
    // command.kind === 'noop': segue para o resto do corpo, se houver outros campos.
  }

  if ((oldDoc as any).automatic) {
    const protectedFields = ['amount', 'type', 'category', 'eventId', 'kind', 'origin'];
    if (protectedFields.some((field) => Object.prototype.hasOwnProperty.call(req.body, field))) {
      return res.status(409).json({ error: 'Lançamentos automáticos devem ser alterados pelo evento ou pedido de origem' });
    }
  }
  const commandFields = ['settlementStatus', 'settledAt', 'settledCents', 'settlements', 'origin', 'kind', 'automatic', 'source', 'eventId', 'reversedAt', 'reversedBy', 'reversalReason', 'autoEventBudget'];
  if (commandFields.some((field) => Object.prototype.hasOwnProperty.call(req.body, field))) {
    return res.status(400).json({ error: 'Use os comandos de liquidar, cancelar ou origem vinculada para alterar a situação financeira' });
  }
  const allowedFields = ['category', 'description', 'amount', 'date', 'dueDate', 'paymentMethod', 'installmentGroupId', 'installmentNumber', 'installmentTotal', 'recurrenceId', 'recurrenceFrequency', 'recurrenceEndDate', 'recurrenceInterval', 'recurrenceTotal'];
  const update = allowedFields.reduce<Record<string, unknown>>((result, field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) result[field] = req.body[field];
    return result;
  }, {});
  if (typeof update.category === 'string') {
    update.classificationStatus = getClassificationStatusForCategory(update.category);
  }
  if (Object.keys(update).length === 0) {
    if (Object.prototype.hasOwnProperty.call(req.body, 'status')) return res.json(serializeFinanceEntry(oldDoc));
    return res.status(400).json({ error: 'Nenhum campo financeiro permitido foi informado' });
  }
  if (Object.prototype.hasOwnProperty.call(update, 'amount')) {
    const settledCents = getSettledCents(oldDoc.toJSON());
    if (settledCents > 0) {
      return res.status(409).json({ error: 'Não altere o valor de um lançamento que já possui baixa' });
    }
    update.amountCents = toCents(update.amount as number);
  }
  const finance = await found.model.findByIdAndUpdate(req.params.id, update, { new: true });
  await logAudit({ req, action: 'update', resource: 'finances', resourceId: req.params.id, description: `Atualizou lançamento: ${finance?.description} (R$ ${finance?.amount})` });
  res.json(finance);
});
```

Adicionar o import de `resolveFinanceStatusChange` junto aos outros imports de `financeCommands` no topo do arquivo (linha 8):

```ts
import { buildBankImportPayload, buildManualFinancePayload, buildSettlementRecord, getClassificationStatusForCategory, resolveFinanceStatusChange } from '../services/financeCommands';
```

Note: a proteção de campos automáticos (`amount`, `type`, `category`, `eventId`, `kind`, `origin`) continua valendo — só a checagem de `automatic` bloqueando *toda* a edição foi removida, porque agora ela só entra em jogo quando algum desses campos específicos vem no corpo.

**Step 2: Verificar manualmente (não há teste de rota HTTP no projeto — ver Task 6 para os testes que existem)**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: sem erros novos relacionados a `server/routes/finances.ts`.

**Step 3: Commit**

```bash
git add server/routes/finances.ts
git commit -m "fix: allow PUT /finances/:id to change status via settle/reopen commands"
```

---

## Task 3: Parar de descartar `status` nos 3 formulários de edição

**Files:**
- Modify: `src/frontend/pages/Financeiro/Financeiro.tsx:1032`
- Modify: `franchise/src/pages/Financeiro/Financeiro.tsx:713`
- Modify: `factory/src/pages/Financeiro/Financeiro/Financeiro.tsx:657`

**Contexto:** As três telas têm a mesma linha, que descarta `status` do payload de edição antes de chamar `updateFinance`. Como o backend (Task 2) agora sabe tratar `status` corretamente, é só parar de removê-lo — `eventId` continua sendo removido (não é editável por esse formulário).

**Step 1: Editar os três arquivos**

Em cada um dos três arquivos, trocar:

```ts
const { eventId: _eventId, status: _status, ...editableBase } = base;
await updateFinance(editingId, editableBase); // (ou editingFinanceId, nome varia por arquivo)
```

por:

```ts
const { eventId: _eventId, ...editableBase } = base;
await updateFinance(editingId, editableBase);
```

(usar o nome exato da variável de id de edição já existente em cada arquivo — `editingFinanceId` em `src/frontend` e `franchise/src`, `editingId` em `factory/src`.)

**Step 2: Testar manualmente no navegador**

Run: `npm run dev:all` (na raiz do projeto — sobe Matriz + API)
1. Abrir Financeiro, editar um lançamento pendente, mudar o status para "Recebido"/"Pago" e salvar.
2. Confirmar que a lista mostra o novo status sem precisar recarregar a página.
3. Editar de novo e voltar para "Pendente"; confirmar que reabre.
Repetir para `franchise` (`npm run dev --prefix franchise` + servidor da API já rodando) e `factory` (`npm run dev --prefix factory`).

**Step 3: Commit**

```bash
git add src/frontend/pages/Financeiro/Financeiro.tsx franchise/src/pages/Financeiro/Financeiro.tsx factory/src/pages/Financeiro/Financeiro/Financeiro.tsx
git commit -m "fix: stop discarding status field when editing a finance entry"
```

---

## Task 4: Campo `depositDate` no evento

**Files:**
- Modify: `shared/types.ts:8-65` (interface `PizzaEvent`)
- Modify: `server/routes/events.ts` (3 schemas Mongoose + `upsertAutomaticEventFinance` + `protectedFinancialFields`)
- Test: `server/routes/__tests__/eventFinance.test.ts`

**Step 1: Escrever o teste que falha**

Adicionar a `server/routes/__tests__/eventFinance.test.ts`:

```ts
test('uses the deposit date field as the deposit finance entry date when set', async () => {
  const created: any[] = [];
  const financeModel = {
    findOne: async () => null,
    create: async (payload: any) => { created.push(payload); return payload; },
    find: () => ({ sort: async () => [] }),
  };
  const event = {
    _id: 'event-3',
    id: 'event-3',
    name: 'Evento com data de sinal',
    date: '2026-07-10',
    depositDate: '2026-06-20',
    budget: 1_000,
    depositValue: 300,
    constructor: { findByIdAndUpdate: async () => undefined },
  };

  await syncEventFinances(event, financeModel as any, 'main');

  const deposit = created.find((entry) => entry.kind === 'deposit');
  assert.equal(deposit.date, '2026-06-20');
});

test('falls back to the event date when no deposit date is set', async () => {
  const created: any[] = [];
  const financeModel = {
    findOne: async () => null,
    create: async (payload: any) => { created.push(payload); return payload; },
    find: () => ({ sort: async () => [] }),
  };
  const event = {
    _id: 'event-4',
    id: 'event-4',
    name: 'Evento sem data de sinal',
    date: '2026-07-10',
    budget: 1_000,
    depositValue: 300,
    constructor: { findByIdAndUpdate: async () => undefined },
  };

  await syncEventFinances(event, financeModel as any, 'main');

  const deposit = created.find((entry) => entry.kind === 'deposit');
  assert.equal(deposit.date, '2026-07-10');
});
```

**Step 2: Rodar e confirmar que falha**

Run: `npm run test:finance`
Expected: FAIL — os dois lançamentos de sinal usam `event.date` ('2026-07-10') mesmo quando `depositDate` está definido.

**Step 3: Implementar**

Em `server/routes/events.ts`, dentro de `upsertAutomaticEventFinance` (por volta da linha 261-272), trocar:

```ts
  const isDeposit = kind === 'deposit';
  const isTravel = kind === 'travel';
  const amountChanged = !!existing && Math.abs(Number(existing.amount || 0) - amount) > 0.005;
  const payload = {
    eventId,
    type: isTravel ? 'cost' : 'revenue',
    category: isDeposit ? 'sinal-evento' : isTravel ? 'deslocamento-evento' : 'contrato',
    description: `${isDeposit ? 'Sinal' : isTravel ? 'Deslocamento' : 'Saldo'} - ${event.name}`,
    amount,
    amountCents: toCents(amount),
    date: event.date,
```

por:

```ts
  const isDeposit = kind === 'deposit';
  const isTravel = kind === 'travel';
  const amountChanged = !!existing && Math.abs(Number(existing.amount || 0) - amount) > 0.005;
  const payload = {
    eventId,
    type: isTravel ? 'cost' : 'revenue',
    category: isDeposit ? 'sinal-evento' : isTravel ? 'deslocamento-evento' : 'contrato',
    description: `${isDeposit ? 'Sinal' : isTravel ? 'Deslocamento' : 'Saldo'} - ${event.name}`,
    amount,
    amountCents: toCents(amount),
    date: isDeposit && event.depositDate ? event.depositDate : event.date,
```

Adicionar `depositDate: String,` logo depois de cada `depositValue: Number,` nos três schemas Mongoose (`server/routes/events.ts:51`, `:108`, `:165`).

Adicionar `'depositDate'` a `protectedFinancialFields` (`server/routes/events.ts:510`):

```ts
  const protectedFinancialFields = ['budget', 'finalValue', 'depositValue', 'depositDate', 'travelCost', 'paymentMethod', 'pixKey'];
```

Em `shared/types.ts`, dentro da interface `PizzaEvent`, adicionar logo depois de `depositValue?: number;` (linha 50):

```ts
  depositValue?: number;
  depositDate?: string;
```

**Step 4: Rodar e confirmar que passa**

Run: `npm run test:finance`
Expected: PASS (incluindo os testes pré-existentes).

**Step 5: Commit**

```bash
git add shared/types.ts server/routes/events.ts server/routes/__tests__/eventFinance.test.ts
git commit -m "feat: add depositDate field used as the automatic deposit entry date"
```

---

## Task 5: Input "Data do sinal" no formulário de evento

**Files:**
- Modify: `src/frontend/pages/Eventos/Eventos.tsx`
- Modify: `franchise/src/pages/Eventos/Eventos.tsx`

**Contexto:** Os dois arquivos têm a mesma estrutura (`FormData`, `emptyForm`, `openEdit`, payload de submit, JSX do formulário). Fazer a mesma mudança nos dois.

**Step 1: Implementar em cada arquivo**

1. No `type FormData`, adicionar `depositDate: string;` logo após `depositValue: string;` (perto da linha 87).
2. No `emptyForm`, adicionar `depositDate: '',` logo após `depositValue: '',` (perto da linha 131).
3. Em `openEdit` (função que popula o form ao editar, perto da linha 375), adicionar `depositDate: ev.depositDate || '',` logo após a linha de `depositValue`.
4. No payload de submit (perto da linha 491), adicionar `depositDate: form.depositDate || undefined,` logo após a linha de `depositValue`.
5. No JSX do formulário (perto da linha 861-864, bloco `formGrid2` com "Sinal Recebido"), adicionar um campo de data ao lado:

```tsx
<div className={styles.formGrid2}>
  <div className={styles.formGroup}>
    <label className={styles.label}>Sinal Recebido (R$)</label>
    <input className={styles.input} value={form.depositValue} onChange={(e) => setForm({ ...form, depositValue: formatBudget(e.target.value) })} placeholder="R$ 0,00" />
  </div>
  <div className={styles.formGroup}>
    <label className={styles.label}>Data do Sinal</label>
    <input type="date" className={styles.input} value={form.depositDate} onChange={(e) => setForm({ ...form, depositDate: e.target.value })} />
  </div>
</div>
```

(isso substitui o `formGrid2` que hoje tem só "Valor Final" + "Sinal Recebido" — ajustar o grid para 3 campos ou criar uma nova linha `formGrid2`/`formGrid3` conforme o CSS já disponível no arquivo `.module.scss`; verificar se existe uma classe `formGrid3` antes de usar, senão manter em duas linhas de `formGrid2`.)

**Step 2: Testar manualmente**

Run: `npm run dev:all`
1. Criar/editar um evento, preencher "Data do Sinal", salvar.
2. Conferir na tela Financeiro que o lançamento de sinal desse evento aparece com a data informada, não a data do evento.
Repetir em `franchise` (`npm run dev --prefix franchise`).

**Step 3: Commit**

```bash
git add src/frontend/pages/Eventos/Eventos.tsx franchise/src/pages/Eventos/Eventos.tsx
git commit -m "feat: add deposit date input to the event form"
```

---

## Task 6: Excluir fisicamente lançamentos automáticos nunca liquidados de evento cancelado

**Files:**
- Modify: `server/routes/events.ts:302-311` (`syncEventFinances`)
- Modify: `server/routes/__tests__/eventFinance.test.ts` (reescrever o teste `'cancels automatic finances when an event is cancelled'`)

**Contexto:** Hoje, ao cancelar um evento, `syncEventFinances` marca **todos** os lançamentos automáticos vinculados como `cancelled` via um único `updateMany`. A partir de agora: lançamentos que nunca tiveram baixa real (`settledCents` efetivo igual a 0) são apagados de verdade; os que já têm baixa continuam apenas marcados como `cancelled`, preservando a trava de decisão (`cancellationRequiresDecision`) que já impede cancelar um evento com dinheiro recebido sem registrar reembolso/multa/ajuste antes.

**Step 1: Reescrever o teste existente para refletir o novo comportamento**

Substituir o teste `'cancels automatic finances when an event is cancelled'` (linhas 71-100 de `server/routes/__tests__/eventFinance.test.ts`) por dois testes:

```ts
test('deletes never-settled automatic finances when an event is cancelled', async () => {
  const deletedQueries: unknown[] = [];
  const updatedQueries: Array<{ query: unknown; update: unknown }> = [];
  const openEntries = [
    { _id: 'f-1', eventId: 'event-2', automatic: true, settlements: [], settledCents: 0 },
  ];
  const financeModel = {
    find: (query: unknown) => ({ ...openEntries, __query: query, lean: async () => openEntries }),
    deleteMany: async (query: unknown) => { deletedQueries.push(query); },
    updateMany: async (query: unknown, update: unknown) => { updatedQueries.push({ query, update }); },
    findOne: async () => null,
    create: async () => undefined,
  };

  await syncEventFinances({
    _id: 'event-2',
    id: 'event-2',
    status: 'cancelled',
    constructor: { findByIdAndUpdate: async () => undefined },
  }, financeModel as any, 'main');

  assert.equal(deletedQueries.length, 1);
  assert.deepEqual(deletedQueries[0], { _id: { $in: ['f-1'] } });
});

test('keeps already-settled automatic finances marked as cancelled instead of deleting them', async () => {
  const deletedQueries: unknown[] = [];
  const updatedQueries: Array<{ query: unknown; update: unknown }> = [];
  const settledEntries = [
    { _id: 'f-2', eventId: 'event-2', automatic: true, settlements: [{ id: 's-1', amountCents: 5_000 }], settledCents: 5_000 },
  ];
  const financeModel = {
    find: () => ({ lean: async () => settledEntries }),
    deleteMany: async (query: unknown) => { deletedQueries.push(query); },
    updateMany: async (query: unknown, update: unknown) => { updatedQueries.push({ query, update }); },
    findOne: async () => null,
    create: async () => undefined,
  };

  await syncEventFinances({
    _id: 'event-2',
    id: 'event-2',
    status: 'cancelled',
    constructor: { findByIdAndUpdate: async () => undefined },
  }, financeModel as any, 'main');

  assert.equal(deletedQueries.length, 0);
  assert.equal(updatedQueries.length, 1);
  assert.deepEqual(updatedQueries[0].query, { _id: { $in: ['f-2'] } });
  assert.deepEqual(updatedQueries[0].update, {
    $set: { settlementStatus: 'cancelled', reversalReason: 'Evento cancelado' },
  });
});
```

**Step 2: Rodar e confirmar que falha**

Run: `npm run test:finance`
Expected: FAIL — `syncEventFinances` ainda chama um único `updateMany` para tudo; `financeModel.find`/`deleteMany` do jeito que o teste espera não são chamados assim.

**Step 3: Implementar**

Em `server/routes/events.ts`, trocar o branch de cancelamento dentro de `syncEventFinances` (linhas 304-310):

```ts
  if (event.status === 'cancelled') {
    const eventId = event.id || event._id.toString();
    await FinanceModel.updateMany(
      { eventId, $or: [{ automatic: true }, { autoEventBudget: true }] },
      { $set: { settlementStatus: 'cancelled', reversalReason: 'Evento cancelado' } },
    );
    return;
  }
```

por:

```ts
  if (event.status === 'cancelled') {
    const eventId = event.id || event._id.toString();
    const linkedEntries = await FinanceModel.find({ eventId, $or: [{ automatic: true }, { autoEventBudget: true }] }).lean();
    const neverSettledIds = linkedEntries.filter((entry: any) => !(entry.settledCents > 0)).map((entry: any) => entry._id);
    const settledIds = linkedEntries.filter((entry: any) => entry.settledCents > 0).map((entry: any) => entry._id);
    if (neverSettledIds.length > 0) {
      await FinanceModel.deleteMany({ _id: { $in: neverSettledIds } });
    }
    if (settledIds.length > 0) {
      await FinanceModel.updateMany(
        { _id: { $in: settledIds } },
        { $set: { settlementStatus: 'cancelled', reversalReason: 'Evento cancelado' } },
      );
    }
    return;
  }
```

**Step 4: Rodar e confirmar que passa**

Run: `npm run test:finance`
Expected: PASS.

**Step 5: Commit**

```bash
git add server/routes/events.ts server/routes/__tests__/eventFinance.test.ts
git commit -m "feat: hard-delete never-settled automatic finances when an event is cancelled"
```

---

## Task 7: Filtro de mês e ano separados na Fábrica + remover arquivo duplicado

**Files:**
- Modify: `factory/src/pages/Financeiro/Financeiro/Financeiro.tsx` (arquivo ativo, importado em `factory/src/App.tsx:15`)
- Delete: `factory/src/pages/Financeiro/Financeiro.tsx` e `factory/src/pages/Financeiro/Financeiro.module.scss` (não importados em lugar nenhum — confirmado por busca em `factory/src`)

**Step 1: Remover o arquivo órfão**

```bash
git rm "factory/src/pages/Financeiro/Financeiro.tsx" "factory/src/pages/Financeiro/Financeiro.module.scss"
```

**Step 2: Trocar os filtros de período por Mês + Ano**

Em `factory/src/pages/Financeiro/Financeiro/Financeiro.tsx`:

1. Substituir os estados `pageMonth`/`filterMonth` (linhas 133 e 137) por pares mês+ano:

```ts
const [pageMonthPart, setPageMonthPart] = useState<string>('all');
const [pageYearPart, setPageYearPart] = useState<string>('all');
// ...
const [filterMonthPart, setFilterMonthPart] = useState<string>('all');
const [filterYearPart, setFilterYearPart] = useState<string>('all');
```

2. Adicionar, perto de `availableMonths` (depois da linha 365), a lista de anos disponíveis:

```ts
const availableYears = useMemo(() => {
  const set = new Set<string>();
  for (const f of finances) if (f.date) set.add(f.date.substring(0, 4));
  return [...set].sort((a, b) => b.localeCompare(a));
}, [finances]);
```

3. Trocar `pageMonthFinances` (linha 314-316) para filtrar por mês e ano combinados:

```ts
const pageMonthFinances = useMemo(
  () => finances.filter((f) => {
    if (!f.date) return false;
    if (pageYearPart !== 'all' && !f.date.startsWith(pageYearPart)) return false;
    if (pageMonthPart !== 'all' && f.date.slice(5, 7) !== pageMonthPart) return false;
    return true;
  }),
  [finances, pageMonthPart, pageYearPart],
);
```

4. Trocar o predicado de `filtered` (linha 446) de:

```ts
      } else if (filterMonth !== 'all' && !f.date.startsWith(filterMonth)) {
        return false;
      }
```

para:

```ts
      } else {
        if (filterYearPart !== 'all' && !f.date.startsWith(filterYearPart)) return false;
        if (filterMonthPart !== 'all' && f.date.slice(5, 7) !== filterMonthPart) return false;
      }
```

E ajustar as dependências do `useMemo` de `filtered` (linha 461) trocando `filterMonth` por `filterMonthPart, filterYearPart`.

5. Trocar o JSX do filtro rápido do topo (linhas 749-766):

```tsx
{['geral', 'despesas'].includes(activeTab) && (availableMonths.length > 0) && (
  <div className={styles.pageMonthFilter}>
    <div className={styles.pageMonthField}>
      <label className={styles.pageMonthLabel}>Mês</label>
      <select className={styles.pageMonthSelect} value={pageMonthPart} onChange={(e) => setPageMonthPart(e.target.value)}>
        <option value="all">Todos os meses</option>
        {MONTHS_PT.map((label, index) => (
          <option key={label} value={String(index + 1).padStart(2, '0')}>{label}</option>
        ))}
      </select>
    </div>
    <div className={styles.pageMonthField}>
      <label className={styles.pageMonthLabel}>Ano</label>
      <select className={styles.pageMonthSelect} value={pageYearPart} onChange={(e) => setPageYearPart(e.target.value)}>
        <option value="all">Todos os anos</option>
        {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
    {(pageMonthPart !== 'all' || pageYearPart !== 'all') && (
      <button className={styles.pageMonthClear} onClick={() => { setPageMonthPart('all'); setPageYearPart('all'); }}>
        Limpar
      </button>
    )}
  </div>
)}
```

6. Trocar o `<select>` único de mês no filtro da lista (linhas 1132-1142) por dois selects:

```tsx
{!useCustomRange ? (
  <>
    <select className={styles.searchInput} value={filterMonthPart} onChange={(e) => setFilterMonthPart(e.target.value)}>
      <option value="all">Todos os meses</option>
      {MONTHS_PT.map((label, index) => (
        <option key={label} value={String(index + 1).padStart(2, '0')}>{label}</option>
      ))}
    </select>
    <select className={styles.searchInput} value={filterYearPart} onChange={(e) => setFilterYearPart(e.target.value)}>
      <option value="all">Todos os anos</option>
      {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
    </select>
  </>
) : (
```

7. `MONTHS_PT` (linha 114) já existe no arquivo com nomes abreviados (`'Jan'`, `'Fev'`, ...) — reaproveitar direto, sem criar uma segunda constante.

8. `formatMonth`/`availableMonths` continuam existindo e sendo usados em outros pontos do arquivo (resumo mensal, exportação, dashboard por mês) — não mexer neles, essa mudança é só nos dois filtros indicados.

**Step 3: Testar manualmente**

Run: `npm run dev --prefix factory` (com o backend rodando via `npm run server` na raiz)
1. Abrir Financeiro da Fábrica.
2. Confirmar que o filtro do topo agora mostra "Mês" e "Ano" separados, e que combinar os dois filtra corretamente.
3. Confirmar que o filtro da lista de lançamentos também tem os dois seletores, e que o modo "Período" (intervalo de datas) continua funcionando sem regressão.
4. Confirmar que a tela carrega sem erros (o import removido no App.tsx não quebrou nada, já que ele já apontava para o arquivo aninhado).

**Step 4: Commit**

```bash
git add factory/src/pages/Financeiro/Financeiro/Financeiro.tsx
git commit -m "feat: split Fábrica finance period filter into separate month and year selectors"
```

(o `git rm` do Step 1 já ficou staged; incluir junto neste commit ou em um commit separado "chore: remove orphaned duplicate Fábrica finance screen" — preferir separado, para deixar claro no histórico que é uma remoção de código morto, não parte da feature.)

---

## Task 8: Verificação final

**Step 1: Rodar toda a suíte de testes de node:test do backend/shared que já existe no repositório**

Run:
```bash
npx tsx --test server/routes/__tests__/*.test.ts server/middleware/__tests__/*.test.ts server/services/__tests__/*.test.ts shared/__tests__/*.test.ts server/__tests__/*.test.ts
```
Expected: todos os testes passam, incluindo os novos das Tasks 1, 4 e 6.

**Step 2: Checar tipos**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: sem erros novos introduzidos por este plano (o projeto pode já ter avisos pré-existentes de outras frentes em andamento — comparar antes/depois se necessário).

**Step 3: Smoke test manual dos 4 itens**, com `npm run dev:all` + `npm run dev --prefix franchise` + `npm run dev --prefix factory` rodando:
1. Editar um lançamento pendente → marcar recebido/pago → reabrir. Fazer isso na Matriz, Franquia e Fábrica.
2. Criar um evento com "Data do Sinal" preenchida e conferir a data do lançamento de sinal.
3. Cancelar um evento sem baixa nenhuma → conferir que o(s) lançamento(s) automático(s) somem da lista (não aparecem nem como cancelados). Cancelar um evento com sinal já recebido → conferir que continua pedindo a decisão de reembolso/multa/ajuste, e que o lançamento correspondente continua na lista marcado como cancelado.
4. Na Fábrica, usar os filtros de Mês e Ano separadamente e combinados.

Não fazer nenhum commit nesta task — é só verificação.
