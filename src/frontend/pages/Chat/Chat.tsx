import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useApp } from '@frontend/contexts/AppContext';
import styles from './Chat.module.scss';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const { refreshFinances, refreshTasks } = useApp();
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

      const data = await res.json() as { reply: string; action?: string };
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.action === 'create_finance') refreshFinances();
      if (data.action === 'create_task') refreshTasks();
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao conectar com o assistente. Verifique se o serviço está ativo.' }]);
    } finally {
      setLoading(false);
    }
  }

  const SUGGESTIONS = [
    'Ver eventos do mês',
    'Criar lançamento financeiro',
    'Listar tarefas pendentes',
    'Ver funcionários',
  ];

  async function handleSuggestion(text: string) {
    if (loading) return;
    const userMessage: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
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
      const data = await res.json() as { reply: string; action?: string };
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.action === 'create_finance') refreshFinances();
      if (data.action === 'create_task') refreshTasks();
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao conectar com o assistente.' }]);
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
            <span className={styles.subtitle}>Powered by Groq · llama-3.1-8b</span>
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

      <div className={styles.suggestions}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            className={styles.suggestionChip}
            onClick={() => handleSuggestion(s)}
            disabled={loading}
            type="button"
          >
            {s}
          </button>
        ))}
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
