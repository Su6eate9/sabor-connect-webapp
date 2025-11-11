import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { RecipeCard } from '@/components/RecipeCard';
import { SkeletonRecipeGrid } from '@/components/SkeletonRecipeGrid';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { AdvancedFilters, FilterValues } from '@/components/AdvancedFilters';
import { VoiceSearch } from '@/components/VoiceSearch';
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

  const handleApplyFilters = (filters: FilterValues) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.prepTime) params.append('prepTime', filters.prepTime);
    if (filters.portions) params.append('portions', filters.portions);
    params.append('page', '1');
    setSearchParams(params);

    // Update local state
    if (filters.difficulty) setDifficulty(filters.difficulty);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearch('');
    setDifficulty('');
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
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Buscar receitas..."
                  className="input flex-1"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <VoiceSearch onResult={(text) => setSearch(text)} />
              </div>
              <div className="flex gap-3">
                <AdvancedFilters onApply={handleApplyFilters} onReset={handleResetFilters} />
                <button onClick={handleSearch} className="btn-primary px-8">
                  Buscar
                </button>
              </div>
            </div>
          </div>

          {isLoading && <SkeletonRecipeGrid count={6} />}

          {error && <div className="text-center py-12 text-red-600">Erro ao carregar receitas</div>}

          {data && (
            <>
              {data.data.length === 0 ? (
                <EmptyState
                  icon="🍳"
                  title="Nenhuma receita encontrada"
                  description={
                    search || difficulty
                      ? 'Tente ajustar os filtros ou fazer uma nova busca.'
                      : 'Seja o primeiro a compartilhar uma receita!'
                  }
                  action={
                    (search || difficulty) && (
                      <button onClick={handleResetFilters} className="btn-primary">
                        Limpar Filtros
                      </button>
                    )
                  }
                />
              ) : (
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
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};
