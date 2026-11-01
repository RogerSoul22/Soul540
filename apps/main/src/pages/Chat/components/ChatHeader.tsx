import { Heading } from '../../../../../../packages/pentagono/src/index';
import styles from '../styles/Chat.module.scss';

export default function ChatHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.headerInfo}>
        <div className={styles.avatar}>IA</div>
        <div>
          <Heading level={2} variant="section" className={styles.title}>
            Assistente Soul540
          </Heading>
          <span className={styles.subtitle}>Powered by Groq · llama-3.1-8b</span>
        </div>
      </div>
    </div>
  );
}
