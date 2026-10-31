import styles from '../styles/Tarefas.module.scss';

export default function ProductionRemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.btnRemove} onClick={onClick} title="Remover">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}
