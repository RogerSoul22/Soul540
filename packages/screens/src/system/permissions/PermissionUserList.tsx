import { unitLabels, type AppUser, type StyleMap } from './permission-types';

interface PermissionUserListProps {
  currentUnit: string;
  onPassword: (user: AppUser) => void;
  onSearch: (value: string) => void;
  onSelect: (user: AppUser) => void;
  search: string;
  selectedId: string | undefined;
  styles: StyleMap;
  users: AppUser[];
}

export default function PermissionUserList({
  currentUnit,
  onPassword,
  onSearch,
  onSelect,
  search,
  selectedId,
  styles,
  users,
}: PermissionUserListProps) {
  return (
    <section className={styles.userList}>
      <p className={styles.listTitle}>Usuários ({users.length})</p>
      <input
        className={styles.searchInput}
        onChange={(event) => onSearch(event.target.value)}
        placeholder="Buscar usuários..."
        value={search}
      />
      {users.map((user) => (
        <button
          className={`${styles.userCard} ${selectedId === user.id ? styles.userCardActive : ''}`}
          key={user.id}
          onClick={() => onSelect(user)}
        >
          <span className={styles.userAvatar}>{initials(user.name)}</span>
          <span className={styles.userInfo}>
            <strong className={styles.userName}>{user.name}</strong>
            <small className={styles.userEmail}>{user.email}</small>
            {user.unit !== currentUnit ? (
              <small className={styles.userUnit}>{unitLabels[user.unit ?? '']}</small>
            ) : null}
          </span>
          {user.isAdmin ? <span className={styles.badgeAdmin}>Admin</span> : null}
          {canChangePassword(currentUnit, user) ? (
            <span
              className={styles.btnEye}
              onClick={(event) => {
                event.stopPropagation();
                onPassword(user);
              }}
            >
              Senha
            </span>
          ) : null}
        </button>
      ))}
    </section>
  );
}

function canChangePassword(currentUnit: string, user: AppUser) {
  return currentUnit === 'main' || user.unit === currentUnit;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((item) => item[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
