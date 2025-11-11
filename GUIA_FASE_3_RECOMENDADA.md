# 🚀 Guia de Implementação - Fase 3 (Recomendada)

**Data:** 6 de novembro de 2025  
**Fase:** Recomendada (Próximas 2 semanas)  
**Objetivo:** Escalar para 50k+ usuários e operação 24/7

---

## 📋 Índice

1. [PostgreSQL Read Replicas](#1-postgresql-read-replicas)
2. [CI/CD Automatizado](#2-cicd-automatizado)
3. [Monitoring (Prometheus + Grafana)](#3-monitoring-prometheus--grafana)

---

## 1. PostgreSQL Read Replicas

### 📦 Objetivo

Distribuir carga de leitura entre múltiplas réplicas do banco de dados, reduzindo latência e aumentando throughput.

### Arquitetura

```
                    ┌──────────────┐
                    │   API Node   │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
         [WRITE]                    [READ]
              │                         │
              ▼                         ▼
     ┌─────────────────┐      ┌─────────────────┐
     │  PostgreSQL     │────▶ │  Read Replica   │
     │   PRIMARY       │      │    (Replica 1)  │
     └─────────────────┘      └─────────────────┘
              │
              │                ┌─────────────────┐
              └──────────────▶ │  Read Replica   │
                               │    (Replica 2)  │
                               └─────────────────┘
```

### Passo 1: Configurar Primary Database

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:15-alpine
    container_name: saborconnect-db-primary
    environment:
      POSTGRES_USER: saborconnect
      POSTGRES_PASSWORD: saborconnect_password
      POSTGRES_DB: saborconnect
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/postgresql.conf:/etc/postgresql/postgresql.conf
      - ./docker/postgres/pg_hba.conf:/etc/postgresql/pg_hba.conf
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    ports:
      - '5432:5432'
    networks:
      - saborconnect-network
```

```conf
# docker/postgres/postgresql.conf
# Replication settings
wal_level = replica
max_wal_senders = 10
wal_keep_size = 1GB
hot_standby = on

# Performance tuning
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

```conf
# docker/postgres/pg_hba.conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
host    replication     saborconnect    172.18.0.0/16           trust
host    all             saborconnect    172.18.0.0/16           md5
```

### Passo 2: Configurar Read Replicas

```yaml
# docker-compose.yml
services:
  # ... db primary ...

  db-replica-1:
    image: postgres:15-alpine
    container_name: saborconnect-db-replica-1
    environment:
      POSTGRES_USER: saborconnect
      POSTGRES_PASSWORD: saborconnect_password
      PGDATA: /var/lib/postgresql/data
    volumes:
      - postgres_replica1_data:/var/lib/postgresql/data
      - ./docker/postgres/recovery.conf:/var/lib/postgresql/data/recovery.conf
    command: |
      bash -c "
      if [ ! -s '/var/lib/postgresql/data/PG_VERSION' ]; then
        pg_basebackup -h db -D /var/lib/postgresql/data -U saborconnect -v -P -W
        echo 'standby_mode = on' > /var/lib/postgresql/data/recovery.conf
        echo \"primary_conninfo = 'host=db port=5432 user=saborconnect password=saborconnect_password'\" >> /var/lib/postgresql/data/recovery.conf
      fi
      postgres
      "
    ports:
      - '5433:5432'
    depends_on:
      - db
    networks:
      - saborconnect-network

  db-replica-2:
    image: postgres:15-alpine
    container_name: saborconnect-db-replica-2
    environment:
      POSTGRES_USER: saborconnect
      POSTGRES_PASSWORD: saborconnect_password
      PGDATA: /var/lib/postgresql/data
    volumes:
      - postgres_replica2_data:/var/lib/postgresql/data
    command: |
      bash -c "
      if [ ! -s '/var/lib/postgresql/data/PG_VERSION' ]; then
        pg_basebackup -h db -D /var/lib/postgresql/data -U saborconnect -v -P -W
        echo 'standby_mode = on' > /var/lib/postgresql/data/recovery.conf
        echo \"primary_conninfo = 'host=db port=5432 user=saborconnect password=saborconnect_password'\" >> /var/lib/postgresql/data/recovery.conf
      fi
      postgres
      "
    ports:
      - '5434:5432'
    depends_on:
      - db
    networks:
      - saborconnect-network

volumes:
  postgres_replica1_data:
  postgres_replica2_data:
```

### Passo 3: Configurar Prisma para Read Replicas

```typescript
// backend/src/config/database.ts
import { PrismaClient } from '@prisma/client';

// Primary database (writes)
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Primary
    },
  },
  log: ['error', 'warn'],
});

// Read replicas pool
const replicaUrls = [
  process.env.DATABASE_REPLICA_1_URL || process.env.DATABASE_URL,
  process.env.DATABASE_REPLICA_2_URL || process.env.DATABASE_URL,
];

let currentReplicaIndex = 0;

// Round-robin entre réplicas
function getNextReplica() {
  const url = replicaUrls[currentReplicaIndex];
  currentReplicaIndex = (currentReplicaIndex + 1) % replicaUrls.length;
  return url;
}

// Cliente para leituras
export const prismaRead = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: getNextReplica(),
      },
    },
  });
};

// Helper para queries de leitura
export async function readQuery<T>(callback: (client: PrismaClient) => Promise<T>): Promise<T> {
  const client = prismaRead();
  try {
    return await callback(client);
  } finally {
    await client.$disconnect();
  }
}
```

### Passo 4: Atualizar Controllers

```typescript
// backend/src/controllers/recipe.controller.ts
import { prisma, readQuery } from '../config/database';

// Read operations usam réplica
export const getRecipes = async (req: Request, res: Response) => {
  const recipes = await readQuery((client) =>
    client.recipe.findMany({
      where: { published: true },
      include: {
        author: {
          select: { id: true, name: true, profilePictureUrl: true },
        },
        _count: {
          select: { likes: true, favorites: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
  );

  res.json(recipes);
};

// Write operations usam primary
export const createRecipe = async (req: Request, res: Response) => {
  const recipe = await prisma.recipe.create({
    data: {
      // ...
    },
  });

  res.status(201).json(recipe);
};
```

### Passo 5: Variáveis de Ambiente

```bash
# backend/.env
DATABASE_URL="postgresql://saborconnect:saborconnect_password@db:5432/saborconnect"
DATABASE_REPLICA_1_URL="postgresql://saborconnect:saborconnect_password@db-replica-1:5432/saborconnect"
DATABASE_REPLICA_2_URL="postgresql://saborconnect:saborconnect_password@db-replica-2:5432/saborconnect"
```

### 📊 Benefícios Esperados

- 📊 3x mais throughput de leitura
- ⚡ 50% redução de latência em queries de leitura
- 🔄 Alta disponibilidade (failover automático)
- 📈 Suporte a 50k+ usuários simultâneos

---

## 2. CI/CD Automatizado

### 📦 GitHub Actions

#### Passo 1: Criar Workflow de CI

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [dev, staging, main]
  pull_request:
    branches: [dev, staging, main]

jobs:
  test-backend:
    name: Test Backend
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: saborconnect_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run linter
        working-directory: ./backend
        run: npm run lint

      - name: Run type check
        working-directory: ./backend
        run: npm run type-check

      - name: Generate Prisma Client
        working-directory: ./backend
        run: npx prisma generate

      - name: Run database migrations
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/saborconnect_test
        run: npx prisma migrate deploy

      - name: Run tests
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/saborconnect_test
          REDIS_HOST: localhost
          REDIS_PORT: 6379
          JWT_SECRET: test_secret_key
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
          flags: backend

  test-frontend:
    name: Test Frontend
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run linter
        working-directory: ./frontend
        run: npm run lint

      - name: Run type check
        working-directory: ./frontend
        run: npm run type-check

      - name: Run tests
        working-directory: ./frontend
        run: npm test -- --coverage

      - name: Build
        working-directory: ./frontend
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/lcov.info
          flags: frontend

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  build-docker:
    name: Build Docker Images
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: ${{ github.event_name != 'pull_request' }}
          tags: |
            saborconnect/backend:${{ github.sha }}
            saborconnect/backend:latest
          cache-from: type=registry,ref=saborconnect/backend:latest
          cache-to: type=inline

      - name: Build and push Frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: ${{ github.event_name != 'pull_request' }}
          tags: |
            saborconnect/frontend:${{ github.sha }}
            saborconnect/frontend:latest
          cache-from: type=registry,ref=saborconnect/frontend:latest
          cache-to: type=inline
```

#### Passo 2: Criar Workflow de CD

```yaml
# .github/workflows/cd.yml
name: CD Pipeline

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.STAGING_SSH_KEY }}

      - name: Deploy to staging server
        run: |
          ssh -o StrictHostKeyChecking=no ${{ secrets.STAGING_USER }}@${{ secrets.STAGING_HOST }} << 'EOF'
            cd /var/www/saborconnect
            git pull origin main
            docker-compose pull
            docker-compose up -d --force-recreate
            docker system prune -f
          EOF

      - name: Run database migrations
        run: |
          ssh ${{ secrets.STAGING_USER }}@${{ secrets.STAGING_HOST }} << 'EOF'
            cd /var/www/saborconnect
            docker-compose exec -T backend npx prisma migrate deploy
          EOF

      - name: Health check
        run: |
          sleep 10
          curl -f https://staging.saborconnect.com/health || exit 1

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: deploy-staging
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.PRODUCTION_SSH_KEY }}

      - name: Create backup
        run: |
          ssh ${{ secrets.PRODUCTION_USER }}@${{ secrets.PRODUCTION_HOST }} << 'EOF'
            docker exec saborconnect-db pg_dump -U saborconnect saborconnect > /backups/backup-$(date +%Y%m%d-%H%M%S).sql
          EOF

      - name: Deploy to production
        run: |
          ssh ${{ secrets.PRODUCTION_USER }}@${{ secrets.PRODUCTION_HOST }} << 'EOF'
            cd /var/www/saborconnect
            git pull origin main
            docker-compose pull
            docker-compose up -d --force-recreate --no-deps backend frontend
            docker system prune -f
          EOF

      - name: Run database migrations
        run: |
          ssh ${{ secrets.PRODUCTION_USER }}@${{ secrets.PRODUCTION_HOST }} << 'EOF'
            cd /var/www/saborconnect
            docker-compose exec -T backend npx prisma migrate deploy
          EOF

      - name: Health check
        run: |
          sleep 10
          curl -f https://api.saborconnect.com/health || exit 1

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed! 🚀'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

