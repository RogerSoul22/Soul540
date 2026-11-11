import styles from '../styles/EstoqueInsumos.module.scss';

type Props = {
  activeTab: 'stock' | 'orders';
  onChange: (tab: 'stock' | 'orders') => void;
};

export default function InsumosTabs({ activeTab, onChange }: Props) {
  return (
    <div className={styles.tabBarWrapper}>
      <div className={styles.tabBar} role="tablist" aria-label="Gestão de insumos">
        <button
          id="insumos-stock-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === 'stock'}
          aria-controls="insumos-panel"
          className={`${styles.tab} ${activeTab === 'stock' ? styles.tabActive : ''}`}
          onClick={() => onChange('stock')}
        >
          Estoque
        </button>
        <button
          id="insumos-orders-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === 'orders'}
          aria-controls="insumos-panel"
          className={`${styles.tab} ${activeTab === 'orders' ? styles.tabActive : ''}`}
          onClick={() => onChange('orders')}
        >
          Pedidos
        </button>
      </div>
    </div>
  );
}
