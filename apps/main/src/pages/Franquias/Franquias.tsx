import { ConfirmModal, EmptyState, PageHeader } from '../../../../../packages/pentagono/src/index';
import FranchiseFormModal from './components/FranchiseFormModal';
import PortalCard from './components/PortalCard';
import { useFranquiasController } from './hooks/use-franquias-controller';
import styles from './styles/Franquias.module.scss';

export default function Franquias() {
  const controller = useFranquiasController();
  const activeFranchises = controller.franchises.filter(
    (franchise) => franchise.status === 'ativa' || franchise.status === 'em_implantacao',
  );

  return (
    <div className={styles.page}>
      <PageHeader title="Franquias" subtitle="Gerencie unidades franqueadas da Soul540" />
      <div className={styles.sectionLabel}>Franquias ativas ({activeFranchises.length})</div>
      <div className={styles.portalsGrid}>
        {activeFranchises.map((franchise) => {
          return (
            <PortalCard
              key={franchise.id || franchise.slug}
              system="franchise"
              franchiseName={`Franquia ${franchise.name}`}
              status={franchise.status}
            />
          );
        })}
        {activeFranchises.length === 0 && <EmptyState title="Nenhuma franquia ativa cadastrada." />}
      </div>
      {controller.showModal && (
        <FranchiseFormModal
          form={controller.form}
          editing={Boolean(controller.editingId)}
          onChange={controller.setForm}
          onClose={controller.closeModal}
          onSubmit={controller.submit}
        />
      )}
      {controller.deleteTargetId && (
        <ConfirmModal
          title="Excluir Franquia"
          message={
            <>
              Tem certeza que deseja excluir{' '}
              <strong>
                {controller.franchises.find((franchise) => franchise.id === controller.deleteTargetId)?.name}
              </strong>
              ? Esta ação não pode ser desfeita.
            </>
          }
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={controller.confirmDelete}
          onClose={() => controller.setDeleteTargetId(null)}
        />
      )}
    </div>
  );
}
