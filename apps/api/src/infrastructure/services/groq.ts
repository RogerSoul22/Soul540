type GroqMessage = { role: string; content: string };

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 30_000;

export async function callGroq(messages: GroqMessage[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY || '';
  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.1 }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) throw new Error(`Groq error: ${response.status}`);
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content || '';
}
