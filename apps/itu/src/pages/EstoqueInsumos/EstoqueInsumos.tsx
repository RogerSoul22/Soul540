import { useSearchParams } from 'react-router-dom';
import { useSuppliesController } from './hooks/use-supplies-controller';
import { SupplyOrdersScreen } from '../../../../../packages/screens/src';
import {
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  InfoButton,
  Input,
  PageHeader,
  SkeletonValue,
} from '../../../../../packages/pentagono/src/index';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../lib/api';
import SupplyCatalog from './components/SupplyCatalog';
import SupplyFormModal from './components/SupplyFormModal';
import SupplyDetailsModal from './components/SupplyDetailsModal';
import SupplyXmlModal from './components/SupplyXmlModal';
import SupplyCategoryModal from './components/SupplyCategoryModal';
import SupplyInfoModal from './components/SupplyInfoModal';
import InsumosTabs from './components/InsumosTabs';
import styles from './styles/EstoqueInsumos.module.scss';

function StockInventoryTab() {
  const controller = useSuppliesController();
  const {
    loading,
    lowStockCount,
    totalValue,
    xmlInputRef,
    openCreate,
    setShowInfo,
    setDeleteSupply,
    confirmDeleteSupply,
    setDeleteCategory,
    confirmDeleteCategory,
    deleteSupply,
    deleteCategory,
    categories,
  } = controller;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Estoque de Insumos"
        subtitle="Controle de matérias-primas e ingredientes."
        titleExtra={<InfoButton onClick={() => setShowInfo(true)} />}
        actions={
          <>
            <Input ref={xmlInputRef} type="file" accept=".xml,text/xml" hidden onChange={controller.handleXmlFile} />
            <Button variant="secondary" onClick={() => xmlInputRef.current?.click()}>
              Importar NF-e
            </Button>
            <Button variant="primary" onClick={openCreate}>
              + Novo insumo
            </Button>
          </>
        }
      />
      <div className={styles.kpiGrid}>
        <Card className={styles.kpiCard} variant="stat">
          <span className={styles.kpiLabel}>Itens cadastrados</span>
          <SkeletonValue as="strong" loading={loading} label="Carregando itens..." className={styles.kpiValue}>
            {controller.supplies.length}
          </SkeletonValue>
        </Card>
        <Card
          className={`${styles.kpiCard} ${lowStockCount ? styles.red : styles.green}`}
          variant="stat"
        >
          <span className={styles.kpiLabel}>Atenção</span>
          <SkeletonValue as="strong" loading={loading} label="Carregando alertas..." className={styles.kpiValue}>
            {lowStockCount}
          </SkeletonValue>
          <small>{lowStockCount ? 'abaixo do mínimo' : 'tudo em ordem'}</small>
        </Card>
        <Card className={styles.kpiCard} variant="stat">
          <span className={styles.kpiLabel}>Valor em estoque</span>
          <SkeletonValue as="strong" loading={loading} label="Carregando valor..." className={styles.kpiValue}>
            R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </SkeletonValue>
        </Card>
      </div>
      <SupplyCatalog controller={controller} />
      <SupplyFormModal controller={controller} />
      <SupplyDetailsModal controller={controller} />
      <SupplyXmlModal controller={controller} />
      <SupplyCategoryModal controller={controller} />
      <SupplyInfoModal controller={controller} />
      {deleteSupply && (
        <ConfirmModal
          title="Excluir insumo"
          message="Tem certeza que deseja excluir este insumo?"
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={confirmDeleteSupply}
          onClose={() => setDeleteSupply(null)}
        />
      )}
      {deleteCategory && (
        <ConfirmModal
          title="Excluir categoria"
          message="A categoria será removida do cadastro."
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={confirmDeleteCategory}
          onClose={() => setDeleteCategory(null)}
        />
      )}
      {categories.length === 0 && !loading && (
        <EmptyState
          variant="compact"
          title="Crie categorias para organizar seus insumos."
          className={styles.emptyState}
        />
      )}
    </div>
  );
}

export default function EstoqueInsumos() {
  const { isAdmin, permissions } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const canViewStock = isAdmin || permissions.includes('estoque-insumos');
  const canViewOrders = isAdmin || permissions.includes('pedidos-insumos');
  const ordersRequested = searchParams.get('tab') === 'pedidos';
  const activeTab = ordersRequested && canViewOrders ? 'orders' : canViewStock ? 'stock' : 'orders';
  const selectTab = (tab: 'stock' | 'orders') => {
    setSearchParams(tab === 'orders' ? { tab: 'pedidos' } : {});
  };

  return (
    <>
      {canViewStock && canViewOrders && (
        <InsumosTabs activeTab={activeTab} onChange={selectTab} />
      )}
      <div
        id="insumos-panel"
        role="tabpanel"
        aria-labelledby={canViewStock && canViewOrders ? `insumos-${activeTab}-tab` : undefined}
      >
        {activeTab === 'orders' ? (
          <SupplyOrdersScreen apiFetch={apiFetch} mode="franchise" />
        ) : (
          <StockInventoryTab />
        )}
      </div>
    </>
  );
}
