# ⚡ Comandos Rápidos - SaborConnect

Guia de referência rápida com os comandos mais utilizados durante desenvolvimento e implementação.

---

## 🐳 Docker

### Gerenciamento de Containers

```bash
# Subir todos os containers
docker-compose up -d

# Subir apenas um serviço
docker-compose up -d backend
docker-compose up -d frontend
docker-compose up -d db
docker-compose up -d redis

# Rebuild e subir
docker-compose up -d --build

# Rebuild apenas backend
docker-compose up -d --build backend

# Parar todos os containers
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down -v

# Ver logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Ver status dos containers
docker-compose ps

# Reiniciar um serviço
docker restart saborconnect-backend
docker restart saborconnect-db
docker restart saborconnect-redis

# Executar comando dentro do container
docker exec -it saborconnect-backend sh
docker exec -it saborconnect-db psql -U saborconnect
```

---

## 📦 Instalação de Dependências

### Backend

```bash
# Entrar no diretório
cd backend

# Instalar dependências
npm install

# Instalar dependência específica
npm install express-rate-limit
npm install ioredis
npm install @aws-sdk/client-s3
npm install winston

# Instalar dev dependencies
npm install --save-dev @types/express
npm install --save-dev @types/ioredis

# Dentro do container
docker exec saborconnect-backend npm install
docker exec saborconnect-backend npm install express-rate-limit
```

### Frontend

```bash
# Entrar no diretório
cd frontend

# Instalar dependências
npm install

# Instalar dependência específica
npm install axios
npm install react-router-dom
```

---

## 🗄️ Database (Prisma)

### Migrations

```bash
# Criar e aplicar migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations pendentes
npx prisma migrate deploy

# Resetar banco (CUIDADO: apaga dados)
npx prisma migrate reset

# Ver status das migrations
npx prisma migrate status

# Dentro do container
docker exec saborconnect-backend npx prisma migrate dev --name init
docker exec saborconnect-backend npx prisma migrate deploy
docker exec saborconnect-backend npx prisma migrate reset --force
```

### Prisma Studio

```bash
# Abrir Prisma Studio (GUI para banco)
npx prisma studio

# Dentro do container (não recomendado)
docker exec saborconnect-backend npx prisma studio
```

### Seed

```bash
# Executar seed
npm run seed

# Seed de receitas (50k)
npm run seed:recipes

# Dentro do container
docker exec saborconnect-backend npm run seed
```

### PostgreSQL Direto

```bash
# Conectar ao banco
docker exec -it saborconnect-db psql -U saborconnect -d saborconnect

# Queries úteis dentro do psql:
\dt                                          # Listar tabelas
\d "User"                                    # Descrever tabela User
SELECT COUNT(*) FROM "User";                 # Contar usuários
SELECT COUNT(*) FROM "Recipe";               # Contar receitas
SELECT * FROM "User" LIMIT 5;                # Ver 5 usuários
\q                                           # Sair

# Executar query diretamente
docker exec saborconnect-db psql -U saborconnect -d saborconnect -c "SELECT COUNT(*) FROM \"User\";"
```

---

## ✅ Health Checks

```bash
# Health check básico
curl http://localhost:4000/health

# Readiness (verifica DB)
curl http://localhost:4000/ready

# Liveness
curl http://localhost:4000/live

# Status completo (métricas)
curl http://localhost:4000/api/status

# Formatado
curl -s http://localhost:4000/api/status | jq

# Health check frontend
curl http://localhost:5173
```

---

## 🔒 Rate Limiting

### Testar Rate Limiting

```bash
# Testar limite de login (5 tentativas/15min)
for i in {1..6}; do
  echo "Tentativa $i:"
  curl -X POST http://localhost:4000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo -e "\n"
done

# Testar limite de API (100 req/15min)
for i in {1..105}; do
  curl -s http://localhost:4000/api/recipes > /dev/null
  echo "Request $i"
done
```

---

## 📝 Logs

### Ver Logs Estruturados

