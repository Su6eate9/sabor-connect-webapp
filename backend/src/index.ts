import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import { logInfo, logError } from './config/logger';
import fs from 'fs';

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permite carregar imagens de outros domínios
  })
);

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

// Compressão gzip
app.use(compression());

// Logging estruturado
app.use(requestLogger);

// Logging HTTP (mantém Morgan para compatibilidade)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsPath = path.resolve(config.upload.dir);
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  logInfo('Uploads directory created', { path: uploadsPath });
}

// Serve static files (uploads) com cache headers
app.use(
  '/uploads',
  express.static(uploadsPath, {
    maxAge: '1y', // Cache por 1 ano
    etag: true, // Habilita ETag
    lastModified: true, // Habilita Last-Modified
    immutable: true, // Indica que o arquivo não muda
    setHeaders: (res, filePath) => {
      // Cache headers específicos por tipo de arquivo
      if (filePath.endsWith('.webp') || filePath.endsWith('.jpg') || filePath.endsWith('.png')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
      // Permite CORS para imagens
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);

logInfo('Static files configured', {
  path: uploadsPath,
  cacheMaxAge: '1 year',
});

// Health checks (sem rate limiting para permitir health checks frequentes)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', async (_req, res) => {
  try {
    const prismaModule = await import('./config/database');
    const prisma = prismaModule.default;
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'not_ready', error: 'Database unavailable' });
  }
});

app.get('/live', (_req, res) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
});

// Rate limiting
app.use('/api', apiLimiter);

// API routes
app.use('/api', routes);

// Root route
app.get('/', (_req, res) => {
  res.json({
    name: 'SaborConnect API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      ready: '/ready',
      live: '/live',
      api_health: '/api/health',
      auth: '/api/auth',
      recipes: '/api/recipes',
      users: '/api/users',
    },
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// Start server
const server = app.listen(config.port, () => {
  logInfo('Server started', {
    port: config.port,
    environment: config.nodeEnv,
    apiUrl: `http://localhost:${config.port}/api`,
  });

  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🔗 API: http://localhost:${config.port}/api`);
});

// Graceful shutdown
const gracefulShutdown = () => {
  logInfo('Shutting down gracefully');
  console.log('\n🛑 Shutting down gracefully...');

  server.close(() => {
    logInfo('Server closed successfully');
    console.log('✅ Server closed');
    process.exit(0);
  });

  // Força encerramento após 10 segundos
  setTimeout(() => {
    logError('Forced shutdown after timeout');
    console.error('❌ Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
