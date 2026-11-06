import type { AppUser, UserForm } from '../types/permissions-types';
import PermissionsCreateModal from './PermissionsCreateModal';
import PermissionsDeleteModal from './PermissionsDeleteModal';
import PermissionsPasswordModal from './PermissionsPasswordModal';

type Props = {
  showCreate: boolean;
  form: UserForm;
  franchises: { id: string; name: string }[];
  changePasswordTarget: AppUser | null;
  newPassword: string;
  changePasswordSaving: boolean;
  deleteTarget: AppUser | null;
  onCloseCreate: () => void;
  onFormChange: (form: UserForm) => void;
  onCreate: () => void;
  onClosePassword: () => void;
  onPasswordChange: (value: string) => void;
  onChangePassword: () => void;
  onCloseDelete: () => void;
  onDelete: (user: AppUser) => void;
};

export default function PermissionsModals({
  showCreate,
  form,
  franchises,
  changePasswordTarget,
  newPassword,
  changePasswordSaving,
  deleteTarget,
  onCloseCreate,
  onFormChange,
  onCreate,
  onClosePassword,
  onPasswordChange,
  onChangePassword,
  onCloseDelete,
  onDelete,
}: Props) {
  return (
    <>
      {showCreate && (
        <PermissionsCreateModal
          form={form}
          franchises={franchises}
          onClose={onCloseCreate}
          onCreate={onCreate}
          onFormChange={onFormChange}
        />
      )}
      {changePasswordTarget && (
        <PermissionsPasswordModal
          saving={changePasswordSaving}
          target={changePasswordTarget}
          value={newPassword}
          onChange={onPasswordChange}
          onClose={onClosePassword}
          onSave={onChangePassword}
        />
      )}
      {deleteTarget && (
        <PermissionsDeleteModal target={deleteTarget} onClose={onCloseDelete} onDelete={() => onDelete(deleteTarget)} />
      )}
    </>
  );
}
