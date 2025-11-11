import { Request, Response, NextFunction } from 'express';
import { cacheGet, cacheSet } from '../config/redis';
import { logDebug } from '../config/logger';

/**
 * Middleware para cachear respostas de GET requests
 * @param ttlSeconds - Tempo de vida do cache em segundos (padrão: 300 = 5 minutos)
 */
export const cacheMiddleware = (ttlSeconds: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Só cacheia GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Inclui query params na chave do cache
    const queryString = Object.keys(req.query).length
      ? `?${new URLSearchParams(req.query as any).toString()}`
      : '';
    const cacheKey = `cache:${req.originalUrl}${queryString}`;

    try {
      // Tenta buscar do cache
      const cachedData = await cacheGet<any>(cacheKey);

      if (cachedData) {
        logDebug('Cache hit', { key: cacheKey, url: req.originalUrl });
        return res.json(cachedData);
      }

      // Se não houver cache, intercepta o res.json
      const originalJson = res.json.bind(res);

      res.json = function (data: any) {
        // Salva no cache (não espera)
        cacheSet(cacheKey, data, ttlSeconds).catch(() => {
          // Ignora erros de cache
        });

        logDebug('Cache miss - storing', { key: cacheKey, url: req.originalUrl, ttl: ttlSeconds });
        return originalJson(data);
      };

      next();
    } catch (error) {
      // Em caso de erro, continua sem cache
      logDebug('Cache error - continuing without cache', { error, url: req.originalUrl });
      next();
    }
  };
};
