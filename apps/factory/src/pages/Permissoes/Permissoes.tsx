import { PermissionDirectoryScreen, portalConfigs, type PermissionDirectoryConfig } from '@soul540/screens';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../lib/api';
import styles from './styles/Permissoes.module.scss';

const config: PermissionDirectoryConfig = {
  unit: portalConfigs.factory.unit,
  displayUnit: 'Fábrica',
  groups: [
    { group: 'Principal', items: [{ key: 'dashboard', label: 'Dashboard' }] },
    {
      group: 'Gestão',
      items: [
        { key: 'eventos', label: 'Eventos' },
        { key: 'tarefas', label: 'Produção' },
        { key: 'funcionarios', label: 'Funcionários' },
        { key: 'contratantes', label: 'Contratantes' },
      ],
    },
    { group: 'Financeiro', items: [{ key: 'financeiro', label: 'Financeiro' }] },
    {
      group: 'Operações',
      items: [
        { key: 'estoque-insumos', label: 'Est. Insumos' },
        { key: 'estoque-utensilios', label: 'Est. Utensílios' },
      ],
    },
    {
      group: 'Sistema',
      items: [
        { key: 'usuario', label: 'Minha Conta' },
        { key: 'permissoes', label: 'Permissões' },
      ],
    },
  ],
};

export default function Permissoes() {
  const { user } = useAuth();
  return <PermissionDirectoryScreen apiFetch={apiFetch} authUser={user} config={config} styles={styles} />;
}
