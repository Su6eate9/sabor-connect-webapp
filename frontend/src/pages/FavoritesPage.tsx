import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { RecipeCard } from '@/components/RecipeCard';
import { LoadingPage } from '@/components/LoadingSpinner';
import { Button } from '@/components/Button';
import api from '@/lib/api';
import { Recipe, ApiResponse } from '@/types';
import { ROUTES } from '@/lib/constants';

export const FavoritesPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Recipe[]>>('/favorites');
      return response.data;
    },
  });

  if (isLoading) {
    return <LoadingPage />;
  }

  const favorites = data?.data || [];

  return (
    <Layout>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2 text-gray-900 dark:text-white">
              Minhas Receitas Favoritas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {favorites.length > 0
                ? `Você tem ${favorites.length} ${favorites.length === 1 ? 'receita favorita' : 'receitas favoritas'}`
                : 'Você ainda não tem receitas favoritas'}
            </p>
          </div>

          {favorites.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="card p-16 text-center">
              <div className="text-8xl mb-6">❤️</div>
              <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                Nenhuma receita favorita
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Explore o catálogo e favorite as receitas que você mais gosta para acessá-las
                rapidamente aqui!
              </p>
              <Link to={ROUTES.RECIPES}>
                <Button>Explorar Receitas</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