#### Passo 3: Configurar Secrets no GitHub

```
GitHub Repository > Settings > Secrets and variables > Actions

Secrets necessários:
- DOCKER_USERNAME
- DOCKER_PASSWORD
- STAGING_SSH_KEY
- STAGING_USER
- STAGING_HOST
- PRODUCTION_SSH_KEY
- PRODUCTION_USER
- PRODUCTION_HOST
- SLACK_WEBHOOK (opcional)
```

#### Passo 4: Adicionar Scripts de Deploy

```json
// backend/package.json
{
  "scripts": {
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "migrate:deploy": "prisma migrate deploy",
    "migrate:dev": "prisma migrate dev"
  }
}
```

### 📊 Benefícios Esperados

- ✅ Deploy automático em < 5 minutos
- 🔒 Testes automáticos antes de cada deploy
- 📊 Coverage report automático
- 🔄 Rollback rápido em caso de erro
- 📱 Notificações em tempo real

---

## 3. Monitoring (Prometheus + Grafana)

### 📦 Objetivo

Observabilidade completa da aplicação com métricas, alertas e dashboards.

### Passo 1: Adicionar Prometheus e Grafana

```yaml
# docker-compose.yml
services:
  # ... serviços existentes ...

  prometheus:
    image: prom/prometheus:latest
    container_name: saborconnect-prometheus
    volumes:
      - ./docker/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    ports:
      - '9090:9090'
    networks:
      - saborconnect-network

  grafana:
    image: grafana/grafana:latest
    container_name: saborconnect-grafana
    volumes:
      - grafana_data:/var/lib/grafana
      - ./docker/grafana/provisioning:/etc/grafana/provisioning
      - ./docker/grafana/dashboards:/var/lib/grafana/dashboards
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    ports:
      - '3001:3000'
    depends_on:
      - prometheus
    networks:
      - saborconnect-network

  node-exporter:
    image: prom/node-exporter:latest
    container_name: saborconnect-node-exporter
    ports:
      - '9100:9100'
    networks:
      - saborconnect-network

  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:latest
    container_name: saborconnect-postgres-exporter
    environment:
      DATA_SOURCE_NAME: 'postgresql://saborconnect:saborconnect_password@db:5432/saborconnect?sslmode=disable'
    ports:
      - '9187:9187'
    depends_on:
      - db
    networks:
      - saborconnect-network

  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: saborconnect-redis-exporter
    environment:
      REDIS_ADDR: 'redis:6379'
    ports:
      - '9121:9121'
    depends_on:
      - redis
    networks:
      - saborconnect-network

volumes:
  prometheus_data:
  grafana_data:
```

