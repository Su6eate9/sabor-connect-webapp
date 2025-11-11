import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ToastProvider';
import { Layout } from '@/components/Layout';
import { LoadingPage } from '@/components/LoadingSpinner';
import { Button } from '@/components/Button';
import { Textarea } from '@/components/Textarea';
import { Alert } from '@/components/Alert';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ShareButtons } from '@/components/ShareButtons';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CookingMode } from '@/components/CookingMode';
import api from '@/lib/api';
import { Recipe, Comment, ApiResponse } from '@/types';
import { ROUTES, DIFFICULTY_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export const RecipeDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [commentContent, setCommentContent] = useState('');
  const [error, setError] = useState('');
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCookingMode, setShowCookingMode] = useState(false);

  // Fetch recipe
  const { data: recipeData, isLoading: loadingRecipe } = useQuery({
    queryKey: ['recipe', slug],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Recipe>>(`/recipes/${slug}`);
      return response.data;
    },
  });

  const recipe = recipeData?.data;

  // Fetch comments
  const { data: commentsData, isLoading: loadingComments } = useQuery({
    queryKey: ['comments', recipe?.id],
    queryFn: async () => {
      if (!recipe?.id) return null;
      const response = await api.get<ApiResponse<Comment[]>>(`/recipes/${recipe.id}/comments`);
      return response.data;
    },
    enabled: !!recipe?.id,
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!recipe?.id) return;
      if (recipe.isLiked) {
        await api.delete(`/recipes/${recipe.id}/like`);
        return 'unliked';
      } else {
        await api.post(`/recipes/${recipe.id}/like`);
        return 'liked';
      }
    },
    onSuccess: (action) => {
      queryClient.invalidateQueries({ queryKey: ['recipe', slug] });
      if (action === 'liked') {
        showToast('Receita curtida! ❤️', 'like');
      } else {
        showToast('Curtida removida', 'info');
      }
    },
  });

  // Favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!recipe?.id) return;
      if (recipe.isFavorited) {
        await api.delete(`/recipes/${recipe.id}/favorite`);
        return 'unfavorited';
      } else {
        await api.post(`/recipes/${recipe.id}/favorite`);
        return 'favorited';
      }
    },
    onSuccess: (action) => {
      queryClient.invalidateQueries({ queryKey: ['recipe', slug] });
      if (action === 'favorited') {
        showToast('Adicionado aos favoritos! ⭐', 'favorite');
      } else {
        showToast('Removido dos favoritos', 'info');
      }
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post<ApiResponse<Comment>>(`/recipes/${recipe!.id}/comments`, {
        content,
      });
      return response.data;
    },
    onSuccess: () => {
      setCommentContent('');
      queryClient.invalidateQueries({ queryKey: ['comments', recipe?.id] });
      showToast('Comentário adicionado com sucesso! 💬', 'success');
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.error?.message || 'Erro ao adicionar comentário';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await api.delete(`/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', recipe?.id] });
      showToast('Comentário excluído', 'info');
    },
  });

  // Delete recipe mutation
  const deleteRecipeMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/recipes/${recipe!.id}`);
    },
    onSuccess: () => {
      showToast('Receita excluída com sucesso', 'success');
      navigate(ROUTES.DASHBOARD);
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    likeMutation.mutate();
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    favoriteMutation.mutate();
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (commentContent.trim().length < 3) {
      setError('O comentário deve ter pelo menos 3 caracteres');
      return;
    }

    commentMutation.mutate(commentContent);
  };

  const handleDeleteRecipe = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteRecipeMutation.mutate();
    setShowDeleteDialog(false);
  };

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  if (loadingRecipe) {
    return <LoadingPage />;
  }

  if (!recipe) {
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Receita não encontrada</h1>
          <Link to={ROUTES.RECIPES}>
            <Button>Voltar para receitas</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isAuthor = user?.id === recipe.authorId;

  return (
    <Layout>
      <div className="bg-gray-50 dark:bg-gray-900">
        {/* Breadcrumbs */}
        <div className="container-custom pt-4">
          <Breadcrumbs
            items={[
              { label: 'Home', href: ROUTES.HOME },
              { label: 'Receitas', href: ROUTES.RECIPES },
              { label: recipe.title },
            ]}
          />
        </div>

        {/* Hero Image */}
        <div className="relative h-96 bg-gradient-to-b from-gray-900 to-transparent">
          {recipe.coverImageUrl ? (
            <>
              <img
                src={recipe.coverImageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary" />
          )}
        </div>

        <div className="container-custom -mt-32 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Title Card */}
            <div className="card p-8 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-display font-bold mb-4 text-gray-900 dark:text-white">
                    {recipe.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                    {recipe.description}
                  </p>

                  {/* Tags */}
                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {recipe.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {isAuthor && (
                  <div className="flex gap-2">
                    <Link to={`/recipe/edit/${recipe.slug}`}>
                      <Button variant="outline">Editar</Button>
                    </Link>
                    <Button variant="danger" onClick={handleDeleteRecipe}>
                      Excluir
                    </Button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Button
                  onClick={handleLike}
                  variant={recipe.isLiked ? 'primary' : 'outline'}
                  className={recipe.isLiked ? 'animate-pulse-heart' : ''}
                >
                  {recipe.isLiked ? '❤️' : '🤍'} {recipe._count?.likes || 0} Curtidas
                </Button>

                <Button
                  onClick={handleFavorite}
                  variant={recipe.isFavorited ? 'primary' : 'outline'}
                >
                  {recipe.isFavorited ? '⭐' : '☆'}{' '}
                  {recipe.isFavorited ? 'Favoritado' : 'Favoritar'}
                </Button>

                <ShareButtons
                  url={window.location.href}
                  title={recipe.title}
                  description={recipe.description}
                />
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 py-4 border-t border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tempo Total</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl">🍽️</span>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Porções</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{recipe.portions}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Dificuldade</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {DIFFICULTY_LABELS[recipe.difficulty]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl">👁️</span>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Visualizações</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {recipe.viewCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Author & Actions */}
              <div className="flex items-center justify-between mt-4">
                <Link
                  to={`/profile/${recipe.author.id}`}
                  className="flex items-center gap-3 hover:opacity-80"
                >
                  {recipe.author.avatarUrl ? (
                    <img
                      src={recipe.author.avatarUrl}
                      alt={recipe.author.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                      {recipe.author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {recipe.author.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(recipe.createdAt)}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      recipe.isLiked
                        ? 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="text-xl">{recipe.isLiked ? '❤️' : '🤍'}</span>
                    <span className="font-semibold">{recipe._count?.likes || 0}</span>
                  </button>

                  <button
                    onClick={handleFavorite}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      recipe.isFavorited
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="text-xl">{recipe.isFavorited ? '⭐' : '☆'}</span>
                    <span className="font-semibold">
                      {recipe.isFavorited ? 'Favoritado' : 'Favoritar'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="card p-8 mb-8">
              <h2 className="text-2xl font-display font-bold mb-6 text-gray-900 dark:text-white">
                Ingredientes
              </h2>
              <div className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <label
                    key={ingredient.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checkedIngredients.has(index)}
                      onChange={() => toggleIngredient(index)}
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span
                      className={`flex-1 ${
                        checkedIngredients.has(index)
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      <span className="font-semibold">
                        {ingredient.quantity} {ingredient.unit}
                      </span>{' '}
                      {ingredient.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="card p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                  Modo de Preparo
                </h2>
                <Button
                  onClick={() => setShowCookingMode(true)}
                  className="flex items-center space-x-2"
                >
                  <span>👨‍🍳</span>
                  <span>Modo Cozinhando</span>
                </Button>
              </div>
              <div className="space-y-6">
                {recipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary dark:bg-primary-600 text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {instruction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="card p-8">
              <h2 className="text-2xl font-display font-bold mb-6 text-gray-900 dark:text-white">
                Comentários ({recipe._count?.comments || 0})
              </h2>

              {/* Comment Form */}
              {isAuthenticated ? (
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  {error && (
                    <Alert
                      type="error"
                      message={error}
                      onClose={() => setError('')}
                      className="mb-4"
                    />
                  )}
                  <Textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Deixe seu comentário sobre esta receita..."
                    rows={3}
                    className="mb-3"
                  />
                  <Button
                    type="submit"
                    disabled={commentMutation.isPending || !commentContent.trim()}
                  >
                    {commentMutation.isPending ? 'Enviando...' : 'Comentar'}
                  </Button>
                </form>
              ) : (
                <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-3">Faça login para comentar</p>
                  <Link to={ROUTES.LOGIN}>
                    <Button>Fazer Login</Button>
                  </Link>
                </div>
              )}

              {/* Comments List */}
              {loadingComments ? (
                <p className="text-center text-gray-600 dark:text-gray-400">
                  Carregando comentários...
                </p>
              ) : commentsData?.data && commentsData.data.length > 0 ? (
                <div className="space-y-6">
                  {commentsData.data.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <Link to={`/profile/${comment.author.id}`}>
                        {comment.author.avatarUrl ? (
                          <img
                            src={comment.author.avatarUrl}
                            alt={comment.author.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary dark:bg-primary-600 text-white flex items-center justify-center font-semibold">
                            {comment.author.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <Link
                              to={`/profile/${comment.author.id}`}
                              className="font-semibold text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary-400"
                            >
                              {comment.author.name}
                            </Link>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          {user?.id === comment.authorId && (
                            <button
                              onClick={() => deleteCommentMutation.mutate(comment.id)}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Excluir
                            </button>
                          )}
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600">
                  Nenhum comentário ainda. Seja o primeiro!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Excluir Receita"
        message="Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita."
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        type="danger"
        loading={deleteRecipeMutation.isPending}
      />

      {/* Cooking Mode */}
      <CookingMode
        isOpen={showCookingMode}
        onClose={() => setShowCookingMode(false)}
        instructions={recipe.instructions}
        recipeTitle={recipe.title}
      />
    </Layout>
  );
};
