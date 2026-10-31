import { useSuppliesController } from './hooks/use-supplies-controller';
import { ConfirmModal } from '@soul540/ui';
import SupplyCatalog from './components/SupplyCatalog';
import SupplyFormModal from './components/SupplyFormModal';
import SupplyDetailsModal from './components/SupplyDetailsModal';
import SupplyXmlModal from './components/SupplyXmlModal';
import SupplyCategoryModal from './components/SupplyCategoryModal';
import SupplyInfoModal from './components/SupplyInfoModal';
import styles from './styles/EstoqueInsumos.module.scss';

export default function EstoqueInsumos() {
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
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Estoque de Insumos</h1>
          <p className={styles.subtitle}>Controle de matérias-primas e ingredientes.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnInfo} onClick={() => setShowInfo(true)}>
            Como usar
          </button>
          <input ref={xmlInputRef} type="file" accept=".xml,text/xml" hidden onChange={controller.handleXmlFile} />
          <button className={styles.btnSecondary} onClick={() => xmlInputRef.current?.click()}>
            Importar NF-e
          </button>
          <button className={styles.btnPrimary} onClick={openCreate}>
            + Novo insumo
          </button>
        </div>
      </header>
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Itens cadastrados</span>
          <strong className={styles.kpiValue}>{loading ? '...' : controller.supplies.length}</strong>
        </div>
        <div className={styles.kpiCard + ' ' + (lowStockCount ? styles.red : styles.green)}>
          <span className={styles.kpiLabel}>Atenção</span>
          <strong className={styles.kpiValue}>{lowStockCount}</strong>
          <small>{lowStockCount ? 'abaixo do mínimo' : 'tudo em ordem'}</small>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Valor em estoque</span>
          <strong className={styles.kpiValue}>
            R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </strong>
        </div>
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
        <p className={styles.emptyState}>Crie categorias para organizar seus insumos.</p>
      )}
    </div>
  );
}
