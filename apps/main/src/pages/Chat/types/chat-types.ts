export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatResponse = {
  reply: string;
  action?: string;
};
