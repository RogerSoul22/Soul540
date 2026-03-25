# Chat com IA (Ollama) — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an AI chat page to the main system that lets users query and write data (events, tasks, finances, employees, contractors) using natural language, powered by a local Ollama LLM running in Docker.

**Architecture:** Frontend sends messages to `POST /api/chat`; the server builds a structured prompt, calls Ollama once to get a JSON action, executes that action against MongoDB, then calls Ollama again to format a human-readable response in Portuguese.

**Tech Stack:** Express (server), Ollama REST API (llama3.2:3b), React + SCSS Modules (Chat page), docker-compose for Ollama service.

---

## Task 1: Add Ollama to docker-compose.yml

**Files:**
- Modify: `docker-compose.yml`

**Step 1: Open docker-compose.yml and add the ollama service**

```yaml
  ollama:
    image: ollama/ollama
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped
    networks:
      - soul540
```

Also add `ollama_data` to the `volumes` section at the bottom (create it if it doesn't exist):

```yaml
volumes:
  ollama_data:
```

And add `depends_on: [ollama]` to the `api` service so the API waits for Ollama to be up.

**Step 2: Add model pull to Dockerfile.api**

At the end of `Dockerfile.api`, add a comment noting that on first startup the model must be pulled. The actual pull will happen via an init script (see Task 2).

**Step 3: Verify docker-compose.yml is valid**

```bash
docker compose config
```
Expected: no errors, shows 3 services: api, web, ollama.

---

## Task 2: Create Ollama init script

**Files:**
- Create: `server/scripts/pull-ollama-model.sh`

**Step 1: Create the script**

```bash
#!/bin/sh
# Waits for Ollama to be ready then pulls the model if not already present
until curl -sf http://ollama:11434/api/tags > /dev/null; do
  echo "Waiting for Ollama..."
  sleep 2
done

MODEL="llama3.2:3b"
if curl -sf http://ollama:11434/api/tags | grep -q "$MODEL"; then
  echo "Model $MODEL already present"
else
  echo "Pulling $MODEL..."
  curl -X POST http://ollama:11434/api/pull -d "{\"name\":\"$MODEL\"}"
fi
```

**Step 2: Update Dockerfile.api to run this script on startup**

In `Dockerfile.api`, change the CMD to run the pull script in the background then start the server:

```dockerfile
CMD sh server/scripts/pull-ollama-model.sh &\
    tsx server/index.ts
```

---

## Task 3: Create `server/routes/chat.ts`

**Files:**
- Create: `server/routes/chat.ts`

This is the core of Approach B. The route:
1. Receives `{ message, history }` from the client
2. Builds a system prompt with available actions
3. Calls Ollama → gets JSON `{ action, params }`
4. Executes the action (reads/writes MongoDB)
5. Calls Ollama again with the result → gets a human-readable reply
6. Returns `{ reply }` to client

**Step 1: Create `server/routes/chat.ts`**

```typescript
import { Router } from 'express';
import { Event, FranchiseEvent } from './events';
import { Finance } from './finances';
import { Task } from './tasks';
import { Employee } from './employees';
import { Contractor } from './contractors';

const router = Router();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

const SYSTEM_PROMPT = `Você é um assistente do sistema Soul540, um sistema de gestão de eventos e franquias.
Você tem acesso às seguintes ações para consultar e modificar dados:

AÇÕES DISPONÍVEIS (responda SOMENTE com JSON válido, sem texto extra):

1. query_events - Consultar eventos
   { "action": "query_events", "params": { "status": "upcoming|completed|cancelled|all", "limit": 10 } }

2. query_tasks - Consultar tarefas
   { "action": "query_tasks", "params": { "status": "todo|in_progress|done|all", "priority": "urgent|high|medium|low|all" } }

3. query_finances - Consultar lançamentos financeiros
   { "action": "query_finances", "params": { "type": "revenue|cost|all", "limit": 10 } }

4. query_employees - Consultar funcionários
   { "action": "query_employees", "params": { "status": "active|inactive|all" } }

5. query_contractors - Consultar contratantes
   { "action": "query_contractors", "params": { "status": "active|inactive|all" } }

6. create_finance - Criar lançamento financeiro
   { "action": "create_finance", "params": { "type": "revenue|cost", "category": "string", "description": "string", "amount": number, "date": "YYYY-MM-DD", "status": "pending|paid|received" } }

7. create_task - Criar tarefa
   { "action": "create_task", "params": { "title": "string", "description": "string", "status": "todo", "priority": "urgent|high|medium|low", "dueDate": "YYYY-MM-DD" } }

8. unknown - Perguntas gerais sem necessidade de dados
   { "action": "unknown", "params": { "reply": "sua resposta direta aqui" } }

REGRAS:
- Responda SEMPRE com JSON válido e nada mais
- Use "unknown" para perguntas que não precisam de dados do sistema
- Para datas use o formato YYYY-MM-DD
- Data de hoje: ${new Date().toISOString().split('T')[0]}
`;

async function callOllama(messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages, stream: false }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json() as any;
  return data.message?.content || '';
}

async function executeAction(action: string, params: any): Promise<any> {
  switch (action) {
    case 'query_events': {
      const filter: any = {};
      if (params.status && params.status !== 'all') filter.status = params.status;
      const events = await Event.find(filter).limit(params.limit || 10).lean();
      const fEvents = await FranchiseEvent.find(filter).limit(params.limit || 10).lean();
      return [...events, ...fEvents];
    }
    case 'query_tasks': {
      const filter: any = {};
      if (params.status && params.status !== 'all') filter.status = params.status;
      if (params.priority && params.priority !== 'all') filter.priority = params.priority;
      return await Task.find(filter).limit(20).lean();
    }
    case 'query_finances': {
      const filter: any = {};
      if (params.type && params.type !== 'all') filter.type = params.type;
      return await Finance.find(filter).sort({ date: -1 }).limit(params.limit || 10).lean();
    }
    case 'query_employees': {
      const filter: any = {};
      if (params.status && params.status !== 'all') filter.status = params.status;
      return await Employee.find(filter).limit(20).lean();
    }
    case 'query_contractors': {
      const filter: any = {};
      if (params.status && params.status !== 'all') filter.status = params.status;
      return await Contractor.find(filter).limit(20).lean();
    }
    case 'create_finance': {
      const finance = await Finance.create({ ...params, source: 'main' });
      return finance.toJSON();
    }
    case 'create_task': {
      const task = await Task.create(params);
      return task.toJSON();
    }
    default:
      return null;
  }
}

router.post('/', async (req: any, res: any) => {
  try {
    const { message, history = [] } = req.body as { message: string; history: { role: string; content: string }[] };

    // Step 1: Get structured action from LLM
    const actionMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6), // last 3 exchanges for context
      { role: 'user', content: message },
    ];

    const rawAction = await callOllama(actionMessages);

    let parsed: { action: string; params: any };
    try {
      // Extract JSON from response (model may wrap it in markdown)
      const jsonMatch = rawAction.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawAction);
    } catch {
      // If parsing fails, treat as unknown
      parsed = { action: 'unknown', params: { reply: rawAction } };
    }

    // Step 2: If action is "unknown", return direct reply
    if (parsed.action === 'unknown') {
      return res.json({ reply: parsed.params.reply || rawAction, action: 'unknown' });
    }

    // Step 3: Execute the action
    const result = await executeAction(parsed.action, parsed.params);

    // Step 4: Format the result in Portuguese
    const formatMessages = [
      {
        role: 'system',
        content: 'Você é um assistente amigável do Soul540. Responda em português brasileiro de forma clara e concisa. Formate listas com bullet points quando apropriado.',
      },
      { role: 'user', content: message },
      {
        role: 'assistant',
        content: `Consultei o sistema e encontrei os seguintes dados: ${JSON.stringify(result, null, 2)}`,
      },
      {
        role: 'user',
        content: 'Com base nesses dados, responda minha pergunta original de forma clara e amigável.',
      },
    ];

    const reply = await callOllama(formatMessages);

    res.json({ reply, action: parsed.action });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ reply: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.' });
  }
});

export default router;
```

**Step 2: Verify TypeScript compiles**

```bash
cd "c:/Users/filip/OneDrive/Área de Trabalho/ideias/Soul540"
npx tsc --noEmit
```
Expected: no errors related to chat.ts

---

## Task 4: Register chat route in `server/app.ts`

**Files:**
- Modify: `server/app.ts`

**Step 1: Add import**

After the last import (invoicesRouter), add:
```typescript
import chatRouter from './routes/chat';
```

**Step 2: Add route**

After `app.use('/api/invoices', invoicesRouter);`, add:
```typescript
app.use('/api/chat', chatRouter);
```

**Step 3: Verify server starts without errors**

```bash
cd "c:/Users/filip/OneDrive/Área de Trabalho/ideias/Soul540"
npx tsc --noEmit
```

---

## Task 5: Create `Chat.tsx` page

**Files:**
- Create: `src/frontend/pages/Chat/Chat.tsx`

**Step 1: Create the component**

```tsx
import { useState, useRef, useEffect, type FormEvent } from 'react';
import styles from './Chat.module.scss';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Sou o assistente do Soul540. Posso consultar eventos, tarefas, finanças, funcionários e contratantes, além de criar lançamentos e tarefas. Como posso ajudar?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('soul540_token');
      const history = newMessages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-System': 'main',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json() as { reply: string };
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao conectar com o assistente. Verifique se o serviço está ativo.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.avatar}>IA</div>
          <div>
            <h2 className={styles.title}>Assistente Soul540</h2>
            <span className={styles.subtitle}>Powered by Ollama · llama3.2:3b</span>
          </div>
        </div>
      </div>

      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} className={`${styles.bubble} ${styles[msg.role]}`}>
            {msg.role === 'assistant' && <div className={styles.bubbleAvatar}>IA</div>}
            <div className={styles.bubbleContent}>
              {msg.content.split('\n').map((line, j) => (
                <span key={j}>{line}{j < msg.content.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className={`${styles.bubble} ${styles.assistant}`}>
            <div className={styles.bubbleAvatar}>IA</div>
            <div className={styles.bubbleContent}>
              <span className={styles.typing}><span /><span /><span /></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className={styles.inputBar} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Pergunte algo sobre o sistema..."
          disabled={loading}
          autoFocus
        />
        <button className={styles.sendBtn} type="submit" disabled={loading || !input.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
}
```

---

## Task 6: Create `Chat.module.scss`

**Files:**
- Create: `src/frontend/pages/Chat/Chat.module.scss`

**Step 1: Create the stylesheet**

```scss
$accent: #f59e0b;
$bg: #0a0a0f;
$surface: #13131a;
$surface2: #1a1a24;
$border: rgba(255, 255, 255, 0.06);
$text: #e2e8f0;
$muted: #64748b;

.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: $bg;
  border-radius: 12px;
  overflow: hidden;
}

.header {
  padding: 20px 24px;
  border-bottom: 1px solid $border;
  background: $surface;
}

.headerInfo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, $accent, darken($accent, 15%));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #000;
  flex-shrink: 0;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: $text;
  margin: 0;
}

.subtitle {
  font-size: 12px;
  color: $muted;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
  }
}

.bubble {
  display: flex;
  gap: 10px;
  max-width: 80%;

  &.user {
    align-self: flex-end;
    flex-direction: row-reverse;

    .bubbleContent {
      background: $accent;
      color: #000;
      border-radius: 18px 18px 4px 18px;
    }
  }

  &.assistant {
    align-self: flex-start;

    .bubbleContent {
      background: $surface2;
      color: $text;
      border-radius: 18px 18px 18px 4px;
      border: 1px solid $border;
    }
  }
}

.bubbleAvatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, $accent, darken($accent, 15%));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #000;
  flex-shrink: 0;
  margin-top: 4px;
}

.bubbleContent {
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.typing {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 20px;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $muted;
    animation: bounce 1.2s infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

.inputBar {
  display: flex;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid $border;
  background: $surface;
}

.input {
  flex: 1;
  background: $surface2;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  color: $text;
  outline: none;
  transition: border-color 0.2s;

  &::placeholder { color: $muted; }

  &:focus {
    border-color: rgba($accent, 0.5);
  }

  &:disabled {
    opacity: 0.5;
  }
}

.sendBtn {
  background: $accent;
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
```

---

## Task 7: Verify and rebuild Docker

**Step 1: Check TypeScript compiles cleanly**

```bash
cd "c:/Users/filip/OneDrive/Área de Trabalho/ideias/Soul540"
npx tsc --noEmit
```

**Step 2: Rebuild Docker containers**

```bash
docker compose down && docker compose up --build -d
```

**Step 3: Wait for Ollama model pull (first time only)**

```bash
docker compose logs ollama -f
```
Watch until model pull completes (~2-3 minutes on first run).

**Step 4: Test chat endpoint**

```bash
curl -X POST http://localhost/api/chat \
  -H "Content-Type: application/json" \
  -H "X-System: main" \
  -d '{"message":"quantos eventos temos?"}'
```
Expected: `{ "reply": "..." }` with a human-readable response.

**Step 5: Open browser**

Navigate to `http://localhost/chat` (after logging in) and test a few messages:
- "Quantos eventos temos cadastrados?"
- "Liste as tarefas urgentes"
- "Criar um lançamento de despesa de R$ 500 para material de escritório"

---

## Notes

- **First Docker startup**: Ollama downloads the model (~2GB). Subsequent startups are instant.
- **VPS requirements**: At least 4GB RAM for llama3.2:3b. If constrained, use `qwen2.5:0.5b` instead (~400MB).
- **OLLAMA_MODEL env var**: Can be overridden in `.env` to switch models without code changes.
- **Chat history**: Stored in React state only (resets on page reload). For persistence, add localStorage saving of messages array.
- **Rate limiting**: No rate limiting added (VPS is internal use). Add if needed.
