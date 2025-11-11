# 🎯 Plano de Ação Imediato - Preparação para Produção

## ✅ Status Atual (Concluído)

- [x] **Banco de dados populado:** 500.183 registros
- [x] **Performance testada:** 150-230ms latência
- [x] **Arquitetura E2E:** TypeScript completo
- [x] **Segurança básica:** JWT, Bcrypt, Helmet, CORS
- [x] **Índices otimizados:** 5 índices na tabela recipes

---

## 🚨 AÇÕES CRÍTICAS (Fazer AGORA - 1 dia)

### 1. Implementar Rate Limiting (30 minutos)

**Arquivo:** `backend/src/middleware/rateLimiter.ts`

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Redis } from 'ioredis';

// Sem Redis (temporário)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentativas de login
  message: 'Muitas tentativas de login, tente novamente em 15 minutos',
});

// Com Redis (recomendado)
const redis = new Redis(process.env.REDIS_URL);
export const apiLimiterRedis = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 15 * 60 * 1000,
  max: 100,
});
```

**Aplicar no Express:**

```typescript
// backend/src/index.ts
import { apiLimiter, authLimiter } from './middleware/rateLimiter';

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

**Instalar dependências:**

```bash
cd backend
npm install express-rate-limit rate-limit-redis ioredis
```

---

### 2. Health Check Endpoints (15 minutos)

**Arquivo:** `backend/src/routes/health.ts`

```typescript
import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Health check básico
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Readiness check (verifica dependências)
router.get('/ready', async (req, res) => {
  try {
    // Testa conexão com banco
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      database: 'disconnected',
      error: error.message,
    });
  }
});

export default router;
```

**Registrar rotas:**

```typescript
// backend/src/index.ts
import healthRoutes from './routes/health';

app.use(healthRoutes); // Sem /api prefix
```

---

### 3. Logs Estruturados (45 minutos)

**Arquivo:** `backend/src/lib/logger.ts`

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'saborconnect-api' },
  transports: [
    // Arquivo de erros
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    // Arquivo de todos os logs
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Console em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
```

**Middleware de logging:**

```typescript
// backend/src/middleware/logging.ts
import logger from '../lib/logger';

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
};

export const errorLogger = (err, req, res, next) => {
  logger.error('Error', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
  });

  next(err);
};
```

**Aplicar:**

```typescript
// backend/src/index.ts
import { requestLogger, errorLogger } from './middleware/logging';

app.use(requestLogger); // Logo após body-parser
// ... outras rotas ...
app.use(errorLogger); // Antes do error handler
```

**Instalar:**

```bash
npm install winston
```

**Criar pasta de logs:**

```bash
mkdir -p backend/logs
echo "logs/" >> backend/.gitignore
```

---

## 🟡 AÇÕES IMPORTANTES (Fazer esta semana - 3-5 dias)

### 4. Configurar Redis (2 horas)

**Docker Compose:**

```yaml
# docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    container_name: saborconnect-redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

**Cache Service:**

```typescript
// backend/src/services/cache.ts
import Redis from 'ioredis';
import logger from '../lib/logger';

class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

    this.redis.on('error', (err) => {
      logger.error('Redis error:', err);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

export default new CacheService();
```

**Usar no controller:**

```typescript
// backend/src/controllers/recipeController.ts
import cache from '../services/cache';

export const getRecipes = async (req, res) => {
  const { page = 1, limit = 20, difficulty } = req.query;
  const cacheKey = `recipes:page:${page}:limit:${limit}:diff:${difficulty}`;

  // Tentar buscar do cache
  const cached = await cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Buscar do banco
  const recipes = await prisma.recipe.findMany({
    /* ... */
  });

  // Salvar no cache (5 minutos)
  await cache.set(cacheKey, recipes, 300);

  res.json(recipes);
};
```

---

### 5. Migrar Uploads para S3 (3 horas)

**Instalar SDK:**

```bash
npm install @aws-sdk/client-s3 multer-s3
```

**Configurar:**

