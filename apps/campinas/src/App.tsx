import { Spinner } from '../../../packages/pentagono/src/index';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ROUTES } from './routes';
import Login from './pages/Login/Login';
import Layout from './components/Layout/Layout';
import { ErrorBoundary } from '../../../packages/ui/src/index';
import { FranchiseProvider } from './franchise-context';
import { getFranchiseBasePath } from './franchise-path';

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Funcionarios = lazy(() => import('./pages/Funcionarios/Funcionarios'));
const Contratantes = lazy(() => import('./pages/Contratantes/Contratantes'));
const Eventos = lazy(() => import('./pages/Eventos/Eventos'));
const EventosStatus = lazy(() => import('./pages/Eventos/EventosStatus'));
const EstoqueInsumos = lazy(() => import('./pages/EstoqueInsumos/EstoqueInsumos'));
const EstoqueUtensilios = lazy(() => import('./pages/EstoqueUtensilios/EstoqueUtensilios'));
const Financeiro = lazy(() => import('./pages/Financeiro/Financeiro'));
const Tarefas = lazy(() => import('./pages/Tarefas/Tarefas'));
const ChecklistEnvio = lazy(() => import('./pages/ChecklistEnvio/ChecklistEnvio'));
const MinhaConta = lazy(() => import('./pages/MinhaConta/MinhaConta'));
const Cardapios = lazy(() => import('./pages/Cardapios/Cardapios'));
const Contratos = lazy(() => import('./pages/Contratos/Contratos'));
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

function PermissionRoute({ routeKey }: { routeKey: string | string[] }) {
  const { isAdmin, permissions, loading } = useAuth();
  if (loading) return <AppLoading />;
  const requiredKeys = Array.isArray(routeKey) ? routeKey : [routeKey];
  if (isAdmin || requiredKeys.some((key) => permissions.includes(key))) return <Outlet />;
  return <Navigate to={ROUTES.DASHBOARD} replace />;
}

function PublicRoute() {
  const { authenticated, loading } = useAuth();
  if (loading) return <AppLoading />;
  return authenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Outlet />;
}

export default function App() {
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname;
  const port = typeof window === 'undefined' ? '' : window.location.port;

  return (
    <ErrorBoundary>
      <BrowserRouter basename={getFranchiseBasePath(pathname, port)}>
        <ThemeProvider>
          <AuthProvider>
            <FranchiseProvider>
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
                        <Route element={<PermissionRoute routeKey="eventos" />}>
                          <Route path={ROUTES.EVENTOS} element={<Eventos />} />
                          <Route path={ROUTES.EVENTOS_STATUS} element={<EventosStatus />} />
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
                        <Route element={<PermissionRoute routeKey={['estoque-insumos', 'pedidos-insumos']} />}>
                          <Route path={ROUTES.ESTOQUE_INSUMOS} element={<EstoqueInsumos />} />
                          <Route
                            path={ROUTES.PEDIDOS_INSUMOS}
                            element={<Navigate to={`${ROUTES.ESTOQUE_INSUMOS}?tab=pedidos`} replace />}
                          />
                        </Route>
                        <Route element={<PermissionRoute routeKey="estoque-utensilios" />}>
                          <Route path={ROUTES.ESTOQUE_UTENSILIOS} element={<EstoqueUtensilios />} />
                        </Route>
                        <Route element={<PermissionRoute routeKey="usuario" />}>
                          <Route path={ROUTES.USUARIO} element={<MinhaConta />} />
                        </Route>
                        <Route path="/permissoes" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                        <Route element={<PermissionRoute routeKey="__admin__" />}>
                          <Route path={ROUTES.AUDITORIA} element={<Auditoria />} />
                        </Route>
                      </Route>
                    </Route>
                    <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
                  </Routes>
                </Suspense>
              </AppProvider>
            </FranchiseProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
