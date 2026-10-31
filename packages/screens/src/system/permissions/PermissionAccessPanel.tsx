import { Button } from '@soul540/ui';
import type { AppUser, PermissionDirectoryConfig, StyleMap } from './permission-types';

type Props = {
  allKeys: string[];
  config: PermissionDirectoryConfig;
  draftIsAdmin: boolean;
  draftPermissions: string[];
  onSave: () => void;
  onTogglePermission: (key: string) => void;
  readOnly: boolean;
  saving: boolean;
  selected: AppUser | null;
  setDraftIsAdmin: (value: boolean) => void;
  setDraftPermissions: (value: string[]) => void;
  styles: StyleMap;
};

export default function PermissionAccessPanel({
  allKeys,
  config,
  draftIsAdmin,
  draftPermissions,
  onSave,
  onTogglePermission,
  readOnly,
  saving,
  selected,
  setDraftIsAdmin,
  setDraftPermissions,
  styles,
}: Props) {
  if (!selected) {
    return <p className={styles.permEmpty}>Selecione um usuário para gerenciar as permissões</p>;
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        className={styles.adminToggleRow}
        aria-pressed={draftIsAdmin}
        disabled={readOnly}
        onClick={() => {
          setDraftIsAdmin(!draftIsAdmin);
          setDraftPermissions(draftIsAdmin ? [] : allKeys);
        }}
      >
        <span className={styles.adminToggleLabel}>Administrador</span>
      </Button>
      <header className={styles.permHeader}>
        <div>
          <p className={styles.permTitle}>Permissões de {selected.name}</p>
          <p className={styles.permSub}>
            {draftPermissions.length} de {allKeys.length} páginas liberadas
          </p>
        </div>
        {!readOnly && (
          <Button
            type="button"
            variant="ghost"
            className={styles.btnToggleAll}
            onClick={() => setDraftPermissions(draftPermissions.length === allKeys.length ? [] : allKeys)}
          >
            Marcar tudo
          </Button>
        )}
      </header>
      <div className={styles.permGroups}>
        {config.groups.map((group) => (
          <section className={styles.permGroup} key={group.group}>
            <p className={styles.permGroupLabel}>{group.group}</p>
            {group.items.map((item) => (
              <Button
                type="button"
                variant="ghost"
                className={styles.permItem}
                key={item.key}
                aria-pressed={draftPermissions.includes(item.key)}
                disabled={readOnly}
                onClick={() => onTogglePermission(item.key)}
              >
                <span>{item.label}</span>
              </Button>
            ))}
          </section>
        ))}
      </div>
      {!readOnly && (
        <footer className={styles.permFooter}>
          <Button type="button" className={styles.btnSave} disabled={saving} onClick={onSave}>
            {saving ? 'Salvando...' : 'Salvar Permissões'}
          </Button>
        </footer>
      )}
    </>
  );
}