```typescript
// backend/src/lib/storage.ts
import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, `recipes/${uniqueName}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  },
});
```

**Variáveis de ambiente:**

```env
# backend/.env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=saborconnect-uploads
```

---

### 6. Configurar CDN (1 hora)

**CloudFlare (Gratuito):**

1. Adicionar site no CloudFlare
2. Configurar DNS
3. Ativar cache automático
4. Configurar Page Rules:
   - `/uploads/*` → Cache Everything, Browser TTL: 1 month
   - `/static/*` → Cache Everything, Browser TTL: 1 year

**AWS CloudFront:**

```terraform
# infra/cloudfront.tf
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = aws_s3_bucket.uploads.bucket_regional_domain_name
    origin_id   = "S3-saborconnect-uploads"
  }

  enabled = true
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-saborconnect-uploads"
    viewer_protocol_policy = "redirect-to-https"
  }
}
```

---

## 🟢 AÇÕES RECOMENDADAS (Fazer próximas 2 semanas)

### 7. CI/CD Pipeline (4 horas)

**Arquivo:** `.github/workflows/deploy.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci

      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test

      - name: Lint
        run: |
          cd backend && npm run lint
          cd ../frontend && npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker images
        run: |
          docker build -t saborconnect-backend:${{ github.sha }} backend/
          docker build -t saborconnect-frontend:${{ github.sha }} frontend/

      - name: Push to registry
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker push saborconnect-backend:${{ github.sha }}
          docker push saborconnect-frontend:${{ github.sha }}
```

---

### 8. Monitoring Básico (2 horas)

**Instalar Prometheus + Grafana:**

```yaml
# docker-compose.yml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - '9090:9090'

  grafana:
    image: grafana/grafana
    ports:
      - '3001:3000'
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

**Backend metrics:**

```typescript
// backend/src/lib/metrics.ts
import promClient from 'prom-client';

const register = new promClient.Registry();

export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

export const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// Endpoint de métricas
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

---

## 📋 Checklist de Implementação

### Dia 1 (4 horas):

- [ ] Rate limiting básico (sem Redis)
- [ ] Health check endpoints
- [ ] Logs estruturados com Winston
- [ ] Testar localmente

### Dia 2 (4 horas):

- [ ] Configurar Redis no Docker
- [ ] Implementar cache service
- [ ] Aplicar cache em endpoints críticos
- [ ] Testar performance

### Dia 3 (4 horas):

- [ ] Criar bucket S3
- [ ] Configurar SDK AWS
- [ ] Migrar upload de imagens
- [ ] Testar upload

### Dia 4 (3 horas):

- [ ] Configurar CloudFlare/CloudFront
- [ ] Testar CDN
- [ ] Medir melhorias de performance

### Dia 5 (2 horas):

- [ ] Documentar mudanças
- [ ] Atualizar README
- [ ] Fazer deploy em staging

---

## 🎯 Métricas de Sucesso

Após implementar todas as ações:

| Métrica        | Antes | Depois        | Melhoria  |
| -------------- | ----- | ------------- | --------- |
| Latência média | 189ms | **< 50ms**    | 74% ⬇️    |
| Cache hit rate | 0%    | **> 80%**     | ∞ ⬆️      |
| Requests/seg   | 34    | **> 500**     | 1.370% ⬆️ |
| Uptime         | 99.0% | **99.9%**     | 0.9% ⬆️   |
| Custo/req      | Alto  | **90% menor** | 90% ⬇️    |

---

## 💰 Investimento Necessário

### Infraestrutura:

- **AWS S3:** $5/mês (100GB + 10k requests)
- **Redis Cloud:** $0/mês (free tier 30MB)
- **CloudFlare CDN:** $0/mês (free tier)
- **Total:** **$5/mês**

### Tempo:

- **Fase 1 (Crítico):** 1 dia (4 horas)
- **Fase 2 (Importante):** 1 semana (20 horas)
- **Fase 3 (Recomendado):** 2 semanas (40 horas)

---

## 🚀 Conclusão

**Prioridade Máxima:** Implementar rate limiting, health checks e logs (Dia 1)

**Após implementação completa:**

- ✅ Aplicação pronta para 10k usuários simultâneos
- ✅ Performance 4x melhor
- ✅ Custo 90% menor por request
- ✅ Monitoramento completo
- ✅ Deploy automatizado

**Próximo passo:** Executar Dia 1 e validar melhorias!

---

**Data:** 6 de novembro de 2025  
**Responsável:** Equipe SaborConnect  
**Status:** READY TO IMPLEMENT
