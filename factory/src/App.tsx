import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ROUTES } from '@/routes';
import Login from '@/pages/Login/Login';
import Layout from '@/components/Layout/Layout';
import Funcionarios from '@/pages/Funcionarios/Funcionarios/Funcionarios';
import Contratantes from '@/pages/Contratantes/Contratantes/Contratantes';
import Eventos from '@/pages/Eventos/Eventos/Eventos';
import EstoqueInsumos from '@/pages/EstoqueInsumos/EstoqueInsumos/EstoqueInsumos';
import EstoqueUtensilios from '@/pages/EstoqueUtensilios/EstoqueUtensilios/EstoqueUtensilios';
import Permissoes from '@/pages/Permissoes/Permissoes/Permissoes';
import Financeiro from '@/pages/Financeiro/Financeiro/Financeiro';
import Tarefas from '@/pages/Tarefas/Tarefas/Tarefas';
import MinhaConta from '@/pages/MinhaConta/MinhaConta';

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
  const { user, loading } = useAuth();
  if (loading) return <AppLoading />;
  if (user?.isAdmin || user?.permissions?.includes(routeKey)) return <Outlet />;
  return <Navigate to={ROUTES.USUARIO} replace />;
}

function PublicRoute() {
  const { authenticated, loading } = useAuth();
  if (loading) return <AppLoading />;
  return authenticated ? <Navigate to={ROUTES.EVENTOS} replace /> : <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter basename="/fabrica">
      <ThemeProvider>
      <AuthProvider>
        <AppProvider>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path={ROUTES.LOGIN} element={<Login />} />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route element={<PermissionRoute routeKey="funcionarios" />}>
                <Route path={ROUTES.FUNCIONARIOS} element={<Funcionarios />} />
              </Route>
              <Route element={<PermissionRoute routeKey="contratantes" />}>
                <Route path={ROUTES.CONTRATANTES} element={<Contratantes />} />
              </Route>
              <Route element={<PermissionRoute routeKey="eventos" />}>
                <Route path={ROUTES.EVENTOS} element={<Eventos />} />
              </Route>
              <Route element={<PermissionRoute routeKey="estoque-insumos" />}>
                <Route path={ROUTES.ESTOQUE_INSUMOS} element={<EstoqueInsumos />} />
              </Route>
              <Route element={<PermissionRoute routeKey="estoque-utensilios" />}>
                <Route path={ROUTES.ESTOQUE_UTENSILIOS} element={<EstoqueUtensilios />} />
              </Route>
              <Route element={<PermissionRoute routeKey="__admin__" />}>
                <Route path={ROUTES.PERMISSOES} element={<Permissoes />} />
              </Route>
              <Route element={<PermissionRoute routeKey="financeiro" />}>
                <Route path={ROUTES.FINANCEIRO} element={<Financeiro />} />
              </Route>
              <Route element={<PermissionRoute routeKey="tarefas" />}>
                <Route path={ROUTES.TAREFAS} element={<Tarefas />} />
              </Route>
              <Route path={ROUTES.USUARIO} element={<MinhaConta />} />
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
