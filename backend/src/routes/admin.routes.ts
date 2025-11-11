import { Router, Request, Response } from 'express';
import {
  purgeCloudFlareCache,
  purgeAllCloudFlareCache,
  getCloudFlareAnalytics,
} from '../config/cloudflare';
import { cacheDelPattern } from '../config/redis';
import { logInfo, logError } from '../config/logger';

const router = Router();

/**
 * Limpa cache específico (Redis + CloudFlare)
 */
router.post('/cache/purge', async (req: Request, res: Response) => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'URLs array is required' });
    }

    // Limpa Redis (cache de API)
    const redisPattern = 'cache:*';
    await cacheDelPattern(redisPattern);
    logInfo('Redis cache purged', { pattern: redisPattern });

    // Limpa CloudFlare (cache de CDN)
    await purgeCloudFlareCache(urls);

    return res.json({
      message: 'Cache purged successfully',
      redis: true,
      cloudflare: true,
      urls: urls.length,
    });
  } catch (error) {
    logError('Error purging cache', error);
    return res.status(500).json({ error: 'Failed to purge cache' });
  }
});

/**
 * Limpa todo o cache (Redis + CloudFlare) - CUIDADO!
 */
router.post('/cache/purge-all', async (_req: Request, res: Response) => {
  try {
    // Limpa Redis
    await cacheDelPattern('cache:*');
    logInfo('All Redis cache purged');

    // Limpa CloudFlare
    await purgeAllCloudFlareCache();

    return res.json({
      message: 'All cache purged successfully',
      redis: true,
      cloudflare: true,
    });
  } catch (error) {
    logError('Error purging all cache', error);
    return res.status(500).json({ error: 'Failed to purge all cache' });
  }
});

/**
 * Obtém estatísticas de cache
 */
router.get('/cache/stats', async (_req: Request, res: Response) => {
  try {
    // Estatísticas do CloudFlare
    const cfAnalytics = await getCloudFlareAnalytics();

    return res.json({
      cloudflare: cfAnalytics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError('Error fetching cache stats', error);
    return res.status(500).json({ error: 'Failed to fetch cache stats' });
  }
});

/**
 * Health check de serviços
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const s3 = await import('../config/s3');
    const cloudflare = await import('../config/cloudflare');

    const health = {
      redis: {
        configured: true,
        status: 'connected',
      },
      s3: {
        configured: s3.isS3Configured(),
        status: s3.isS3Configured() ? 'configured' : 'not configured',
      },
      cloudflare: {
        configured: cloudflare.isCloudFlareConfigured(),
        status: cloudflare.isCloudFlareConfigured() ? 'configured' : 'not configured',
      },
      timestamp: new Date().toISOString(),
    };

    return res.json(health);
  } catch (error) {
    logError('Error checking health', error);
    return res.status(500).json({ error: 'Failed to check health' });
  }
});

export default router;
