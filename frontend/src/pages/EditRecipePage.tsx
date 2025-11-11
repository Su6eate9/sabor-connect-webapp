import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Select } from '@/components/Select';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { LoadingPage } from '@/components/LoadingSpinner';
import { FieldError } from '@/components/FieldError';
import { RecipePreview } from '@/components/RecipePreview';
import { ImageUploadProgress } from '@/components/ImageUploadProgress';
import { useFormValidation, validationRules as vr } from '@/hooks/useFormValidation';
import api from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import type { ApiResponse, Recipe, Ingredient } from '@/types';

export const EditRecipePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prepTimeMinutes: '',
    cookTimeMinutes: '',
    difficulty: 'MEDIUM' as 'EASY' | 'MEDIUM' | 'HARD',
    portions: '',
  });

  const [ingredients, setIngredients] = useState<Omit<Ingredient, 'id'>[]>([
    { name: '', quantity: '', unit: '' },
  ]);

  const [instructions, setInstructions] = useState<string[]>(['']);
  const [tags, setTags] = useState<string>('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Validation rules
  const validationRules = {
    title: [
      vr.required(),
      vr.minLength(5, 'O título deve ter pelo menos 5 caracteres'),
      vr.maxLength(100, 'O título deve ter no máximo 100 caracteres'),
    ],
    description: [
      vr.required(),
      vr.minLength(20, 'A descrição deve ter pelo menos 20 caracteres'),
      vr.maxLength(500, 'A descrição deve ter no máximo 500 caracteres'),
    ],
    prepTimeMinutes: [
      vr.required(),
      vr.min(1, 'Tempo de preparo deve ser maior que 0'),
      vr.max(1440, 'Tempo de preparo deve ser menor que 24 horas'),
    ],
    cookTimeMinutes: [
      vr.required(),
      vr.min(0, 'Tempo de cozimento não pode ser negativo'),
      vr.max(1440, 'Tempo de cozimento deve ser menor que 24 horas'),
    ],
    portions: [
      vr.required(),
      vr.min(1, 'Deve ter pelo menos 1 porção'),
      vr.max(100, 'Máximo de 100 porções'),
    ],
  };

  const { errors, touched, validateAll, handleBlur, handleChange } =
    useFormValidation(validationRules);

  // Fetch recipe
  const { data: recipeData, isLoading } = useQuery({
    queryKey: ['recipe', slug],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Recipe>>(`/recipes/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });

  const recipe = recipeData?.data;

  // Initialize form with recipe data
  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title,
        description: recipe.description,
        prepTimeMinutes: recipe.prepTimeMinutes.toString(),
        cookTimeMinutes: recipe.cookTimeMinutes.toString(),
        difficulty: recipe.difficulty,
        portions: recipe.portions.toString(),
      });

      if (recipe.ingredients && recipe.ingredients.length > 0) {
        setIngredients(
          recipe.ingredients.map(({ name, quantity, unit }) => ({ name, quantity, unit }))
        );
      }

      if (recipe.instructions && recipe.instructions.length > 0) {
        setInstructions(recipe.instructions);
      }

      if (recipe.tags && recipe.tags.length > 0) {
        setTags(recipe.tags.map((t) => t.name).join(', '));
      }

      if (recipe.coverImageUrl) {
        setImagePreview(recipe.coverImageUrl);
      }
    }
  }, [recipe]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('prepTimeMinutes', formData.prepTimeMinutes);
      formDataObj.append('cookTimeMinutes', formData.cookTimeMinutes);
      formDataObj.append('difficulty', formData.difficulty);
      formDataObj.append('portions', formData.portions);
      formDataObj.append('instructions', JSON.stringify(instructions.filter((i) => i.trim())));
      formDataObj.append('ingredients', JSON.stringify(ingredients.filter((i) => i.name)));

      if (tags.trim()) {
        formDataObj.append('tags', JSON.stringify(tags.split(',').map((t) => t.trim())));
      }

      if (coverImage) {
        formDataObj.append('coverImage', coverImage);
      }

      const response = await api.put<ApiResponse<Recipe>>(`/recipes/${recipe!.id}`, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (data) => {
      navigate(`/recipe/${data.data.slug}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Erro ao atualizar receita');
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    handleChange(name, value);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    handleBlur(name, value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageUploading(true);
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadstart = () => {
        setImageUploading(true);
      };
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        // Simula processamento da imagem
        setTimeout(() => {
          setImageUploading(false);
        }, 800);
      };
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações de campos básicos
    if (!validateAll(formData)) {
      setError('Por favor, corrija os erros antes de continuar');
      return;
    }

    // Validações de ingredientes e instruções
    const validIngredients = ingredients.filter((i) => i.name.trim());
    if (validIngredients.length === 0) {
      setError('Adicione pelo menos um ingrediente');
      return;
    }

    const validInstructions = instructions.filter((i) => i.trim());
    if (validInstructions.length === 0) {
      setError('Adicione pelo menos uma instrução');
      return;
    }

    // Show preview
    setShowPreview(true);
  };

  const handlePublish = () => {
    updateMutation.mutate();
    setShowPreview(false);
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!recipe) {
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Receita não encontrada</h1>
          <Button onClick={() => navigate(ROUTES.DASHBOARD)}>Voltar para o Dashboard</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container-custom max-w-4xl">
          <h1 className="text-4xl font-display font-bold mb-8 text-gray-900 dark:text-white">
            Editar Receita
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            {/* Informações Básicas */}
            <div className="card p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Informações Básicas
              </h2>

              <div className="space-y-6">
                <div>
                  <Input
                    id="title"
                    name="title"
                    label="Título da Receita"
                    required
                    placeholder="Ex: Brigadeiro de Chocolate"
                    value={formData.title}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className={touched.title && errors.title ? 'border-red-500' : ''}
                  />
                  {touched.title && <FieldError error={errors.title} />}
                </div>

                <div>
                  <Textarea
                    id="description"
                    name="description"
                    label="Descrição"
                    required
                    placeholder="Descreva sua receita de forma atrativa..."
                    value={formData.description}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    rows={4}
                    className={touched.description && errors.description ? 'border-red-500' : ''}
                  />
                  {touched.description && <FieldError error={errors.description} />}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      id="prepTimeMinutes"
                      name="prepTimeMinutes"
                      type="number"
                      label="Tempo de Preparo (minutos)"
                      required
                      placeholder="30"
                      value={formData.prepTimeMinutes}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      min="0"
                      className={
                        touched.prepTimeMinutes && errors.prepTimeMinutes ? 'border-red-500' : ''
                      }
                    />
                    {touched.prepTimeMinutes && <FieldError error={errors.prepTimeMinutes} />}
                  </div>

                  <div>
                    <Input
                      id="cookTimeMinutes"
                      name="cookTimeMinutes"
                      type="number"
                      label="Tempo de Cozimento (minutos)"
                      required
                      placeholder="45"
                      value={formData.cookTimeMinutes}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      min="0"
                      className={
                        touched.cookTimeMinutes && errors.cookTimeMinutes ? 'border-red-500' : ''
                      }
                    />
                    {touched.cookTimeMinutes && <FieldError error={errors.cookTimeMinutes} />}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Select
                    id="difficulty"
                    name="difficulty"
                    label="Dificuldade"
                    required
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, difficulty: e.target.value as any }))
                    }
                    options={[
                      { value: 'EASY', label: 'Fácil' },
                      { value: 'MEDIUM', label: 'Médio' },
                      { value: 'HARD', label: 'Difícil' },
                    ]}
                  />

                  <div>
                    <Input
                      id="portions"
                      name="portions"
                      type="number"
                      label="Porções"
                      required
                      placeholder="4"
                      value={formData.portions}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      min="1"
                      className={touched.portions && errors.portions ? 'border-red-500' : ''}
                    />
                    {touched.portions && <FieldError error={errors.portions} />}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (separadas por vírgula)
                  </label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="Ex: sobremesa, chocolate, festa"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Imagem de Capa */}
            <div className="card p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Imagem de Capa
              </h2>

              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={imageUploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <ImageUploadProgress isUploading={imageUploading} fileName={coverImage?.name} />

                {imagePreview && !imageUploading && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImage(null);
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Ingredientes */}
            <div className="card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ingredientes</h2>
                <Button type="button" onClick={addIngredient} variant="outline">
                  + Adicionar Ingrediente
                </Button>
              </div>

              <div className="space-y-4">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Nome do ingrediente"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        placeholder="Qtd"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        placeholder="Unidade"
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      />
                    </div>
                    {ingredients.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        variant="danger"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modo de Preparo */}
            <div className="card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Modo de Preparo
                </h2>
                <Button type="button" onClick={addInstruction} variant="outline">
                  + Adicionar Passo
                </Button>
              </div>

              <div className="space-y-4">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <Textarea
                        placeholder={`Passo ${index + 1}...`}
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        rows={2}
                      />
                    </div>
                    {instructions.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeInstruction(index)}
                        variant="danger"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => navigate(`/recipe/${recipe.slug}`)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="flex-1">
                {updateMutation.isPending ? 'Salvando...' : 'Pré-visualizar'}
              </Button>
            </div>
          </form>

          {/* Recipe Preview Modal */}
          <RecipePreview
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            recipe={{
              title: formData.title,
              description: formData.description,
              prepTime: parseInt(formData.prepTimeMinutes) || 0,
              cookTime: parseInt(formData.cookTimeMinutes) || 0,
              difficulty: formData.difficulty,
              servings: parseInt(formData.portions) || 0,
              ingredients: ingredients
                .filter((i) => i.name.trim())
                .map((i) => `${i.quantity} ${i.unit} ${i.name}`.trim()),
              instructions: instructions.filter((i) => i.trim()),
              tags: tags
                ? tags
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                : [],
              image: imagePreview || undefined,
            }}
            onEdit={() => setShowPreview(false)}
            onPublish={handlePublish}
            isPublishing={updateMutation.isPending}
          />
        </div>
      </div>
    </Layout>
  );
};
