import ChatHeader from './components/ChatHeader';
import ChatInput from './components/ChatInput';
import ChatMessages from './components/ChatMessages';
import ChatSuggestions from './components/ChatSuggestions';
import { useChatController } from './hooks/use-chat-controller';
import styles from './styles/Chat.module.scss';

export default function Chat() {
  const controller = useChatController();

  return (
    <div className={styles.container}>
      <ChatHeader />
      <ChatMessages messages={controller.messages} loading={controller.loading} bottomRef={controller.bottomRef} />
      <ChatSuggestions
        suggestions={controller.suggestions}
        loading={controller.loading}
        onSelect={controller.handleSuggestion}
      />
      <ChatInput
        input={controller.input}
        loading={controller.loading}
        listening={controller.listening}
        speechAvailable={controller.speechAvailable}
        onChange={controller.setInput}
        onSubmit={controller.handleSubmit}
        onToggleMic={controller.toggleMic}
      />
    </div>
  );
}
