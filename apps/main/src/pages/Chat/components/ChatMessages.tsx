import type { RefObject } from 'react';
import type { ChatMessage } from '../types/chat-types';
import styles from '../styles/Chat.module.scss';

type Props = {
  messages: ChatMessage[];
  loading: boolean;
  bottomRef: RefObject<HTMLDivElement>;
};

export default function ChatMessages({ messages, loading, bottomRef }: Props) {
  return (
    <div className={styles.messages}>
      {messages.map((message, index) => (
        <div key={index} className={styles.bubble + ' ' + styles[message.role]}>
          {message.role === 'assistant' && <div className={styles.bubbleAvatar}>IA</div>}
          <div className={styles.bubbleContent}>
            {message.content.split('\n').map((line, lineIndex, lines) => (
              <span key={lineIndex}>
                {line}
                {lineIndex < lines.length - 1 && <br />}
              </span>
            ))}
          </div>
        </div>
      ))}
      {loading && (
        <div className={styles.bubble + ' ' + styles.assistant}>
          <div className={styles.bubbleAvatar}>IA</div>
          <div className={styles.bubbleContent}>
            <span className={styles.typing}>
              <span />
              <span />
              <span />
            </span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
