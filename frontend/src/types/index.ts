export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  _count?: {
    recipes: number;
    favorites: number;
    likes: number;
  };
}

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  portions: number;
  coverImageUrl?: string;
  instructions: string[];
  viewCount: number;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  ingredients: Ingredient[];
  tags: Tag[];
  isLiked?: boolean;
  isFavorited?: boolean;
  _count?: {
    likes: number;
    comments: number;
    favorites: number;
  };
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  recipeId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface CreateRecipeInput {
  title: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  portions: number;
  instructions: string[];
  ingredients: Omit<Ingredient, 'id'>[];
  tags?: string[];
  coverImage?: File;
}
