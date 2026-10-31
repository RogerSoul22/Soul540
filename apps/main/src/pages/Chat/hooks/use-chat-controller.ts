import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { apiFetch } from '../../../lib/api';
import type { ChatMessage, ChatResponse } from '../types/chat-types';

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  onerror: (event: { error: string }) => void;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const SpeechRecognitionAPI =
  (
    window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }
  ).SpeechRecognition ||
  (window as Window & { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

const suggestions = [
  'Ver eventos do mês',
  'Criar lançamento financeiro',
  'Listar tarefas pendentes',
  'Ver funcionários',
];

export function useChatController() {
  const { refreshFinances, refreshTasks } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Ola! Sou o assistente do Soul540. Posso consultar eventos, tarefas, financas, funcionarios e contratantes, ' +
        'alem de criar lancamentos e tarefas. Como posso ajudar?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  async function sendMessage(text: string) {
    const userMessage: ChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const token = localStorage.getItem('soul540_token');
      const history = newMessages.slice(-10).map(({ role, content }) => ({ role, content }));
      const response = await apiFetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-System': 'main',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
        body: JSON.stringify({ message: text, history }),
      });
      const data = (await response.json()) as ChatResponse;
      setMessages((current) => [...current, { role: 'assistant', content: data.reply }]);
      if (data.action === 'create_finance') refreshFinances();
      if (data.action === 'create_task') refreshTasks();
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'Erro ao conectar com o assistente. Verifique se o serviço está ativo.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    await sendMessage(text);
  }

  function handleSuggestion(text: string) {
    if (!loading) void sendMessage(text);
  }

  function toggleMic() {
    if (!SpeechRecognitionAPI) return;
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setInput((current) => (current ? current + ' ' + transcript : transcript));
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setListening(false);
        recognitionRef.current = null;
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  return {
    messages,
    input,
    setInput,
    loading,
    listening,
    bottomRef,
    suggestions,
    speechAvailable: Boolean(SpeechRecognitionAPI),
    handleSubmit,
    handleSuggestion,
    toggleMic,
  };
}
