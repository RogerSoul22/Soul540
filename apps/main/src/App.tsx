import { Spinner } from '../../../packages/pentagono/src/index';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '../../../packages/ui/src/index';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { useAuth } from './hooks/useAuth';
import { ROUTES } from './routes';
import Login from './pages/Login/Login';
import Layout from './components/Layout/Layout';
import { ErrorBoundary } from '../../../packages/ui/src/index';

const Auditoria = lazy(() => import('./pages/Auditoria/Auditoria'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Financeiro = lazy(() => import('./pages/Financeiro/Financeiro'));
const NotasFiscais = lazy(() => import('./pages/NotasFiscais/NotasFiscais'));
const Usuario = lazy(() => import('./pages/Usuario/Usuario'));
const Eventos = lazy(() => import('./pages/Eventos/Eventos'));
const Tarefas = lazy(() => import('./pages/Tarefas/Tarefas'));
const ChecklistEnvio = lazy(() => import('./pages/ChecklistEnvio/ChecklistEnvio'));
const Funcionarios = lazy(() => import('./pages/Funcionarios/Funcionarios'));
const Contratantes = lazy(() => import('./pages/Contratantes/Contratantes'));
const Contratos = lazy(() => import('./pages/Contratos/Contratos'));
const Franquias = lazy(() => import('./pages/Franquias/Franquias'));
const Cardapios = lazy(() => import('./pages/Cardapios/Cardapios'));
const EstoqueInsumos = lazy(() => import('./pages/EstoqueInsumos/EstoqueInsumos'));
const EstoqueUtensilios = lazy(() => import('./pages/EstoqueUtensilios/EstoqueUtensilios'));
const Chat = lazy(() => import('./pages/Chat/Chat'));
const Permissoes = lazy(() => import('./pages/Permissoes/Permissoes'));

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
  const { permissions, isAdmin, loading } = useAuth();
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
    <ErrorBoundary>
      <BrowserRouter>
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
                      <Route element={<PermissionRoute routeKey="financeiro" />}>
                        <Route path={ROUTES.FINANCEIRO} element={<Financeiro />} />
                      </Route>
                      <Route element={<PermissionRoute routeKey="notas-fiscais" />}>
                        <Route path={ROUTES.NOTAS_FISCAIS} element={<NotasFiscais />} />
                      </Route>
                      <Route element={<PermissionRoute routeKey="usuario" />}>
                        <Route path={ROUTES.USUARIO} element={<Usuario />} />
                      </Route>
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
                      <Route element={<PermissionRoute routeKey="franquias" />}>
                        <Route path={ROUTES.FRANQUIAS} element={<Franquias />} />
                      </Route>
                      <Route element={<PermissionRoute routeKey="cardapios" />}>
                        <Route path={ROUTES.CARDAPIOS} element={<Cardapios />} />
                      </Route>
                      <Route element={<PermissionRoute routeKey="estoque-insumos" />}>
                        <Route path={ROUTES.ESTOQUE_INSUMOS} element={<EstoqueInsumos />} />
                      </Route>
                      <Route element={<PermissionRoute routeKey="estoque-utensilios" />}>
                        <Route path={ROUTES.ESTOQUE_UTENSILIOS} element={<EstoqueUtensilios />} />
                      </Route>
                      <Route element={<PermissionRoute routeKey="chat" />}>
                        <Route path={ROUTES.CHAT} element={<Chat />} />
                      </Route>
                      <Route element={<PermissionRoute routeKey="__admin__" />}>
                        <Route path={ROUTES.PERMISSOES} element={<Permissoes />} />
                        <Route path={ROUTES.AUDITORIA} element={<Auditoria />} />
                      </Route>
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
