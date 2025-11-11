import { Router } from 'express';
import { getUser, updateUser } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/:id', getUser);
router.patch('/:id', authenticate, upload.single('avatar'), updateUser);

export default router;
