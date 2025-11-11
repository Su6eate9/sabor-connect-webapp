# 🚀 Guia de Implementação - Fase 2 (Importantes)

**Data:** 6 de novembro de 2025  
**Fase:** Importantes (Esta semana - 5 dias)  
**Objetivo:** Escalar de 1k para 10k usuários simultâneos

---

## 📋 Índice

1. [Setup Redis para Cache](#1-setup-redis-para-cache)
2. [Migrar Uploads para S3](#2-migrar-uploads-para-s3)
3. [Configurar CDN CloudFlare](#3-configurar-cdn-cloudflare)

---

## 1. Setup Redis para Cache

### 📦 Instalação e Configuração

#### Passo 1: Adicionar Redis ao Docker Compose

```yaml
# docker-compose.yml
services:
  # ... serviços existentes ...

  redis:
    image: redis:7-alpine
    container_name: saborconnect-redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 3s
      retries: 5
    networks:
      - saborconnect-network

volumes:
  redis_data:
  # ... volumes existentes ...
```

#### Passo 2: Instalar Dependências

```bash
cd backend
npm install ioredis
npm install --save-dev @types/ioredis
```

#### Passo 3: Criar Configuração do Redis

```typescript
// backend/src/config/redis.ts
import Redis from 'ioredis';
import { logInfo, logError } from './logger';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  logInfo('Redis connected');
});

redis.on('error', (error) => {
  logError('Redis connection error', error);
});

// Helper para cache com TTL
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logError('Cache get error', error, { key });
    return null;
  }
};

export const cacheSet = async (
  key: string,
  value: any,
  ttlSeconds: number = 300
): Promise<void> => {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    logError('Cache set error', error, { key, ttl: ttlSeconds });
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (error) {
    logError('Cache delete error', error, { key });
  }
};

export const cacheDelPattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    logError('Cache delete pattern error', error, { pattern });
  }
};

export default redis;
```

#### Passo 4: Criar Middleware de Cache

```typescript
// backend/src/middleware/cache.ts
import { Request, Response, NextFunction } from 'express';
import { cacheGet, cacheSet } from '../config/redis';
import { logDebug } from '../config/logger';

/**
 * Middleware para cachear respostas de GET requests
 */
export const cacheMiddleware = (ttlSeconds: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Só cacheia GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `cache:${req.originalUrl}`;

    try {
      // Tenta buscar do cache
      const cachedData = await cacheGet<any>(cacheKey);

      if (cachedData) {
        logDebug('Cache hit', { key: cacheKey });
        return res.json(cachedData);
      }

      // Se não houver cache, intercepta o res.json
      const originalJson = res.json.bind(res);

      res.json = function (data: any) {
        // Salva no cache (não espera)
        cacheSet(cacheKey, data, ttlSeconds).catch(() => {
          // Ignora erros de cache
        });

        logDebug('Cache miss', { key: cacheKey });
        return originalJson(data);
      };

      next();
    } catch (error) {
      // Em caso de erro, continua sem cache
      next();
    }
  };
};
```

#### Passo 5: Aplicar Cache nas Rotas

```typescript
// backend/src/routes/recipe.routes.ts
import { cacheMiddleware } from '../middleware/cache';

const router = Router();

// Cache de 5 minutos para listagem de receitas
router.get('/', cacheMiddleware(300), getRecipes);

// Cache de 10 minutos para receita individual
router.get('/:slug', cacheMiddleware(600), getRecipe);

// Cache de 15 minutos para receitas do usuário
router.get('/user/:userId', cacheMiddleware(900), getUserRecipes);

// Limpa cache ao criar/atualizar/deletar
router.post(
  '/',
  authenticate,
  createLimiter,
  uploadLimiter,
  upload.single('coverImage'),
  createRecipe,
  clearRecipeCache
);

router.patch(
  '/:id',
  authenticate,
  uploadLimiter,
  upload.single('coverImage'),
  updateRecipe,
  clearRecipeCache
);

router.delete('/:id', authenticate, deleteRecipe, clearRecipeCache);

// Middleware para limpar cache
async function clearRecipeCache(req: Request, res: Response, next: NextFunction) {
  await cacheDelPattern('cache:/api/recipes*');
  next();
}
```

#### Passo 6: Adicionar Variáveis de Ambiente

```bash
# backend/.env
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
```

#### Passo 7: Testar Redis

```bash
# Subir containers
docker-compose up -d

# Testar conexão
docker exec saborconnect-redis redis-cli ping
# Deve retornar: PONG

# Ver estatísticas
docker exec saborconnect-redis redis-cli INFO stats

# Monitorar cache em tempo real
docker exec saborconnect-redis redis-cli MONITOR
```

### 📊 Benefícios Esperados

- ⚡ Redução de 50-70% no tempo de resposta
- 📉 Redução de 80% na carga do banco de dados
- 🚀 Suporte a 10x mais usuários simultâneos
- 💰 Redução de custos de infraestrutura

---

## 2. Migrar Uploads para S3

### 📦 Configuração AWS S3

#### Passo 1: Criar Bucket S3

```bash
# Via AWS CLI
aws s3 mb s3://saborconnect-uploads --region us-east-1

# Configurar CORS
aws s3api put-bucket-cors --bucket saborconnect-uploads --cors-configuration '{
  "CORSRules": [{
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }]
}'

# Configurar política pública para leitura
aws s3api put-bucket-policy --bucket saborconnect-uploads --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::saborconnect-uploads/*"
  }]
}'
```

#### Passo 2: Criar IAM User e Credenciais

```bash
# Criar usuário IAM
aws iam create-user --user-name saborconnect-s3-user

# Anexar política S3
aws iam attach-user-policy \
  --user-name saborconnect-s3-user \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Criar access keys
aws iam create-access-key --user-name saborconnect-s3-user
# Anote: AccessKeyId e SecretAccessKey
```

#### Passo 3: Instalar Dependências

```bash
cd backend
npm install @aws-sdk/client-s3 multer-s3
npm install --save-dev @types/multer-s3
```

#### Passo 4: Configurar S3 Client

```typescript
// backend/src/config/s3.ts
import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const S3_BUCKET = process.env.S3_BUCKET || 'saborconnect-uploads';
export const S3_REGION = process.env.AWS_REGION || 'us-east-1';
```

#### Passo 5: Atualizar Middleware de Upload

```typescript
// backend/src/middleware/upload.ts
import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client, S3_BUCKET } from '../config/s3';
import path from 'path';

// Se S3 estiver configurado, usa S3, senão usa storage local
const useS3 = !!process.env.AWS_ACCESS_KEY_ID;

const storage = useS3
  ? multerS3({
      s3: s3Client,
      bucket: S3_BUCKET,
      acl: 'public-read',
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `recipes/${uniqueSuffix}${ext}`);
      },
    })
  : multer.diskStorage({
      destination: 'uploads/',
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    });

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
    }
  },
});

// Helper para obter URL completa da imagem
export const getImageUrl = (filename: string): string => {
  if (useS3) {
    return `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
  }
  return `/uploads/${filename}`;
};
```

#### Passo 6: Atualizar Controller de Receitas

```typescript
// backend/src/controllers/recipe.controller.ts
import { getImageUrl } from '../middleware/upload';

export const createRecipe = async (req: Request, res: Response) => {
  // ... código existente ...

  const coverImageUrl = req.file ? getImageUrl(req.file.key || req.file.filename) : null;

  const recipe = await prisma.recipe.create({
    data: {
      // ... outros campos ...
      coverImageUrl,
    },
  });

  // ... resto do código ...
};
```

#### Passo 7: Adicionar Variáveis de Ambiente

```bash
# backend/.env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=saborconnect-uploads
```

#### Passo 8: Script de Migração de Imagens Existentes

```typescript
// backend/scripts/migrate-images-to-s3.ts
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function migrateImagesToS3() {
  console.log('Starting migration...');

  const recipes = await prisma.recipe.findMany({
    where: {
      coverImageUrl: { not: null },
    },
  });

  let migrated = 0;
  let errors = 0;

  for (const recipe of recipes) {
    if (!recipe.coverImageUrl || recipe.coverImageUrl.startsWith('https://')) {
      continue; // Já está no S3
    }

    try {
      const localPath = path.join('uploads', recipe.coverImageUrl);
      const fileBuffer = fs.readFileSync(localPath);
      const s3Key = `recipes/${recipe.id}-${path.basename(recipe.coverImageUrl)}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET!,
          Key: s3Key,
          Body: fileBuffer,
          ContentType: 'image/jpeg',
          ACL: 'public-read',
        })
      );

      const s3Url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { coverImageUrl: s3Url },
      });

      migrated++;
      console.log(`✅ Migrated: ${recipe.title}`);
    } catch (error) {
      errors++;
      console.error(`❌ Error migrating ${recipe.title}:`, error);
    }
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Migrated: ${migrated}`);
  console.log(`   Errors: ${errors}`);

  await prisma.$disconnect();
}

migrateImagesToS3();
```

```bash
# Executar migração
tsx backend/scripts/migrate-images-to-s3.ts
```

### 📊 Benefícios Esperados

- ☁️ Storage infinitamente escalável
- 🌍 CDN integrado da AWS (CloudFront)
- 💰 Custo mais baixo que storage local
- 🔒 Backup automático e durabilidade 99.999999999%
- 🚀 Permite múltiplas instâncias da API

---

## 3. Configurar CDN CloudFlare

### 📦 Setup CloudFlare

#### Passo 1: Criar Conta CloudFlare

1. Acesse https://dash.cloudflare.com/sign-up
2. Adicione seu domínio (ex: saborconnect.com)
3. Atualize os nameservers no seu registrador de domínio

#### Passo 2: Configurar DNS

```
# Adicionar records DNS no CloudFlare
A     saborconnect.com         -> SEU_IP_SERVIDOR
CNAME www                      -> saborconnect.com
CNAME api                      -> saborconnect.com
CNAME cdn                      -> saborconnect-uploads.s3.us-east-1.amazonaws.com
```

#### Passo 3: Ativar Proxy (Orange Cloud)

- ✅ Ativar proxy para todos os records
- Isso habilita o CDN automaticamente

#### Passo 4: Configurar Cache Rules

```javascript
// CloudFlare Dashboard > Rules > Page Rules

// Rule 1: Cache de assets estáticos
URL: *saborconnect.com/uploads/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 day

// Rule 2: Cache de API (seletivo)
URL: *api.saborconnect.com/recipes*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 5 minutes
  - Bypass Cache on Cookie: authorization

// Rule 3: Cache de imagens S3
URL: *cdn.saborconnect.com/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 year
  - Browser Cache TTL: 1 month
```

#### Passo 5: Configurar Cache no Backend

```typescript
// backend/src/middleware/cacheHeaders.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Adiciona headers de cache para CloudFlare
 */
export const setCacheHeaders = (maxAge: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Cache público
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`);

    // Vary based on Accept-Encoding para Gzip/Brotli
    res.setHeader('Vary', 'Accept-Encoding');

    next();
  };
};

// Uso nas rotas
router.get('/recipes', setCacheHeaders(300), getRecipes); // 5min
router.get('/recipes/:slug', setCacheHeaders(600), getRecipe); // 10min
```

#### Passo 6: Configurar Purge de Cache

```typescript
// backend/src/utils/cloudflare.ts
import axios from 'axios';

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

export async function purgeCloudflareCache(urls?: string[]) {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    console.warn('CloudFlare not configured, skipping cache purge');
    return;
  }

  try {
    const endpoint = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`;

    await axios.post(endpoint, urls ? { files: urls } : { purge_everything: true }, {
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ CloudFlare cache purged');
  } catch (error) {
    console.error('❌ Error purging CloudFlare cache:', error);
  }
}

// Uso após criar/atualizar receita
await purgeCloudflareCache([
  `https://api.saborconnect.com/recipes`,
  `https://api.saborconnect.com/recipes/${recipe.slug}`,
]);
```

#### Passo 7: Otimizações Adicionais

```
# CloudFlare Dashboard

1. Speed > Optimization
   ✅ Auto Minify: HTML, CSS, JS
   ✅ Brotli
   ✅ Early Hints
   ✅ Rocket Loader

2. Speed > Image Optimization (Polish)
   ✅ Lossless
   ✅ WebP

3. Security > SSL/TLS
   ✅ Full (strict)
   ✅ Always Use HTTPS
   ✅ Automatic HTTPS Rewrites

4. Security > WAF
   ✅ OWASP Core Ruleset
   ✅ CloudFlare Managed Ruleset

5. Network
   ✅ HTTP/3 (QUIC)
   ✅ 0-RTT Connection Resumption
   ✅ gRPC
```

#### Passo 8: Variáveis de Ambiente

```bash
# backend/.env
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ZONE_ID=your_zone_id
```

### 📊 Benefícios Esperados

- ⚡ Redução de 70-90% na latência global
- 🌍 Distribuição em 300+ cidades no mundo
- 🛡️ Proteção DDoS incluída
- 💰 Grátis até 100GB de tráfego/mês
- 🚀 SSL automático e otimizações

---

## 📈 Resultados Esperados da Fase 2

### Antes (Fase 1):

```
Capacidade: 1.000 usuários simultâneos
Latência: 150-230ms
Throughput: 100 req/s
Uptime: 99.0%
Custo: $50/mês
```

### Depois (Fase 2):

```
Capacidade: 10.000 usuários simultâneos (+900%)
Latência: 20-50ms (-75%)
Throughput: 5.000 req/s (+4900%)
Uptime: 99.9%
Custo: $200-500/mês
```

---

## ✅ Checklist de Implementação

### Dia 1: Redis

- [ ] Adicionar Redis ao docker-compose
- [ ] Instalar dependências (ioredis)
- [ ] Criar config/redis.ts
- [ ] Criar middleware/cache.ts
- [ ] Aplicar cache nas rotas principais
- [ ] Testar cache hit/miss
- [ ] Monitorar performance

### Dia 2: S3 Setup

- [ ] Criar bucket S3
- [ ] Criar IAM user e credentials
- [ ] Instalar @aws-sdk/client-s3
- [ ] Criar config/s3.ts
- [ ] Atualizar middleware/upload.ts
- [ ] Testar upload para S3
- [ ] Verificar URLs públicas

### Dia 3: Migração S3

- [ ] Criar script de migração
- [ ] Fazer backup das imagens locais
- [ ] Executar migração
- [ ] Validar imagens no S3
- [ ] Atualizar URLs no banco
- [ ] Remover imagens locais antigas

### Dia 4: CloudFlare

- [ ] Criar conta CloudFlare
- [ ] Adicionar domínio
- [ ] Configurar DNS
- [ ] Configurar Page Rules
- [ ] Ativar otimizações
- [ ] Configurar SSL
- [ ] Testar CDN

### Dia 5: Testes e Ajustes

- [ ] Load testing (k6/Artillery)
- [ ] Monitorar Redis hit rate
- [ ] Validar S3 uploads
- [ ] Verificar cache CloudFlare
- [ ] Ajustar TTLs
- [ ] Documentar mudanças
- [ ] Deploy para produção

---

## 🔍 Monitoramento

### Redis:

```bash
# Stats
docker exec saborconnect-redis redis-cli INFO stats

# Hit rate
docker exec saborconnect-redis redis-cli INFO stats | grep keyspace_hits

# Memória
docker exec saborconnect-redis redis-cli INFO memory
```

### S3:

```bash
# Via AWS CLI
aws s3 ls s3://saborconnect-uploads --recursive --human-readable --summarize

# Custo estimado
aws ce get-cost-and-usage \
  --time-period Start=2025-11-01,End=2025-11-30 \
  --granularity MONTHLY \
  --metrics UnblendedCost \
  --filter file://s3-filter.json
```

### CloudFlare:

```
Dashboard > Analytics > Traffic
- Requests
- Bandwidth saved
- Cache hit rate
- Threats blocked
```

---

## 💰 Estimativa de Custos

| Serviço                          | Custo/Mês | Notas       |
| -------------------------------- | --------- | ----------- |
| Redis (AWS ElastiCache t3.micro) | $15       | Dev/staging |
| Redis (AWS ElastiCache t3.small) | $50       | Produção    |
| S3 Storage (100GB)               | $2.30     | $0.023/GB   |
| S3 Requests (1M GET)             | $0.40     | $0.0004/1k  |
| CloudFlare Pro                   | $20       | Opcional    |
| **Total Dev**                    | **~$20**  |             |
| **Total Produção**               | **~$75**  |             |

---

## 🎯 Próxima Fase (Recomendada)

Após completar a Fase 2, implemente:

1. PostgreSQL Read Replicas
2. CI/CD Automatizado
3. Monitoring (Prometheus + Grafana)

---

**Preparado por:** Equipe SaborConnect  
**Última atualização:** 6 de novembro de 2025
