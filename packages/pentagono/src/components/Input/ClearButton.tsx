import type { CSSProperties } from 'react';
import styles from './Input.module.css';

interface ClearButtonProps {
  onClear: () => void;
  // Quando o botão flutua sobre um campo sem rótulo (posicionado pelo hook de âncora).
  floatingStyle?: CSSProperties;
}

export function ClearButton({ onClear, floatingStyle }: ClearButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.clear} ${floatingStyle ? styles.clearFloating : ''}`.trim()}
      style={floatingStyle}
      tabIndex={-1}
      aria-label="Limpar campo"
      title="Limpar"
      // Não tira o foco do campo ao clicar.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClear}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}
