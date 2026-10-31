import PermissionsHeader from './components/PermissionsHeader';
import PermissionsModals from './components/PermissionsModals';
import PermissionsPanel from './components/PermissionsPanel';
import PermissionsUserList from './components/PermissionsUserList';
import { ALL_KEYS } from './types/permissions-types';
import { usePermissionsController } from './hooks/use-permissions-controller';
import styles from './styles/Permissoes.module.scss';

export default function Permissoes() {
  const controller = usePermissionsController();

  return (
    <div className={styles.page}>
      <PermissionsHeader onCreate={() => controller.setShowModal(true)} />
      <div className={styles.layout}>
        <PermissionsUserList
          users={controller.users}
          filteredUsers={controller.filteredUsers}
          selected={controller.selected}
          search={controller.search}
          onSearch={controller.setSearch}
          onSelect={controller.selectUser}
          onChangePassword={(user) => {
            controller.setChangePwTarget(user);
            controller.setNewPassword('');
          }}
          onDelete={controller.setDeleteTarget}
          canChangePassword={controller.canChangePassword}
          isReadOnly={controller.isReadOnly}
        />
        <PermissionsPanel
          selected={controller.selected}
          draftPerms={controller.draftPerms}
          draftIsAdmin={controller.draftIsAdmin}
          saving={controller.saving}
          isReadOnly={controller.isReadOnly}
          onTogglePermission={controller.togglePerm}
          onToggleAll={controller.toggleAll}
          onAdminChange={(value) => {
            controller.setDraftIsAdmin(value);
            controller.setDraftPerms(value ? [...ALL_KEYS] : []);
          }}
          onSave={controller.savePermissions}
        />
      </div>
      <PermissionsModals
        showCreate={controller.showModal}
        form={controller.form}
        changePasswordTarget={controller.changePwTarget}
        newPassword={controller.newPassword}
        changePasswordSaving={controller.changePwSaving}
        deleteTarget={controller.deleteTarget}
        onCloseCreate={() => controller.setShowModal(false)}
        onFormChange={controller.setForm}
        onCreate={controller.createUser}
        onClosePassword={() => controller.setChangePwTarget(null)}
        onPasswordChange={controller.setNewPassword}
        onChangePassword={controller.changePassword}
        onCloseDelete={() => controller.setDeleteTarget(null)}
        onDelete={controller.deleteUser}
      />
    </div>
  );
}
