import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { RecipeCard } from '@/components/RecipeCard';
import { SkeletonRecipeGrid } from '@/components/SkeletonRecipeGrid';
import { EmptyState } from '@/components/EmptyState';
import { StatCard } from '@/components/StatCard';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { Button } from '@/components/Button';
import api from '@/lib/api';
import { Recipe, ApiResponse } from '@/types';
import { ROUTES } from '@/lib/constants';

export const DashboardPage = () => {
  const { user } = useAuth();

  const { data: myRecipes, isLoading: loadingRecipes } = useQuery({
    queryKey: ['my-recipes'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Recipe[]>>(`/recipes/user/${user?.id}?limit=6`);
      return response.data;
    },
  });

  const { data: favorites, isLoading: loadingFavorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Recipe[]>>(`/favorites?limit=6`);
      return response.data;
    },
  });

  // Mock activities (would come from backend in production)
  const recentActivities = [
    ...(myRecipes?.data?.slice(0, 3).map((recipe) => ({
      id: `recipe-${recipe.id}`,
      type: 'recipe_created' as const,
      title: 'Nova receita publicada',
      description: recipe.title,
      timestamp: new Date(recipe.createdAt),
      icon: '📖',
      color: 'bg-primary',
    })) || []),
    ...(favorites?.data?.slice(0, 2).map((recipe) => ({
      id: `fav-${recipe.id}`,
      type: 'recipe_favorited' as const,
      title: 'Receita favoritada',
      description: recipe.title,
      timestamp: new Date(recipe.createdAt),
      icon: '❤️',
      color: 'bg-red-500',
    })) || []),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

  return (
    <Layout>
      <div className="bg-gray-50 dark:bg-gray-900 py-8 min-h-screen">
        <div className="container-custom">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary dark:from-primary-600 dark:to-secondary-600 rounded-xl p-8 mb-8 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-display font-bold mb-2">
                  Olá, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-white/90 text-lg">
                  Bem-vindo ao seu dashboard. Continue criando receitas incríveis!
                </p>
              </div>
              <Link to={ROUTES.RECIPE_CREATE}>
                <Button
                  variant="outline"
                  className="bg-white text-primary border-white hover:bg-gray-100"
                >
                  + Nova Receita
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatCard
              label="Minhas Receitas"
              value={user?._count?.recipes || 0}
              icon="📖"
              color="primary"
            />
            <StatCard
              label="Favoritos"
              value={user?._count?.favorites || 0}
              icon="❤️"
              color="danger"
            />
            <StatCard
              label="Curtidas Recebidas"
              value={user?._count?.likes || 0}
              icon="👍"
              color="success"
            />
          </div>

          {/* Minhas Receitas */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                Minhas Receitas
              </h2>
              <Link to={`/profile/${user?.id}`}>
                <Button variant="outline">Ver todas</Button>
              </Link>
            </div>

            {loadingRecipes ? (
              <SkeletonRecipeGrid count={3} />
            ) : myRecipes?.data && myRecipes.data.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myRecipes.data.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="📝"
                title="Nenhuma receita ainda"
                description="Comece compartilhando sua primeira receita com a comunidade!"
                action={
                  <Link to={ROUTES.RECIPE_CREATE}>
                    <Button>Criar Primeira Receita</Button>
                  </Link>
                }
              />
            )}
          </section>

          {/* Favoritos */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                Receitas Favoritas
              </h2>
              <Link to={ROUTES.FAVORITES}>
                <Button variant="outline">Ver todas</Button>
              </Link>
            </div>

            {loadingFavorites ? (
              <SkeletonRecipeGrid count={3} />
            ) : favorites?.data && favorites.data.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.data.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="❤️"
                title="Nenhum favorito ainda"
                description="Explore receitas e salve suas favoritas para acessar rapidamente!"
                action={
                  <Link to={ROUTES.RECIPES}>
                    <Button>Explorar Receitas</Button>
                  </Link>
                }
              />
            )}
          </section>

          {/* Activity Timeline */}
          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-6 text-gray-900 dark:text-white">
              Atividades Recentes
            </h2>
            <div className="card p-6">
              <ActivityTimeline activities={recentActivities} />
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};
