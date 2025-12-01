import { Router } from 'express';
import { getCurrentUser, getUser, updateUser, getUserStats, getUserFavorites } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/me', authenticate, getCurrentUser);
router.get('/favorites', authenticate, getUserFavorites);
router.get('/:id', getUser);
router.get('/:id/stats', getUserStats);
router.patch('/:id', authenticate, upload.single('avatar'), updateUser);

export default router;
