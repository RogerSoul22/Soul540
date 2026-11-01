import { Button } from '../../../../../../packages/pentagono/src/index';
import type { useFinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';

type Entry = ReturnType<typeof useFinanceiroController>['filtered'][number];

interface Props {
  entry: Entry;
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
}

export default function FinanceiroEntryActions({ entry, onEdit, onDelete }: Props) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <Button variant="outline" className={styles.actionBtn} onClick={() => onEdit(entry)} title="Editar">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </Button>
      <Button
        variant="danger"
        size="sm"
        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
        onClick={() => onDelete(entry.id)}
        title="Excluir"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </Button>
    </div>
  );
}
