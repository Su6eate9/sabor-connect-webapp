import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/lib/constants';
import { Loading } from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // Se true, requer autenticação. Se false, redireciona se autenticado
}

export const ProtectedRoute = ({ children, requireAuth = true }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  // Se requer autenticação mas não está autenticado
  if (requireAuth && !isAuthenticated) {
    // Salva a rota atual para redirecionar depois do login
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Se NÃO requer autenticação (páginas públicas) mas está autenticado
  if (!requireAuth && isAuthenticated) {
    // Redireciona para dashboard se tentar acessar login/register estando logado
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};
