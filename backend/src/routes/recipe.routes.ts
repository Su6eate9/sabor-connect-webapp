import { Router } from 'express';
import {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getUserRecipes,
} from '../controllers/recipe.controller';
import { authenticate } from '../middleware/authenticate';
import { upload } from '../middleware/upload';
import { createLimiter, uploadLimiter } from '../middleware/rateLimiter';
import { cacheMiddleware } from '../middleware/cache';
import { cacheDelPattern } from '../config/redis';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Helper para limpar cache de receitas
const clearRecipeCache = async (_req: Request, _res: Response, next: NextFunction) => {
  await cacheDelPattern('cache:/api/recipes*');
  next();
};

// Cache de 5 minutos para listagem de receitas
router.get('/', cacheMiddleware(300), getRecipes);

// Cache de 15 minutos para receitas de usuário específico
router.get('/user/:userId', cacheMiddleware(900), getUserRecipes);

// Cache de 10 minutos para receita individual
router.get('/:slug', cacheMiddleware(600), getRecipe);

// Criar receita - limpa cache após sucesso
router.post(
  '/',
  authenticate,
  createLimiter,
  uploadLimiter,
  upload.single('coverImage'),
  createRecipe,
  clearRecipeCache
);

// Atualizar receita - limpa cache após sucesso
router.patch(
  '/:id',
  authenticate,
  uploadLimiter,
  upload.single('coverImage'),
  updateRecipe,
  clearRecipeCache
);

// Deletar receita - limpa cache após sucesso
router.delete('/:id', authenticate, deleteRecipe, clearRecipeCache);

export default router;
