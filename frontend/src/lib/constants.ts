export const DIFFICULTY_LABELS = {
  EASY: 'Fácil',
  MEDIUM: 'Médio',
  HARD: 'Difícil',
} as const;

export const DIFFICULTY_COLORS = {
  EASY: 'text-green-600 bg-green-50',
  MEDIUM: 'text-yellow-600 bg-yellow-50',
  HARD: 'text-red-600 bg-red-50',
} as const;

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  RECIPES: '/recipes',
  RECIPE_DETAILS: '/recipe/:slug',
  RECIPE_CREATE: '/recipe/create',
  RECIPE_EDIT: '/recipe/edit/:slug',
  FAVORITES: '/favorites',
  PROFILE: '/profile/:userId',
} as const;
