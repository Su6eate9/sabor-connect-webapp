import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { RecipeCard } from '@/components/RecipeCard';
import { SkeletonRecipeGrid } from '@/components/SkeletonRecipeGrid';
import { Pagination } from '@/components/Pagination';
import api from '@/lib/api';
import { Recipe, ApiResponse } from '@/types';

export const RecipesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || '');

  const page = parseInt(searchParams.get('page') || '1', 10);

  const { data, isLoading, error } = useQuery({
    queryKey: ['recipes', page, search, difficulty],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (search) params.append('search', search);
      if (difficulty) params.append('difficulty', difficulty);

      const response = await api.get<ApiResponse<Recipe[]>>(`/recipes?${params.toString()}`);
      return response.data;
    },
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (difficulty) params.append('difficulty', difficulty);
    params.append('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="bg-gray-50 dark:bg-gray-900 py-8 min-h-screen">
        <div className="container-custom">
          <h1 className="text-4xl font-display font-bold mb-8 text-gray-900 dark:text-white">
            Explorar Receitas
          </h1>

          <div className="card p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Buscar receitas..."
                  className="input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div>
                <select
                  className="input"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="">Todas as dificuldades</option>
                  <option value="EASY">Fácil</option>
                  <option value="MEDIUM">Médio</option>
                  <option value="HARD">Difícil</option>
                </select>
              </div>
            </div>
            <button onClick={handleSearch} className="btn-primary mt-4">
              Buscar
            </button>
          </div>

          {isLoading && <SkeletonRecipeGrid count={6} />}

          {error && <div className="text-center py-12 text-red-600">Erro ao carregar receitas</div>}

          {data && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {data.data.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>

              {data.meta && data.meta.totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={data.meta.totalPages}
                  onPageChange={handlePageChange}
                  totalItems={data.meta.total}
                  itemsPerPage={data.meta.limit}
                />
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};
