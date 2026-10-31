import styles from '../styles/Permissoes.module.scss';

type Props = { onCreate: () => void };

export default function PermissionsHeader({ onCreate }: Props) {
  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>Permissões</h1>
        <p className={styles.subtitle}>Gerencie usuários e controle o acesso às páginas</p>
        <p className={styles.systemNotice}>
          Administradores de outros sistemas têm permissões somente leitura nesta tela. Usuários comuns de qualquer
          sistema podem ser editados livremente.
        </p>
      </div>
      <button className={styles.btnPrimary} onClick={onCreate}>
        + Novo Usuário
      </button>
    </div>
  );
}