### Passo 2: Configurar Prometheus

```yaml
# docker/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: []

rule_files:
  - /etc/prometheus/alerts/*.yml

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'backend'
    static_configs:
      - targets: ['backend:4000']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### Passo 3: Adicionar Métricas no Backend

```bash
cd backend
npm install prom-client
```

```typescript
// backend/src/config/metrics.ts
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export const register = new Registry();

// HTTP metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Database metrics
export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'model'],
  buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 2],
  registers: [register],
});

export const dbConnectionsActive = new Gauge({
  name: 'db_connections_active',
  help: 'Number of active database connections',
  registers: [register],
});

// Cache metrics
export const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  registers: [register],
});

export const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  registers: [register],
});

// Business metrics
export const recipesCreated = new Counter({
  name: 'recipes_created_total',
  help: 'Total number of recipes created',
  registers: [register],
});

export const usersRegistered = new Counter({
  name: 'users_registered_total',
  help: 'Total number of users registered',
  registers: [register],
});

export const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of currently active users',
  registers: [register],
});
```

### Passo 4: Middleware de Métricas

```typescript
// backend/src/middleware/metrics.ts
import { Request, Response, NextFunction } from 'express';
import { httpRequestDuration, httpRequestTotal } from '../config/metrics';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;

    httpRequestDuration.labels(req.method, route, res.statusCode.toString()).observe(duration);

    httpRequestTotal.labels(req.method, route, res.statusCode.toString()).inc();
  });

  next();
};
```

### Passo 5: Endpoint de Métricas

```typescript
// backend/src/routes/metrics.routes.ts
import { Router } from 'express';
import { register } from '../config/metrics';

