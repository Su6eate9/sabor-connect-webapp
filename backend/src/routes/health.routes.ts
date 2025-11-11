import { Router } from 'express';
import {
  healthCheck,
  readinessCheck,
  livenessCheck,
  systemStatus,
} from '../controllers/health.controller';

const router = Router();

router.get('/health', healthCheck);
router.get('/ready', readinessCheck);
router.get('/live', livenessCheck);
router.get('/status', systemStatus);

export default router;
