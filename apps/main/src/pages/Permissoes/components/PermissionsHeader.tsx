import { Button, PageHeader } from '../../../../../../packages/pentagono/src/index';
import styles from '../styles/Permissoes.module.scss';

type Props = { onCreate: () => void };

const READ_ONLY_NOTICE =
  'Administradores de outros sistemas têm permissões somente leitura nesta tela. ' +
  'Usuários comuns de qualquer sistema podem ser editados livremente.';

export default function PermissionsHeader({ onCreate }: Props) {
  return (
    <PageHeader
      className={styles.header}
      title="Permissões"
      subtitle="Gerencie usuários e controle o acesso às páginas"
      notice={READ_ONLY_NOTICE}
      actions={
        <Button variant="primary" onClick={onCreate}>
          + Novo Usuário
        </Button>
      }
    />
  );
}
