import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Health check básico - verifica se a API está respondendo
 * GET /health
 */
export const healthCheck = async (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
};

/**
 * Readiness check - verifica se a API está pronta para receber tráfego
 * Checa conexões com dependências (banco de dados, etc)
 * GET /ready
 */
export const readinessCheck = async (_req: Request, res: Response) => {
  try {
    // Testa conexão com o banco de dados
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'error',
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Liveness check - verifica se a aplicação está viva
 * Usado por Kubernetes/Docker para restart automático
 * GET /live
 */
export const livenessCheck = (_req: Request, res: Response) => {
  // Se conseguir responder, está vivo
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Status detalhado do sistema - apenas para debug
 * GET /status
 */
export const systemStatus = async (_req: Request, res: Response) => {
  try {
    // Métricas do banco de dados
    const [users, recipes, likes, favorites, comments] = await Promise.all([
      prisma.user.count(),
      prisma.recipe.count(),
      prisma.like.count(),
      prisma.favorite.count(),
      prisma.comment.count(),
    ]);

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
      database: {
        connected: true,
        stats: {
          users,
          recipes,
          likes,
          favorites,
          comments,
          total: users + recipes + likes + favorites + comments,
        },
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
