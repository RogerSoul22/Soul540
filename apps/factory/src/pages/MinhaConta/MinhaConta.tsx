import { AccountScreen } from '@soul540/screens';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '@soul540/ui';
import { apiFetch } from '../../lib/api';
import styles from './styles/MinhaConta.module.scss';

export default function MinhaConta() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  return <AccountScreen apiFetch={apiFetch} isDark={isDark} styles={styles} toggleTheme={toggleTheme} user={user} />;
}
