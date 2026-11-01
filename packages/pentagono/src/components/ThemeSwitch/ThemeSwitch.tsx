import styles from './ThemeSwitch.module.css';
import type { ThemeSwitchProps } from './type';

const SUN_RAYS =
  'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2' +
  'M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41';

function SunIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d={SUN_RAYS} />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

// Alternador de tema com sol (claro) e lua (escuro); o lado ativo fica destacado.
export function ThemeSwitch({ isDark, onToggle, className = '' }: ThemeSwitchProps) {
  const choose = (wantDark: boolean) => {
    if (wantDark !== isDark) onToggle();
  };

  return (
    <div className={`${styles.switch} ${className}`.trim()} role="group" aria-label="Tema do sistema">
      <button
        type="button"
        className={`${styles.option} ${!isDark ? styles.active : ''}`.trim()}
        aria-pressed={!isDark}
        aria-label="Tema claro"
        onClick={() => choose(false)}
      >
        <SunIcon />
      </button>
      <button
        type="button"
        className={`${styles.option} ${isDark ? styles.active : ''}`.trim()}
        aria-pressed={isDark}
        aria-label="Tema escuro"
        onClick={() => choose(true)}
      >
        <MoonIcon />
      </button>
    </div>
  );
}
