import { Button, InfoButton, PageHeader } from '../../../../pentagono/src/index';
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
      <PageHeader
        title="Estoque de Utensílios"
        subtitle="Controle equipamentos, ferramentas e utensílios"
        titleExtra={
          <>
            <InfoButton label="Como usar esta página" onClick={onOpenInfo} />
          </>
        }
        actions={
          <>
            <Button variant="primary" onClick={onCreate}>
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
            </Button>
          </>
        }
      />

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
