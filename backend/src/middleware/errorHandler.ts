import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import { logError } from '../config/logger';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  // Log estruturado do erro
  logError('Request error', err, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  if (err instanceof AppError) {
    return sendError(res, err.code, err.message, err.statusCode, err.details);
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return sendError(res, 'DATABASE_ERROR', 'Database operation failed', 500);
  }

  // Default error
  return sendError(res, 'INTERNAL_ERROR', 'An unexpected error occurred', 500);
};
