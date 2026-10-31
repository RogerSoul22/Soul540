import { z } from 'zod';

export const SYSTEM_PROMPT = `Você é um assistente do sistema Soul540, um sistema de gestão de eventos e franquias.
Você tem acesso às seguintes ações para consultar e modificar dados:

AÇÕES DISPONÍVEIS (responda SOMENTE com JSON válido, sem texto extra):
1. query_events - Consultar eventos
2. query_tasks - Consultar tarefas
3. query_finances - Consultar lançamentos financeiros
4. query_employees - Consultar funcionários
5. query_contractors - Consultar contratantes
6. create_finance - Criar lançamento financeiro já liquidado
7. create_task - Criar tarefa
8. unknown - Perguntas gerais sem necessidade de dados

REGRAS:
- Responda sempre com JSON válido e nada mais
- Use "unknown" para perguntas que não precisam de dados do sistema
- Para datas use o formato YYYY-MM-DD
- Data de hoje: ${new Date().toISOString().split('T')[0]}
`;

const CHAT_ACTIONS = [
  'query_events',
  'query_tasks',
  'query_finances',
  'query_employees',
  'query_contractors',
  'create_finance',
  'create_task',
  'unknown',
] as const;

const ChatActionSchema = z.object({
  action: z.enum(CHAT_ACTIONS),
  params: z.record(z.string(), z.unknown()).default({}),
});

export function parseChatAction(rawAction: string) {
  let candidate: unknown;
  try {
    const jsonMatch = rawAction.match(/\{[\s\S]*\}/);
    candidate = JSON.parse(jsonMatch ? jsonMatch[0] : rawAction);
  } catch {
    return { action: 'unknown' as const, params: { reply: rawAction } };
  }
  const parsed = ChatActionSchema.safeParse(candidate);
  if (!parsed.success) {
    throw Object.assign(new Error('Ação do chat inválida'), { status: 400, code: 'invalid_chat_action' });
  }
  return parsed.data;
}