const router = Router();

router.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

export default router;
```

```typescript
// backend/src/index.ts
import metricsRoutes from './routes/metrics.routes';
import { metricsMiddleware } from './middleware/metrics';

// Aplicar middleware de métricas
app.use(metricsMiddleware);

// Rotas
app.use('/metrics', metricsRoutes);
```

### Passo 6: Configurar Dashboards Grafana

```yaml
# docker/grafana/provisioning/datasources/prometheus.yml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
```

```json
// docker/grafana/dashboards/saborconnect.json
{
  "dashboard": {
    "title": "SaborConnect Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m])"
          }
        ]
      },
      {
        "title": "Cache Hit Rate",
        "targets": [
          {
            "expr": "rate(cache_hits_total[5m]) / (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m]))"
          }
        ]
      },
      {
        "title": "Active Database Connections",
        "targets": [
          {
            "expr": "db_connections_active"
          }
        ]
      },
      {
        "title": "Active Users",
        "targets": [
          {
            "expr": "active_users"
          }
        ]
      }
    ]
  }
}
```

### Passo 7: Configurar Alertas

```yaml
# docker/prometheus/alerts/alerts.yml
groups:
  - name: saborconnect_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: 'High error rate detected'
          description: 'Error rate is {{ $value }} (threshold: 0.05)'

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'High response time detected'
          description: 'P95 response time is {{ $value }}s'

      - alert: LowCacheHitRate
        expr: |
          rate(cache_hits_total[5m]) / 
          (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m])) < 0.5
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: 'Low cache hit rate'
          description: 'Cache hit rate is {{ $value }}'

      - alert: HighDatabaseLoad
        expr: rate(db_query_duration_seconds_sum[5m]) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'High database load'
          description: 'Database query time is {{ $value }}s/s'

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: 'Service is down'
          description: '{{ $labels.job }} is down'
