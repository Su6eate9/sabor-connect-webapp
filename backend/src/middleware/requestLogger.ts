import { Request, Response, NextFunction } from 'express';
import { logRequest, logError } from '../config/logger';

/**
 * Middleware para logar todas as requisições HTTP
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log quando a resposta terminar
  res.on('finish', () => {
    const duration = Date.now() - start;

    logRequest(
      {
        method: req.method,
        url: req.url,
        ip: req.ip,
      },
      duration
    );
  });

  // Log de erros não tratados
  res.on('error', (error) => {
    logError('Response error', error, {
      method: req.method,
      url: req.url,
      ip: req.ip,
    });
  });

  next();
};
