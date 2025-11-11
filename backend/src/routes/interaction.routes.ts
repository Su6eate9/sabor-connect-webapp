import { Router } from 'express';
import {
  likeRecipe,
  unlikeRecipe,
  favoriteRecipe,
  unfavoriteRecipe,
  getFavorites,
  createComment,
  getComments,
  deleteComment,
} from '../controllers/interaction.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Likes
router.post('/recipes/:recipeId/like', authenticate, likeRecipe);
router.delete('/recipes/:recipeId/like', authenticate, unlikeRecipe);

// Favorites
router.post('/recipes/:recipeId/favorite', authenticate, favoriteRecipe);
router.delete('/recipes/:recipeId/favorite', authenticate, unfavoriteRecipe);
router.get('/favorites', authenticate, getFavorites);

// Comments
router.post('/recipes/:recipeId/comments', authenticate, createComment);
router.get('/recipes/:recipeId/comments', getComments);
router.delete('/comments/:commentId', authenticate, deleteComment);

export default router;