```

### Passo 8: Acessar Dashboards

```bash
# Subir todos os serviços
docker-compose up -d

# Acessar Grafana
# URL: http://localhost:3001
# User: admin
# Pass: admin

# Acessar Prometheus
# URL: http://localhost:9090
```

### 📊 Métricas Monitoradas

#### Performance:

- Request rate (req/s)
- Response time (P50, P95, P99)
- Error rate
- Database query time
- Cache hit/miss rate

#### Infrastructure:

- CPU usage
- Memory usage
- Disk I/O
- Network traffic
- Database connections
- Redis memory

#### Business:

- Active users
- New registrations
- Recipes created
- API endpoints usage
- Upload success rate

### 📊 Benefícios Esperados

- 📊 Visibilidade completa da aplicação
- 🚨 Alertas proativos antes de falhas
- 📈 Identificação de gargalos
- 💰 Otimização de custos
- 🔍 Debug facilitado de problemas

---

## ✅ Checklist de Implementação

### Semana 1: Read Replicas + CI/CD

**Dias 1-3: PostgreSQL Read Replicas**

- [ ] Configurar primary database
- [ ] Criar read replicas no docker-compose
- [ ] Atualizar Prisma client
- [ ] Implementar round-robin
- [ ] Atualizar controllers
- [ ] Testar replicação
- [ ] Monitorar lag de replicação

**Dias 4-5: CI/CD**

- [ ] Criar workflow de CI
- [ ] Configurar testes automáticos
- [ ] Configurar secrets no GitHub
- [ ] Criar workflow de CD
- [ ] Testar deploy staging
- [ ] Testar deploy production

### Semana 2: Monitoring

**Dias 6-8: Setup Prometheus + Grafana**

- [ ] Adicionar Prometheus ao docker-compose
- [ ] Adicionar Grafana
- [ ] Configurar exporters (node, postgres, redis)
- [ ] Criar configuração Prometheus
- [ ] Configurar datasource Grafana

**Dias 9-11: Métricas**

- [ ] Instalar prom-client
- [ ] Criar config/metrics.ts
- [ ] Adicionar middleware de métricas
- [ ] Endpoint /metrics
- [ ] Métricas de negócio

**Dias 12-14: Dashboards e Alertas**

- [ ] Criar dashboards Grafana
- [ ] Configurar alertas Prometheus
- [ ] Testar alertas
- [ ] Documentar uso
- [ ] Treinar equipe

---

## 📈 Resultados Esperados

### Performance Final:

```
Capacidade: 50.000+ usuários simultâneos
Latência P95: < 50ms
Throughput: 10.000+ req/s
Uptime: 99.95%
MTTR: < 5 minutos
```

### Observabilidade:

```
✅ Métricas em tempo real
✅ Alertas proativos
✅ Dashboards customizados
✅ Logs estruturados
✅ Tracing distribuído (próxima fase)
```

---

## 💰 Estimativa de Custos

| Serviço                         | Custo/Mês | Notas               |
| ------------------------------- | --------- | ------------------- |
| Read Replicas (2x RDS t3.small) | $100      | Produção            |
| Prometheus (monitored)          | $0        | Self-hosted         |
| Grafana Cloud (opcional)        | $0-49     | Free tier / Pro     |
| GitHub Actions                  | $0        | 2000 min/mês grátis |
| **Total**                       | **~$100** | + custos existentes |

---

## 🎯 Roadmap Futuro

Após completar Fase 3:

1. **Kubernetes Migration** - Orquestração avançada
2. **Service Mesh** - Istio/Linkerd
3. **Distributed Tracing** - Jaeger/Tempo
4. **Advanced Caching** - Varnish/CDN
5. **Message Queue** - RabbitMQ/Kafka
6. **Search Engine** - Elasticsearch

---

**Preparado por:** Equipe SaborConnect  
**Última atualização:** 6 de novembro de 2025
