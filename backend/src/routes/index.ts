import { Router } from 'express';
import authRoutes from './auth.routes';
import recipeRoutes from './recipe.routes';
import interactionRoutes from './interaction.routes';
import userRoutes from './user.routes';
import healthRoutes from './health.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/recipes', recipeRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/', interactionRoutes);
router.use('/', healthRoutes);

export default router;
