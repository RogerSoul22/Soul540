import { Button, Input } from '../../../../../../packages/pentagono/src/index';
import type { FormEvent } from 'react';
import styles from '../styles/Chat.module.scss';

type Props = {
  input: string;
  loading: boolean;
  listening: boolean;
  speechAvailable: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleMic: () => void;
};

export default function ChatInput({
  input,
  loading,
  listening,
  speechAvailable,
  onChange,
  onSubmit,
  onToggleMic,
}: Props) {
  return (
    <form className={styles.inputBar} onSubmit={onSubmit}>
      <Input
        className={styles.input}
        value={input}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Pergunte algo sobre o sistema..."
        disabled={loading}
        autoFocus
      />
      {speechAvailable && (
        <Button
          variant="outline"
          type="button"
          className={styles.micBtn + (listening ? ' ' + styles.micBtnActive : '')}
          onClick={onToggleMic}
          disabled={loading}
          title={listening ? 'Parar gravação' : 'Falar'}
          aria-label={listening ? 'Parar gravação' : 'Falar'}
        >
          {listening ? '■' : '●'}
        </Button>
      )}
      <Button variant="outline" className={styles.sendBtn} type="submit" disabled={loading || !input.trim()}>
        Enviar
      </Button>
    </form>
  );
}
