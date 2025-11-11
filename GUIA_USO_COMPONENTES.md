# 📚 Guia de Uso - Componentes UI/UX Sabor Connect

Este guia fornece exemplos práticos de como usar cada componente criado para o projeto Sabor Connect.

---

## 🎯 Índice

1. [Componentes de Loading](#loading)
2. [Componentes de Formulário](#formulários)
3. [Componentes de Navegação](#navegação)
4. [Componentes de Feedback](#feedback)
5. [Componentes de Filtros e Busca](#filtros-e-busca)
6. [Componentes de Receitas](#receitas)
7. [Hooks Customizados](#hooks)

---

## 🔄 Loading

### SkeletonCard

```tsx
import { SkeletonCard } from '@/components/SkeletonCard';

// Uso básico
<SkeletonCard />;
```

### SkeletonRecipeGrid

```tsx
import { SkeletonRecipeGrid } from '@/components/SkeletonRecipeGrid';

// Grid com 6 skeleton cards
<SkeletonRecipeGrid count={6} />

// Grid com 9 cards
<SkeletonRecipeGrid count={9} />
```

### Loading

```tsx
import { Loading } from '@/components/Loading';

// Spinner padrão
<Loading />

// Dots animados, tamanho grande
<Loading variant="dots" size="lg" />

// Pulse com texto
<Loading variant="pulse" text="Carregando receitas..." />

// Bars em modo fullscreen
<Loading variant="bars" size="xl" fullScreen />
```

**Variantes:** `spinner` | `dots` | `pulse` | `bars`  
**Tamanhos:** `sm` | `md` | `lg` | `xl`

---

## 📝 Formulários

### FieldError

```tsx
import { FieldError } from '@/components/FieldError';

<input className={`input ${errors.email ? 'border-red-500' : ''}`} {...register('email')} />;
{
  errors.email && <FieldError>{errors.email}</FieldError>;
}
```

### PasswordStrength

```tsx
import { PasswordStrength } from '@/components/PasswordStrength';

const [password, setPassword] = useState('');

<input
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
<PasswordStrength password={password} />
```

### useFormValidation Hook

```tsx
import { useFormValidation } from '@/hooks/useFormValidation';

const validationRules = {
  email: {
    required: { value: true, message: 'Email é obrigatório' },
    email: { value: true, message: 'Email inválido' },
  },
  password: {
    required: { value: true, message: 'Senha é obrigatória' },
    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
  },
};

const { errors, touched, validateField, validateAll, handleBlur, handleChange } =
  useFormValidation(validationRules);

// No formulário
<input
  name="email"
  onBlur={handleBlur}
  onChange={handleChange}
  className={errors.email && touched.email ? 'border-red-500' : ''}
/>;
{
  touched.email && errors.email && <FieldError>{errors.email}</FieldError>;
}

// No submit
const handleSubmit = (e) => {
  e.preventDefault();
  const { isValid, errors: validationErrors } = validateAll(formData);
  if (!isValid) {
    // Mostrar erros
    return;
  }
  // Enviar formulário
};
```

**Regras disponíveis:**

- `required` - Campo obrigatório
- `email` - Validação de email
- `minLength` - Tamanho mínimo
- `maxLength` - Tamanho máximo
- `pattern` - Regex pattern
- `min` - Valor mínimo (números)
- `max` - Valor máximo (números)
- `match` - Comparar com outro campo

---

## 🧭 Navegação

### Breadcrumbs

```tsx
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ROUTES } from '@/lib/constants';

const items = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Receitas', href: ROUTES.RECIPES },
  { label: recipe.title }, // Último item sem href (página atual)
];

<Breadcrumbs items={items} />;
```

### MobileMenu

```tsx
import { MobileMenu } from '@/components/MobileMenu';

// Já integrado no Header, mas pode ser usado em outros lugares
<MobileMenu />;
```

### Pagination

```tsx
import { Pagination } from '@/components/Pagination';

<Pagination
  currentPage={page}
  totalPages={totalPages}
  totalResults={totalResults}
  resultsPerPage={12}
  onPageChange={(newPage) => setPage(newPage)}
/>;
```

---

## 💬 Feedback

### EmptyState

```tsx
import { EmptyState } from '@/components/EmptyState';

// Com ícone emoji
<EmptyState
  icon="🍳"
  title="Nenhuma receita ainda"
  description="Você ainda não criou nenhuma receita. Que tal começar agora?"
  action={{
    label: 'Criar Receita',
    onClick: () => navigate(ROUTES.RECIPE_CREATE),
  }}
/>

// Com ícone React
<EmptyState
  icon={<HeartIcon className="w-16 h-16" />}
  title="Sem favoritos"
  description="Você ainda não favoritou nenhuma receita."
/>
```

### ConfirmDialog

```tsx
import { ConfirmDialog } from '@/components/ConfirmDialog';

const [showDialog, setShowDialog] = useState(false);

<ConfirmDialog
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  onConfirm={handleDelete}
  title="Excluir Receita"
  message="Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita."
  confirmText="Sim, excluir"
  cancelText="Cancelar"
  type="danger" // 'danger' | 'warning' | 'info'
  loading={isDeleting}
/>;
```

### Toast (via ToastProvider)

```tsx
import { useToast } from '@/components/ToastProvider';

const { showToast } = useToast();

// Sucesso
showToast('Receita criada com sucesso!', 'success');

// Erro
showToast('Erro ao criar receita', 'error');

// Aviso
showToast('Preencha todos os campos', 'warning');

// Info
showToast('Dados salvos automaticamente', 'info');
```

### UploadProgress

```tsx
import { UploadProgress, MultipleUploadProgress } from '@/components/UploadProgress';

// Upload único
<UploadProgress fileName="foto-receita.jpg" progress={75} onCancel={() => cancelUpload()} />;

// Upload múltiplo
const uploads = [
  { id: '1', fileName: 'foto1.jpg', progress: 100, isComplete: true },
  { id: '2', fileName: 'foto2.jpg', progress: 45 },
  { id: '3', fileName: 'foto3.jpg', progress: 0, error: 'Falha no upload' },
];

<MultipleUploadProgress
  uploads={uploads}
  onCancelUpload={(id) => cancelUpload(id)}
  onClearCompleted={() => clearCompleted()}
/>;
```

---

## 🔍 Filtros e Busca

### Autocomplete

```tsx
import { Autocomplete } from '@/components/Autocomplete';

const [query, setQuery] = useState('');
const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);

const handleSearch = async (searchQuery: string) => {
  setQuery(searchQuery);
  // Buscar sugestões da API
  const results = await searchRecipes(searchQuery);
  setSuggestions(
    results.map((r) => ({
      id: r.id,
      title: r.title,
      image: r.coverImageUrl,
      type: r.tags?.[0]?.name || 'Receita',
    }))
  );
};

<Autocomplete
  placeholder="Buscar receitas..."
  onSearch={handleSearch}
  suggestions={suggestions}
  isLoading={isSearching}
/>;
```

### AdvancedFilters

```tsx
import { AdvancedFilters, FilterValues } from '@/components/AdvancedFilters';

const handleApplyFilters = (filters: FilterValues) => {
  // filters = {
  //   difficulty?: 'EASY' | 'MEDIUM' | 'HARD',
  //   prepTime?: '0-30' | '30-60' | '60-120' | '120+',
  //   portions?: '1-2' | '3-4' | '5-6' | '6+',
  //   sortBy?: 'recent' | 'oldest' | 'likes' | 'comments' | 'title-asc' | 'title-desc',
  // }

  // Aplicar filtros via API ou state
  setFilters(filters);
};

const handleResetFilters = () => {
  setFilters({});
};

<AdvancedFilters onApply={handleApplyFilters} onReset={handleResetFilters} />;
```

---

## 🍳 Receitas

### Badge

```tsx
import { Badge } from '@/components/Badge';

// Nova receita
<Badge variant="new" />

// Popular
<Badge variant="popular" />

// Trending
<Badge variant="trending" />

// Featured
<Badge variant="featured" />

// Default
<Badge variant="default">Custom</Badge>
```

**Variantes:** `new` | `popular` | `trending` | `featured` | `default`

### ShareButtons

```tsx
import { ShareButtons } from '@/components/ShareButtons';

<ShareButtons url={window.location.href} title={recipe.title} description={recipe.description} />;
```

**Redes suportadas:**

- Facebook
- Twitter/X
- WhatsApp
- Telegram
- Copy Link (com toast de confirmação)
- Native Share API (mobile)

### RecipePreview

```tsx
import { RecipePreview } from '@/components/RecipePreview';

const [showPreview, setShowPreview] = useState(false);

const recipeData = {
  title: 'Bolo de Chocolate',
  description: 'Um bolo delicioso...',
  prepTime: 30,
  cookTime: 40,
  servings: 8,
  difficulty: 'MEDIUM' as const,
  ingredients: ['2 xícaras de farinha', '1 xícara de açúcar', ...],
  instructions: ['Pré-aqueça o forno', 'Misture os ingredientes', ...],
  category: 'Sobremesas',
  tags: ['chocolate', 'bolo', 'festa'],
  image: '/images/bolo.jpg',
};

<RecipePreview
  isOpen={showPreview}
  onClose={() => setShowPreview(false)}
  recipe={recipeData}
  onEdit={() => {
    setShowPreview(false);
    // Voltar para edição
  }}
  onPublish={async () => {
    await createRecipe(recipeData);
    navigate(ROUTES.DASHBOARD);
  }}
  isPublishing={isCreating}
/>
```

### CookingMode

```tsx
import { CookingMode } from '@/components/CookingMode';

const [showCookingMode, setShowCookingMode] = useState(false);

<button onClick={() => setShowCookingMode(true)}>
  👨‍🍳 Modo Cozinhando
</button>

<CookingMode
  isOpen={showCookingMode}
  onClose={() => setShowCookingMode(false)}
  instructions={recipe.instructions}
  recipeTitle={recipe.title}
/>
```

**Features:**

- Fullscreen automático (mobile)
- Navegação por teclado (←, →, espaço, escape)
- Marcação de passos concluídos
- Barra de progresso
- Indicadores visuais de progresso

---

## 🔧 Hooks

### useFormValidation

Ver exemplo completo em [Formulários](#formulários).

### useToast

```tsx
import { useToast } from '@/components/ToastProvider';

function MyComponent() {
  const { showToast, success, error, warning, info } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      success('Dados salvos com sucesso!');
    } catch (err) {
      error('Erro ao salvar dados');
    }
  };

  return (
    <div>
      <button onClick={handleSave}>Salvar</button>
      <button onClick={() => warning('Atenção!')}>Avisar</button>
      <button onClick={() => info('Informação')}>Info</button>
    </div>
  );
}
```

---

## 🎨 Exemplo Completo: Página de Criação de Receita

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { FieldError } from '@/components/FieldError';
import { RecipePreview } from '@/components/RecipePreview';
import { UploadProgress } from '@/components/UploadProgress';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useToast } from '@/components/ToastProvider';
import api from '@/lib/api';

export const CreateRecipePage = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'MEDIUM',
    ingredients: [''],
    instructions: [''],
  });

  const [showPreview, setShowPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validationRules = {
    title: {
      required: { value: true, message: 'Título é obrigatório' },
      minLength: { value: 5, message: 'Mínimo 5 caracteres' },
    },
    description: {
      required: { value: true, message: 'Descrição é obrigatória' },
      minLength: { value: 20, message: 'Mínimo 20 caracteres' },
    },
    // ... outras regras
  };

  const { errors, touched, validateAll, handleBlur, handleChange } =
    useFormValidation(validationRules);

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/recipes', data),
    onSuccess: () => {
      success('Receita criada com sucesso!');
      navigate('/dashboard');
    },
    onError: () => {
      showError('Erro ao criar receita');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid } = validateAll(formData);
    if (!isValid) return;
    setShowPreview(true);
  };

  const handlePublish = () => {
    createMutation.mutate(formData);
  };

  return (
    <Layout>
      <div className="container-custom py-8">
        <h1 className="text-4xl font-bold mb-8">Nova Receita</h1>

        <form onSubmit={handleSubmit} className="card p-8">
          <div className="space-y-6">
            {/* Título */}
            <div>
              <label className="label">Título</label>
              <input
                type="text"
                name="title"
                className={`input ${errors.title && touched.title ? 'border-red-500' : ''}`}
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.title && errors.title && <FieldError>{errors.title}</FieldError>}
            </div>

            {/* Descrição */}
            <div>
              <label className="label">Descrição</label>
              <textarea
                name="description"
                className={`input ${errors.description && touched.description ? 'border-red-500' : ''}`}
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={4}
              />
              {touched.description && errors.description && (
                <FieldError>{errors.description}</FieldError>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-4">
              <button type="button" className="btn-outline" onClick={() => navigate(-1)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                Pré-visualizar
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      <RecipePreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        recipe={formData}
        onEdit={() => setShowPreview(false)}
        onPublish={handlePublish}
        isPublishing={createMutation.isPending}
      />

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <UploadProgress fileName="foto-receita.jpg" progress={uploadProgress} />
      )}
    </Layout>
  );
};
```

---

## 🎯 Dicas de Uso

### Performance

1. Use `React.memo()` em componentes que recebem props complexas
2. Prefira `useCallback` em handlers passados como props
3. Use `useMemo` para cálculos pesados

### Acessibilidade

1. Sempre adicione `aria-label` em botões sem texto
2. Use `role="alert"` em mensagens de erro
3. Mantenha ordem lógica de tabs

### Responsividade

1. Teste em mobile primeiro
2. Use breakpoints do Tailwind: `sm:`, `md:`, `lg:`, `xl:`
3. Oculte elementos desnecessários em mobile com `hidden md:flex`

### Validação

1. Valide no blur para UX suave
2. Mostre erros apenas após touched
3. Desabilite submit enquanto validação falhar

---

## 📚 Recursos Adicionais

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [React Router Docs](https://reactrouter.com/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

---

_Última atualização: Dezembro 2024_
