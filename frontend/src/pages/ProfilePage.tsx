import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { RecipeCard } from '@/components/RecipeCard';
import { LoadingPage } from '@/components/LoadingSpinner';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { User, Recipe, ApiResponse } from '@/types';
import { ROUTES } from '@/lib/constants';

export const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();

  const isOwnProfile = currentUser?.id === userId;

  // Fetch user profile
  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<User>>(`/users/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });

  // Fetch user recipes
  const { data: recipesData, isLoading: loadingRecipes } = useQuery({
    queryKey: ['user-recipes', userId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Recipe[]>>(`/recipes/user/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });

  if (loadingUser) {
    return <LoadingPage />;
  }

  if (!userData?.data) {
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Usuário não encontrado</h1>
          <Link to={ROUTES.RECIPES}>
            <Button>Voltar para receitas</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const user = userData.data;
  const recipes = recipesData?.data || [];

  return (
    <Layout>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Breadcrumbs */}
        <div className="container-custom pt-4">
          <Breadcrumbs
            items={[
              { label: 'Home', href: ROUTES.HOME },
              { label: isOwnProfile ? 'Meu Perfil' : user.name },
            ]}
          />
        </div>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary to-secondary dark:from-primary-600 dark:to-secondary-600 py-12 mb-8">
          <div className="container-custom">
            <div className="flex items-center gap-8">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-white text-primary flex items-center justify-center text-5xl font-bold border-4 border-white shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 text-white">
                <h1 className="text-4xl font-display font-bold mb-2">{user.name}</h1>
                {user.bio && <p className="text-white/90 text-lg mb-4">{user.bio}</p>}

                <div className="flex items-center gap-6">
                  <div>
                    <span className="font-bold text-2xl">{user._count?.recipes || 0}</span>
                    <span className="text-white/90 ml-2">Receitas</span>
                  </div>
                  <div>
                    <span className="font-bold text-2xl">{user._count?.favorites || 0}</span>
                    <span className="text-white/90 ml-2">Favoritos</span>
                  </div>
                  <div>
                    <span className="font-bold text-2xl">{user._count?.likes || 0}</span>
                    <span className="text-white/90 ml-2">Curtidas</span>
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <div>
                  <Link to={ROUTES.RECIPE_CREATE}>
                    <Button
                      variant="outline"
                      className="bg-white text-primary border-white hover:bg-gray-100"
                    >
                      + Nova Receita
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recipes Section */}
        <div className="container-custom pb-12">
          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold mb-2 text-gray-900 dark:text-white">
              {isOwnProfile ? 'Minhas Receitas' : `Receitas de ${user.name.split(' ')[0]}`}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {recipes.length > 0
                ? `${recipes.length} ${recipes.length === 1 ? 'receita publicada' : 'receitas publicadas'}`
                : 'Nenhuma receita publicada ainda'}
            </p>
          </div>

          {loadingRecipes ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Carregando receitas...</p>
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📖"
              title="Nenhuma receita publicada"
              description={
                isOwnProfile
                  ? 'Comece compartilhando sua primeira receita com a comunidade!'
                  : 'Este usuário ainda não publicou nenhuma receita.'
              }
              action={
                isOwnProfile && (
                  <Link to={ROUTES.RECIPE_CREATE}>
                    <Button>Criar Primeira Receita</Button>
                  </Link>
                )
              }
            />
          )}
        </div>
      </div>
    </Layout>
  );
};
