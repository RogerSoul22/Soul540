import styles from './InfoButton.module.css';
import type { InfoButtonProps } from './type';

// Botão padrão de "como usar esta página": ícone de informação em círculo ao lado do título.
export function InfoButton({
  label = 'Como usar esta página',
  bordered = false,
  className = '',
  ...rest
}: InfoButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.info} ${bordered ? styles.bordered : ''} ${className}`.trim()}
      title={label}
      aria-label={label}
      {...rest}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    </button>
  );
}
