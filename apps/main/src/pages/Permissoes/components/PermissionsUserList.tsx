import { Button, EmptyState, Input } from '../../../../../../packages/pentagono/src/index';
import type { AppUser } from '../types/permissions-types';
import { groupUsersByUnit, getInitials } from '../support/permissions-utils';
import styles from '../styles/Permissoes.module.scss';

type Props = {
  users: AppUser[];
  filteredUsers: AppUser[];
  selected: AppUser | null;
  search: string;
  onSearch: (value: string) => void;
  onSelect: (user: AppUser) => void;
  onChangePassword: (user: AppUser) => void;
  onDelete: (user: AppUser) => void;
  canChangePassword: (user: AppUser) => boolean;
  isReadOnly: (user: AppUser) => boolean;
};

export default function PermissionsUserList({
  users,
  filteredUsers,
  selected,
  search,
  onSearch,
  onSelect,
  onChangePassword,
  onDelete,
  canChangePassword,
  isReadOnly,
}: Props) {
  return (
    <div className={styles.userList}>
      <p className={styles.listTitle}>
        Usuários ({filteredUsers.length}/{users.length})
      </p>
      <div className={styles.searchWrap}>
        <Input
          variant="search"
          className={styles.searchInput}
          placeholder="Buscar usuários..."
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>
      {groupUsersByUnit(filteredUsers).map((group) => (
        <div key={group.label}>
          <p className={styles.systemGroupLabel}>{group.label}</p>
          {group.users.map((user) => (
            <div
              key={user.id}
              className={styles.userCard + (selected?.id === user.id ? ' ' + styles.userCardActive : '')}
              onClick={() => onSelect(user)}
            >
              <div className={styles.userAvatar}>{getInitials(user.name)}</div>
              <div className={styles.userInfo}>
                <p className={styles.userName}>{user.name}</p>
                <p className={styles.userEmail}>{user.email}</p>
              </div>
              <div className={styles.userMeta}>
                {user.isAdmin && <span className={styles.badgeAdmin}>Admin</span>}
                {canChangePassword(user) && (
                  <Button
                    variant="outline"
                    className={styles.btnEye}
                    onClick={(event) => {
                      event.stopPropagation();
                      onChangePassword(user);
                    }}
                    title="Alterar senha"
                  >
                    Senha
                  </Button>
                )}
                {!isReadOnly(user) && (
                  <Button
                    variant="danger"
                    size="sm"
                    className={styles.btnDeleteUser}
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(user);
                    }}
                    title="Remover usuário"
                  >
                    ×
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
      {users.length === 0 && (
        <EmptyState variant="compact" title="Nenhum usuário cadastrado." className={styles.empty} />
      )}
      {users.length > 0 && filteredUsers.length === 0 && (
        <EmptyState variant="compact" title="Nenhum usuário encontrado." className={styles.empty} />
      )}
    </div>
  );
}
