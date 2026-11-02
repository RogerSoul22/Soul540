import styles from './Input.module.css';

interface PasswordToggleProps {
  visible: boolean;
  onToggle: () => void;
}

// Olho para mostrar a senha; riscado quando ela já está visível (clicar oculta).
export function PasswordToggle({ visible, onToggle }: PasswordToggleProps) {
  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={onToggle}
      tabIndex={-1}
      aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
      title={visible ? 'Ocultar senha' : 'Mostrar senha'}
      aria-pressed={visible}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
        <circle cx="12" cy="12" r="3" />
        {visible && <line x1="3" y1="3" x2="21" y2="21" />}
      </svg>
    </button>
  );
}
