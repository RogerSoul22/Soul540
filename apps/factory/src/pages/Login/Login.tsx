import { UnitLoginScreen, type UnitLoginFeature } from '../../../../../packages/screens/src/index';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../routes';
import styles from './styles/Login.module.scss';

const factoryFeatures: UnitLoginFeature[] = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    text: 'Gestão de insumos e utensílios',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    text: 'Acompanhamento de eventos de produção',
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
    text: 'Equipe e fornecedores da unidade',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  return (
    <UnitLoginScreen
      description="Central de operações para produção, estoque e controle da unidade fabril."
      features={factoryFeatures}
      loading={loading}
      login={login}
      onSuccess={() => navigate(ROUTES.EVENTOS)}
      styles={styles}
      unitName="Fábrica"
    />
  );
}
