import { Router } from 'express';
import { Event, FranchiseEvent } from './events';
import { Finance } from './finances';
import { Task } from './tasks';
import { Employee } from './employees';
import { Contractor } from './contractors';

const router = Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

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
   { "action": "create_finance", "params": { "type": "revenue|cost", "category": "string", "description": "string", "amount": number, "date": "YYYY-MM-DD", "status": "paid|received" } }
   IMPORTANTE: para type "cost" use status "paid", para type "revenue" use status "received". NUNCA use "pending".

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

async function callGroq(messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.1 }),
  });
  if (!res.ok) throw new Error(`Groq error: ${res.status}`);
  const data = await res.json() as any;
  return data.choices?.[0]?.message?.content || '';
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
      const defaultStatus = params.type === 'revenue' ? 'received' : 'paid';
      const finance = await Finance.create({ ...params, source: 'main', status: params.status || defaultStatus });
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
    console.log('[Chat] message:', message);

    // Step 1: Get structured action from LLM
    const actionMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6),
      { role: 'user', content: message },
    ];

    const rawAction = await callGroq(actionMessages);
    console.log('[Chat] rawAction:', rawAction);

    let parsed: { action: string; params: any };
    try {
      const jsonMatch = rawAction.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawAction);
    } catch {
      parsed = { action: 'unknown', params: { reply: rawAction } };
    }

    console.log('[Chat] parsed action:', parsed.action, 'params:', JSON.stringify(parsed.params));

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

    const reply = await callGroq(formatMessages);

    res.json({ reply, action: parsed.action });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ reply: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.' });
  }
});

export default router;
