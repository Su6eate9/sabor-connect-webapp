# 🚀 Início Rápido - SaborConnect

## ⚡ TL;DR - Começar em 2 Minutos

```bash
# 1. Subir tudo
docker-compose up -d

# 2. Aplicar migrations
docker exec saborconnect-backend npx prisma migrate deploy

# 3. Testar
powershell -ExecutionPolicy Bypass -File test-api.ps1

# 4. Acessar
# Backend: http://localhost:4000
# Frontend: http://localhost:5173
```

---

## 📋 Pré-requisitos

- ✅ Docker Desktop instalado e rodando
- ✅ Node.js 18+ (para desenvolvimento frontend local)
- ✅ Git

---

## 🐳 Opção 1: Docker (Recomendado)

### Passo 1: Clonar e Iniciar

```bash
# Clonar repositório
git clone <repo-url>
cd sabor-connect-webapp

# Subir containers (PostgreSQL + Redis + Backend)
docker-compose up -d

# Aguardar 30 segundos para tudo iniciar
```

### Passo 2: Configurar Banco de Dados

```bash
# Aplicar migrations
docker exec saborconnect-backend npx prisma migrate deploy

# (Opcional) Popular com dados de teste
docker exec saborconnect-backend npm run seed
```

### Passo 3: Iniciar Frontend

```bash
# Em outro terminal
cd frontend
npm install
npm run dev
```

### Passo 4: Testar

```bash
# Testar API
powershell -ExecutionPolicy Bypass -File test-api.ps1

# Ou manualmente
curl http://localhost:4000/health
```

### Passo 5: Acessar

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:4000
- **API Docs:** http://localhost:4000/api/status

---

## 💻 Opção 2: Desenvolvimento Local (Sem Docker)

### Passo 1: Instalar PostgreSQL e Redis

**Windows:**
```bash
# PostgreSQL
winget install PostgreSQL.PostgreSQL

# Redis (via WSL ou Docker)
docker run -d -p 6379:6379 redis:7-alpine
```

**macOS:**
```bash
brew install postgresql@15 redis
brew services start postgresql@15
brew services start redis
```

**Linux:**
```bash
sudo apt install postgresql-15 redis-server
sudo systemctl start postgresql redis
```

### Passo 2: Configurar Banco

```bash
# Criar database
psql -U postgres
CREATE DATABASE saborconnect;
CREATE USER saborconnect WITH PASSWORD 'saborconnect123';
GRANT ALL PRIVILEGES ON DATABASE saborconnect TO saborconnect;
\q
```

### Passo 3: Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar .env
cat > .env << EOF
DATABASE_URL="postgresql://saborconnect:saborconnect123@localhost:5432/saborconnect"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
NODE_ENV="development"
PORT=4000
UPLOAD_DIR="./uploads"
EOF

# Aplicar migrations
npx prisma migrate deploy

# (Opcional) Popular banco
npm run seed

# Iniciar backend
npm run dev
```

### Passo 4: Configurar Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Criar .env
cat > .env << EOF
VITE_API_URL=http://localhost:4000/api
EOF

# Iniciar frontend
npm run dev
```

---

## ✅ Verificar Instalação

### 1. Backend Health Check

```bash
curl http://localhost:4000/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-01T..."
}
```

### 2. Database Status

```bash
curl http://localhost:4000/api/status
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "uptime": 123,
  "memory": {...}
}
```

### 3. Teste Completo

```bash
powershell -ExecutionPolicy Bypass -File test-api.ps1
```

**Resultado esperado:**
```
=== SaborConnect API Tests ===

1. Testing Health Check...
OK Health Check: OK

2. Testing User Registration...
OK Login: SUCCESS

3. Testing Get Profile...
OK Get Profile: SUCCESS

4. Testing Get Recipes...
OK Get Recipes: SUCCESS

5. Testing Redis Connection...
OK Redis: connected
OK Database: connected

=== All Tests Completed ===
```

---

## 🌐 Acessar Aplicação

### Frontend
- **URL:** http://localhost:5173
- **Usuário de teste:** test@example.com
- **Senha:** password123

### Backend API
- **Base URL:** http://localhost:4000/api
- **Health:** http://localhost:4000/health
- **Status:** http://localhost:4000/api/status

### Banco de Dados
- **Host:** localhost
- **Port:** 5432
- **Database:** saborconnect
- **User:** saborconnect
- **Password:** saborconnect123

### Redis
- **Host:** localhost
- **Port:** 6379
- **No password**

---

## 🔧 Comandos Úteis

### Docker

```bash
# Ver logs do backend
docker logs saborconnect-backend -f

# Ver logs do PostgreSQL
docker logs saborconnect-db -f

# Reiniciar backend
docker restart saborconnect-backend

# Parar tudo
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down -v

# Rebuild backend
docker-compose up -d --build backend
```

