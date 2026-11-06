import { UnitLoginScreen, type UnitLoginFeature } from '../../../../../packages/screens/src/index';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../routes';
import styles from './styles/Login.module.scss';

const franchiseFeatures: UnitLoginFeature[] = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    text: 'Gestão de eventos',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    text: 'Controle de equipe e contratantes',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    text: 'Financeiro e relatórios em tempo real',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  return (
    <UnitLoginScreen
      description="Gerencie sua unidade com controle total sobre eventos, equipe e finanças."
      features={franchiseFeatures}
      loading={loading}
      login={login}
      onSuccess={() => navigate(ROUTES.DASHBOARD)}
      styles={styles}
      unitName="Campinas"
    />
  );
}
