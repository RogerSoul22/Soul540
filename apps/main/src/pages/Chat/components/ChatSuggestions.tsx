import styles from '../styles/Chat.module.scss';

type Props = {
  suggestions: string[];
  loading: boolean;
  onSelect: (suggestion: string) => void;
};

export default function ChatSuggestions({ suggestions, loading, onSelect }: Props) {
  return (
    <div className={styles.suggestions}>
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          className={styles.suggestionChip}
          onClick={() => onSelect(suggestion)}
          disabled={loading}
          type="button"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
