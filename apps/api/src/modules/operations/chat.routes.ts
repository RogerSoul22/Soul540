import { Router } from 'express';
import { z } from 'zod';
import { callGroq } from '../../infrastructure/services/groq';
import { requirePermission } from '../../infrastructure/middleware/permissions';
import { executeChatAction, parseChatAction, SYSTEM_PROMPT } from './chat-actions';

export { parseChatAction } from './chat-actions';

const router = Router();
router.use(requirePermission('chat', 'read'));

const ChatRequestSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().max(4000),
      }),
    )
    .max(20)
    .optional()
    .default([]),
});

router.post('/', async (req: any, res: any) => {
  try {
    const input = ChatRequestSchema.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: 'invalid_chat_request' });
    const { message, history } = input.data;
    console.log('[Chat] request received', { messageLength: message.length, historyItems: history.length });

    const rawAction = await callGroq([
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6),
      { role: 'user', content: message },
    ]);
    const parsed = parseChatAction(rawAction);
    console.log('[Chat] action:', parsed.action);
    if (parsed.action === 'unknown') {
      return res.json({ reply: parsed.params.reply || rawAction, action: 'unknown' });
    }

    const result = await executeChatAction(req, parsed.action, parsed.params);
    const reply = await callGroq([
      {
        role: 'system',
        content: [
          'Você é um assistente amigável do Soul540. Responda em português brasileiro de forma clara e',
          'concisa. Formate listas com bullet points quando apropriado.',
        ].join(' '),
      },
      { role: 'user', content: message },
      {
        role: 'assistant',
        content: `Consultei o sistema e encontrei os seguintes dados: ${JSON.stringify(result, null, 2)}`,
      },
      { role: 'user', content: 'Com base nesses dados, responda minha pergunta original de forma clara e amigável.' },
    ]);
    return res.json({ reply, action: parsed.action });
  } catch (error: any) {
    console.error('Chat error:', error?.code || error?.message || error);
    const status = Number(error?.status) || 500;
    return res.status(status).json({
      error: error?.code || 'chat_error',
      reply: status < 500 ? error.message : 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
    });
  }
});

export default router;
