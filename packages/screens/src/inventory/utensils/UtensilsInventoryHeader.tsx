import styles from './styles/UtensilsInventoryHeader.module.scss';

interface UtensilsInventoryHeaderProps {
  availableCount: number;
  onCreate: () => void;
  onOpenInfo: () => void;
  totalItems: number;
  totalValue: number;
}

export default function UtensilsInventoryHeader({
  availableCount,
  onCreate,
  onOpenInfo,
  totalItems,
  totalValue,
}: UtensilsInventoryHeaderProps) {
  return (
    <>
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Estoque de Utensílios</h1>
            <button className={styles.infoButton} onClick={onOpenInfo} title="Como usar esta página">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </button>
          </div>
          <p className={styles.subtitle}>Controle equipamentos, ferramentas e utensílios</p>
        </div>
        <button className={styles.primaryButton} onClick={onCreate}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo Utensílio
        </button>
      </div>

      <div className={styles.summaryGrid}>
        <SummaryCard color="blue" label="Total de itens" value={totalItems} />
        <SummaryCard color="green" label="Disponíveis" value={availableCount} />
        <SummaryCard
          color="amber"
          label="Valor total"
          value={`R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        />
      </div>
    </>
  );
}

function SummaryCard({ color, label, value }: { color: string; label: string; value: string | number }) {
  return (
    <div className={`${styles.summaryCard} ${styles[color]}`}>
      <div className={styles.summaryLabel}>{label}</div>
      <div className={styles.summaryValue}>{value}</div>
    </div>
  );
}
