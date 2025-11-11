import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ROUTES } from '@/lib/constants';

export const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/50 sticky top-0 z-50 transition-colors duration-200">
      <nav className="container-custom py-4">
        <div className="flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center space-x-2">
            <span className="text-2xl">🍳</span>
            <span className="text-2xl font-display font-bold text-primary">SaborConnect</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to={ROUTES.RECIPES}
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition"
            >
              Receitas
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to={ROUTES.DASHBOARD}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-400 transition"
                >
                  Dashboard
                </Link>
                <Link
                  to={ROUTES.FAVORITES}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-400 transition"
                >
                  Favoritos
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Link to={ROUTES.RECIPE_CREATE} className="btn-primary">
                  Nova Receita
                </Link>
                <Link
                  to={`/profile/${user?.id}`}
                  className="flex items-center space-x-2 hover:opacity-80 transition"
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {user?.name[0].toUpperCase()}
                    </div>
                  )}
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400 transition"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className="btn-outline">
                  Entrar
                </Link>
                <Link to={ROUTES.REGISTER} className="btn-primary">
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