```bash
# Ver logs em tempo real
docker exec saborconnect-backend tail -f logs/combined.log

# Ver apenas erros
docker exec saborconnect-backend tail -f logs/error.log

# Últimas 30 linhas
docker exec saborconnect-backend tail -n 30 logs/combined.log

# Últimas 50 linhas formatadas
docker exec saborconnect-backend cat logs/combined.log | tail -50 | jq

# Buscar por palavra-chave
docker exec saborconnect-backend grep "error" logs/combined.log

# Buscar requests HTTP
docker exec saborconnect-backend grep "HTTP" logs/combined.log

# Ver tamanho dos logs
docker exec saborconnect-backend ls -lh logs/
```

---

## ⚡ Redis (Fase 2)

### Comandos Redis

```bash
# Conectar ao Redis
docker exec -it saborconnect-redis redis-cli

# Comandos dentro do redis-cli:
PING                           # Testar conexão
INFO stats                     # Estatísticas
INFO memory                    # Uso de memória
KEYS *                         # Listar todas as keys
GET cache:/api/recipes         # Ver valor de uma key
TTL cache:/api/recipes         # Ver tempo restante (segundos)
DEL cache:/api/recipes         # Deletar uma key
FLUSHALL                       # Limpar tudo (CUIDADO!)

# Executar direto
docker exec saborconnect-redis redis-cli PING
docker exec saborconnect-redis redis-cli INFO stats
docker exec saborconnect-redis redis-cli KEYS "*"

# Monitorar em tempo real
docker exec saborconnect-redis redis-cli MONITOR
```

### Testar Cache

```bash
# Request 1 (cache miss)
curl -w "\nTempo: %{time_total}s\n" http://localhost:4000/api/recipes

# Request 2 (cache hit - deve ser mais rápido)
curl -w "\nTempo: %{time_total}s\n" http://localhost:4000/api/recipes

# Ver cache hit rate
docker exec saborconnect-redis redis-cli INFO stats | grep keyspace_hits
docker exec saborconnect-redis redis-cli INFO stats | grep keyspace_misses
```

---

## ☁️ AWS S3 (Fase 2)

### AWS CLI

```bash
# Listar buckets
aws s3 ls

# Listar arquivos no bucket
aws s3 ls s3://saborconnect-uploads --recursive

# Listar com tamanho e total
aws s3 ls s3://saborconnect-uploads --recursive --human-readable --summarize

# Upload manual
aws s3 cp local-file.jpg s3://saborconnect-uploads/test.jpg

# Download
aws s3 cp s3://saborconnect-uploads/test.jpg local-file.jpg

# Ver propriedades de um arquivo
aws s3api head-object --bucket saborconnect-uploads --key test.jpg

# Deletar arquivo
aws s3 rm s3://saborconnect-uploads/test.jpg
```

---

## 🌍 CloudFlare (Fase 2)

### Purge Cache

```bash
# Purge tudo (via API)
curl -X POST "https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer {API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'

# Purge URLs específicas
curl -X POST "https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer {API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://api.saborconnect.com/recipes"]}'
```

---

## 🧪 Testing

### Manual Testing

```bash
# Testar endpoint de receitas
curl http://localhost:4000/api/recipes

# Criar receita (precisa de token)
curl -X POST http://localhost:4000/api/recipes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{"title":"Teste","description":"Descrição","prepTime":30}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"password123"}'
```

### Load Testing (k6)

```bash
# Instalar k6 (Mac)
brew install k6

# Instalar k6 (Linux)
sudo apt-get install k6

# Executar teste simples
k6 run tests/load/simple.js

# Teste com 100 VUs por 30s
k6 run --vus 100 --duration 30s tests/load/recipes.js

# Teste com rampa gradual
k6 run --stage "0s:0,10s:50,20s:100,30s:0" tests/load/recipes.js
```

---

## 📊 Monitoring (Fase 3)

### Prometheus

```bash
# Acessar web UI
open http://localhost:9090

# Testar query via API
curl http://localhost:9090/api/v1/query?query=up

# Ver todas as métricas disponíveis
curl http://localhost:9090/api/v1/label/__name__/values
```

### Grafana

```bash
# Acessar web UI
open http://localhost:3001

# Credenciais padrão:
# User: admin
# Pass: admin

# Backup de dashboard (exportar JSON via UI)
# Restore: Import > Upload JSON
```

