import { AccountScreen } from '../../../../../packages/screens/src/index';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../../../../packages/ui/src/index';
import { apiFetch } from '../../lib/api';
import styles from './styles/MinhaConta.module.scss';

export default function MinhaConta() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  return <AccountScreen apiFetch={apiFetch} isDark={isDark} styles={styles} toggleTheme={toggleTheme} user={user} />;
}