### Prisma

```bash
# Gerar Prisma Client
docker exec saborconnect-backend npx prisma generate

# Aplicar migrations
docker exec saborconnect-backend npx prisma migrate deploy

# Criar nova migration
docker exec saborconnect-backend npx prisma migrate dev --name nome_da_migration

# Abrir Prisma Studio (GUI do banco)
docker exec -it saborconnect-backend npx prisma studio
```

### Backend

```bash
# Entrar no container
docker exec -it saborconnect-backend sh

# Rodar seed
docker exec saborconnect-backend npm run seed

# Ver logs estruturados
docker exec saborconnect-backend cat logs/combined.log
docker exec saborconnect-backend cat logs/error.log
```

### Frontend

```bash
cd frontend

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

---

## 🐛 Troubleshooting

### Backend não inicia

**Problema:** Container sobe mas backend não responde

**Solução:**
```bash
# Ver logs
docker logs saborconnect-backend

# Verificar se PostgreSQL está pronto
docker logs saborconnect-db | grep "ready to accept connections"

# Reiniciar
docker restart saborconnect-backend
```

### Erro de conexão com banco

**Problema:** `Error: P1001: Can't reach database server`

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Verificar network
docker network inspect sabor-connect-webapp_default

# Recriar containers
docker-compose down
docker-compose up -d
```

### Migrations falham

**Problema:** `Migration failed`

**Solução:**
```bash
# Resetar banco (CUIDADO: apaga dados)
docker exec saborconnect-backend npx prisma migrate reset

# Ou aplicar manualmente
docker exec saborconnect-backend npx prisma migrate deploy
```

### Frontend não conecta ao backend

**Problema:** `Network Error` ou `CORS Error`

**Solução:**
1. Verificar se backend está rodando: `curl http://localhost:4000/health`
2. Verificar `VITE_API_URL` no `.env` do frontend
3. Verificar CORS no backend (deve permitir `http://localhost:5173`)

### Redis não conecta

**Problema:** `Error connecting to Redis`

**Solução:**
```bash
# Verificar se Redis está rodando
docker ps | grep redis

# Testar conexão
docker exec saborconnect-redis redis-cli ping
# Deve retornar: PONG

# Reiniciar Redis
docker restart saborconnect-redis
```

---

## 📚 Próximos Passos

Após tudo funcionando:

1. **Explorar a aplicação**
   - Criar conta
   - Fazer login
   - Criar receita
   - Curtir e favoritar
   - Comentar

2. **Ler documentação**
   - [`README.md`](./README.md) - Visão geral
   - [`TODO.md`](./TODO.md) - Tarefas pendentes
   - [`DEPLOY_RENDER.md`](./DEPLOY_RENDER.md) - Deploy em produção
   - [`RESUMO_FINAL.md`](./RESUMO_FINAL.md) - Resumo completo

3. **Desenvolver**
   - Adicionar novas features
   - Melhorar UI/UX
   - Otimizar performance

4. **Deploy**
   - Seguir guia [`DEPLOY_RENDER.md`](./DEPLOY_RENDER.md)
   - Configurar domínio
   - Monitorar aplicação

---

## 🆘 Precisa de Ajuda?

### Recursos
- **Documentação:** Veja os arquivos `.md` na raiz do projeto
- **Logs:** `docker logs saborconnect-backend -f`
- **Prisma Studio:** `docker exec -it saborconnect-backend npx prisma studio`
- **Redis CLI:** `docker exec -it saborconnect-redis redis-cli`

### Comandos de Diagnóstico

```bash
# Status de todos os containers
docker-compose ps

# Health check completo
curl http://localhost:4000/api/status | jq

# Testar autenticação
powershell -ExecutionPolicy Bypass -File test-api.ps1

# Ver uso de recursos
docker stats
```

---

## ✅ Checklist de Verificação

Antes de começar a desenvolver, certifique-se:

- [ ] Docker Desktop está rodando
- [ ] `docker-compose ps` mostra 3 containers "Up"
- [ ] `curl http://localhost:4000/health` retorna `{"status":"ok"}`
- [ ] `curl http://localhost:4000/api/status` mostra database e redis conectados
- [ ] Frontend abre em `http://localhost:5173`
- [ ] Consegue fazer login com `test@example.com` / `password123`
- [ ] Script de testes passa: `test-api.ps1`

Se todos os itens estão ✅, você está pronto! 🎉

---

**Criado por:** Antonio Claudino S. Neto  
**Data:** 01/12/2024  
**Versão:** 1.0

**Boa codificação! 🚀**