### Métricas da Aplicação

```bash
# Ver métricas Prometheus da API
curl http://localhost:4000/metrics

# Ver métricas formatadas
curl http://localhost:4000/metrics | grep http_requests_total
curl http://localhost:4000/metrics | grep http_request_duration
```

---

## 🔧 Troubleshooting

### Container não inicia

```bash
# Ver logs do container
docker-compose logs backend

# Ver últimos erros
docker-compose logs backend | grep -i error

# Rebuild forçado
docker-compose down
docker-compose up -d --build --force-recreate

# Remover imagens órfãs
docker system prune -a
```

### Erro de conexão com banco

```bash
# Verificar se DB está rodando
docker-compose ps db

# Ver logs do DB
docker-compose logs db

# Testar conexão
docker exec saborconnect-db pg_isready -U saborconnect

# Reiniciar DB
docker restart saborconnect-db
```

### Prisma não conecta

```bash
# Regenerar Prisma Client
npx prisma generate

# Verificar DATABASE_URL
docker exec saborconnect-backend env | grep DATABASE_URL

# Testar conexão manual
docker exec saborconnect-db psql -U saborconnect -d saborconnect -c "SELECT 1;"
```

### Rate limiting muito agressivo

```bash
# Aumentar limites em rateLimiter.ts
# Ou limpar Redis
docker exec saborconnect-redis redis-cli FLUSHALL
```

### Logs não aparecem

```bash
# Verificar se diretório existe
docker exec saborconnect-backend ls -la logs/

# Criar se não existir
docker exec saborconnect-backend mkdir -p logs

# Verificar permissões
docker exec saborconnect-backend chmod 755 logs/
```

---

## 🚀 Deploy

### Build para Produção

```bash
# Frontend
cd frontend
npm run build
ls -la dist/

# Backend (TypeScript)
cd backend
npm run build
ls -la dist/

# Docker build manual
docker build -t saborconnect-backend:latest ./backend
docker build -t saborconnect-frontend:latest ./frontend
```

### Deploy (Manual)

```bash
# Pull código
git pull origin main

# Rebuild containers
docker-compose down
docker-compose up -d --build

# Aplicar migrations
docker exec saborconnect-backend npx prisma migrate deploy

# Verificar saúde
curl http://localhost:4000/health
```

---

## 📚 Documentação

### Abrir Documentação

```bash
# Guia Fase 2
code GUIA_FASE_2_IMPORTANTES.md

# Guia Fase 3
code GUIA_FASE_3_RECOMENDADA.md

# Checklist
code CHECKLIST_IMPLEMENTACAO.md

# README
code README.md
```

---

## 🎯 Comandos Úteis do Dia a Dia

```bash
# Ver status geral
docker-compose ps && docker-compose logs --tail=10 backend

# Reiniciar backend
docker restart saborconnect-backend && docker-compose logs -f backend

# Ver métricas rápidas
curl -s http://localhost:4000/api/status | jq

# Ver últimos logs
docker exec saborconnect-backend tail -20 logs/combined.log | jq

# Testar tudo está funcionando
curl http://localhost:4000/health && \
curl http://localhost:4000/ready && \
curl http://localhost:4000/live && \
echo "✅ All health checks passed!"

# Backup rápido do banco
docker exec saborconnect-db pg_dump -U saborconnect saborconnect > backup-$(date +%Y%m%d).sql

# Restore do banco
cat backup-20251106.sql | docker exec -i saborconnect-db psql -U saborconnect -d saborconnect
```

---

**Dica:** Adicione aliases no seu `.bashrc` ou `.zshrc`:

```bash
# Adicionar ao ~/.bashrc ou ~/.zshrc
alias dc='docker-compose'
alias dcup='docker-compose up -d'
alias dcdown='docker-compose down'
alias dclogs='docker-compose logs -f'
alias dcps='docker-compose ps'
alias sb-health='curl http://localhost:4000/health'
alias sb-status='curl -s http://localhost:4000/api/status | jq'
alias sb-logs='docker exec saborconnect-backend tail -f logs/combined.log'
```

---

**Última Atualização:** 6 de novembro de 2025  
**Projeto:** SaborConnect
