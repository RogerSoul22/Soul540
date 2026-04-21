import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ROUTES } from '@/routes';
import Login from '@/pages/Login/Login';
import Layout from '@/components/Layout/Layout';
import Dashboard from '@/pages/Dashboard/Dashboard';
import Funcionarios from '@/pages/Funcionarios/Funcionarios';
import Contratantes from '@/pages/Contratantes/Contratantes';
import Eventos from '@/pages/Eventos/Eventos';
import EstoqueInsumos from '@/pages/EstoqueInsumos/EstoqueInsumos';
import EstoqueUtensilios from '@/pages/EstoqueUtensilios/EstoqueUtensilios';
import Permissoes from '@/pages/Permissoes/Permissoes';
import Financeiro from '@/pages/Financeiro/Financeiro';
import Tarefas from '@/pages/Tarefas/Tarefas';
import MinhaConta from '@/pages/MinhaConta/MinhaConta';
import Cardapios from '@/pages/Cardapios/Cardapios';
import Contratos from '@/pages/Contratos/Contratos';

function AppLoading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function PrivateRoute() {
  const { authenticated, loading } = useAuth();
  if (loading) return <AppLoading />;
  return authenticated ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
}

function PermissionRoute({ routeKey }: { routeKey: string }) {
  const { isAdmin, permissions, loading } = useAuth();
  if (loading) return <AppLoading />;
  if (isAdmin || permissions.includes(routeKey)) return <Outlet />;
  return <Navigate to={ROUTES.DASHBOARD} replace />;
}

function PublicRoute() {
  const { authenticated, loading } = useAuth();
  if (loading) return <AppLoading />;
  return authenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter basename="/franquia">
      <ThemeProvider>
      <AuthProvider>
        <AppProvider>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path={ROUTES.LOGIN} element={<Login />} />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
              <Route element={<PermissionRoute routeKey="eventos" />}>
                <Route path={ROUTES.EVENTOS} element={<Eventos />} />
              </Route>
              <Route element={<PermissionRoute routeKey="tarefas" />}>
                <Route path={ROUTES.TAREFAS} element={<Tarefas />} />
              </Route>
              <Route element={<PermissionRoute routeKey="funcionarios" />}>
                <Route path={ROUTES.FUNCIONARIOS} element={<Funcionarios />} />
              </Route>
              <Route element={<PermissionRoute routeKey="contratantes" />}>
                <Route path={ROUTES.CONTRATANTES} element={<Contratantes />} />
              </Route>
              <Route element={<PermissionRoute routeKey="contratos" />}>
                <Route path={ROUTES.CONTRATOS} element={<Contratos />} />
              </Route>
              <Route element={<PermissionRoute routeKey="cardapios" />}>
                <Route path={ROUTES.CARDAPIOS} element={<Cardapios />} />
              </Route>
              <Route element={<PermissionRoute routeKey="financeiro" />}>
                <Route path={ROUTES.FINANCEIRO} element={<Financeiro />} />
              </Route>
              <Route element={<PermissionRoute routeKey="estoque-insumos" />}>
                <Route path={ROUTES.ESTOQUE_INSUMOS} element={<EstoqueInsumos />} />
              </Route>
              <Route element={<PermissionRoute routeKey="estoque-utensilios" />}>
                <Route path={ROUTES.ESTOQUE_UTENSILIOS} element={<EstoqueUtensilios />} />
              </Route>
              <Route element={<PermissionRoute routeKey="usuario" />}>
                <Route path={ROUTES.USUARIO} element={<MinhaConta />} />
              </Route>
              <Route element={<PermissionRoute routeKey="__admin__" />}>
                <Route path={ROUTES.PERMISSOES} element={<Permissoes />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
        </AppProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
