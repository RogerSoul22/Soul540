import { Spinner } from '../../../packages/pentagono/src/index';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from '../../../packages/ui/src/index';
import { ROUTES } from './routes';
import Login from './pages/Login/Login';
import Layout from './components/Layout/Layout';
import { ErrorBoundary } from '../../../packages/ui/src/index';
import { getFactoryBasePath } from './factory-path';

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Funcionarios = lazy(() => import('./pages/Funcionarios/Funcionarios'));
const Contratantes = lazy(() => import('./pages/Contratantes/Contratantes'));
const Eventos = lazy(() => import('./pages/Eventos/Eventos'));
const EstoqueInsumos = lazy(() => import('./pages/EstoqueInsumos/EstoqueInsumos'));
const EstoqueUtensilios = lazy(() => import('./pages/EstoqueUtensilios/EstoqueUtensilios'));
const Permissoes = lazy(() => import('./pages/Permissoes/Permissoes'));
const Financeiro = lazy(() => import('./pages/Financeiro/Financeiro'));
const Tarefas = lazy(() => import('./pages/Tarefas/Tarefas'));
const ChecklistEnvio = lazy(() => import('./pages/ChecklistEnvio/ChecklistEnvio'));
const MinhaConta = lazy(() => import('./pages/MinhaConta/MinhaConta'));
const Auditoria = lazy(() => import('./pages/Auditoria/Auditoria'));

function AppLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
      }}
    >
      <Spinner />
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
  return authenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Outlet />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={getFactoryBasePath()}>
        <ThemeProvider>
          <AuthProvider>
            <AppProvider>
              <Suspense fallback={<AppLoading />}>
                <Routes>
                  <Route element={<PublicRoute />}>
                    <Route path={ROUTES.LOGIN} element={<Login />} />
                  </Route>
                  <Route path={ROUTES.CHECKLIST_ENVIO} element={<ChecklistEnvio />} />
                  <Route element={<PrivateRoute />}>
                    <Route element={<Layout />}>
                      <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
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
                        <Route path={ROUTES.AUDITORIA} element={<Auditoria />} />
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
              </Suspense>
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
