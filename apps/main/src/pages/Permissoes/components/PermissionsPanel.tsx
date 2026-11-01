import type { AppUser } from '../types/permissions-types';
import { Button } from '../../../../../../packages/pentagono/src/index';
import { ALL_KEYS, ALL_PAGES, SYSTEM_LABELS } from '../types/permissions-types';
import styles from '../styles/Permissoes.module.scss';

type Props = {
  selected: AppUser | null;
  draftPerms: string[];
  draftIsAdmin: boolean;
  saving: boolean;
  isReadOnly: (user: AppUser) => boolean;
  onTogglePermission: (key: string) => void;
  onToggleAll: () => void;
  onAdminChange: (value: boolean) => void;
  onSave: () => void;
};

export default function PermissionsPanel({
  selected,
  draftPerms,
  draftIsAdmin,
  saving,
  isReadOnly,
  onTogglePermission,
  onToggleAll,
  onAdminChange,
  onSave,
}: Props) {
  if (!selected) {
    return (
      <div className={styles.permPanel}>
        <div className={styles.permEmpty}>
          <p>Selecione um usuário para gerenciar as permissões</p>
        </div>
      </div>
    );
  }

  const readOnly = isReadOnly(selected);
  return (
    <div className={styles.permPanel}>
      {readOnly && (
        <div className={styles.crossUnitBanner}>
          Administrador do sistema <strong>{SYSTEM_LABELS[selected.unit || ''] || selected.unit}</strong> — permissões
          somente leitura
        </div>
      )}
      <Button
        type="button"
        variant="ghost"
        className={styles.adminToggleRow}
        aria-pressed={draftIsAdmin}
        disabled={readOnly}
        onClick={() => onAdminChange(!draftIsAdmin)}
      >
        <span className={styles.adminToggleLabel}>
          Administrador
          <small> — acesso total + tela de Permissões</small>
        </span>
      </Button>
      <div className={styles.permHeader}>
        <div>
          <p className={styles.permTitle}>Permissões de {selected.name}</p>
          <p className={styles.permSub}>
            {draftPerms.length} de {ALL_KEYS.length} páginas liberadas
          </p>
        </div>
        {!readOnly && (
          <Button type="button" variant="ghost" className={styles.btnToggleAll} onClick={onToggleAll}>
            {draftPerms.length === ALL_KEYS.length ? 'Desmarcar tudo' : 'Marcar tudo'}
          </Button>
        )}
      </div>
      <div className={styles.permGroups}>
        {ALL_PAGES.map((group) => (
          <div key={group.group} className={styles.permGroup}>
            <p className={styles.permGroupLabel}>{group.group}</p>
            {group.items.map((item) => (
              <Button
                type="button"
                variant="ghost"
                key={item.key}
                className={styles.permItem}
                aria-pressed={draftPerms.includes(item.key)}
                disabled={readOnly}
                onClick={() => onTogglePermission(item.key)}
              >
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
        ))}
      </div>
      {!readOnly && (
        <div className={styles.permFooter}>
          <Button type="button" className={styles.btnSave} onClick={onSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Permissões'}
          </Button>
        </div>
      )}
    </div>
  );
}
