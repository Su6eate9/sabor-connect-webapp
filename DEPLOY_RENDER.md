# 🚀 Guia de Deploy no Render

## 📋 Pré-requisitos

- Conta no [Render](https://render.com) (gratuita)
- Repositório Git com o código (GitHub, GitLab ou Bitbucket)
- Código do SaborConnect pronto

## 🗄️ Passo 1: Deploy do PostgreSQL

### 1.1. Criar Database no Render

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `saborconnect-db`
   - **Database:** `saborconnect`
   - **User:** `saborconnect`
   - **Region:** Escolha a mais próxima (ex: Oregon, USA)
   - **PostgreSQL Version:** 15
   - **Plan:** Free (ou Starter $7/mês para produção)

4. Clique em **"Create Database"**

5. **Aguarde 2-3 minutos** até o status ficar "Available"

### 1.2. Copiar Credenciais

Após criado, você verá:

```
Internal Database URL: postgresql://saborconnect:***@dpg-***-a.oregon-postgres.render.com/saborconnect
External Database URL: postgresql://saborconnect:***@dpg-***-a.oregon-postgres.render.com/saborconnect
```

**Copie o External Database URL** - você vai precisar!

---

## 🔴 Passo 2: Deploy do Redis (Opcional)

### Opção A: Redis Cloud (Recomendado - Grátis)

1. Acesse [Redis Cloud](https://redis.com/try-free/)
2. Crie conta gratuita
3. Crie um database:
   - **Name:** `saborconnect-cache`
   - **Plan:** Free (30MB)
   - **Region:** Mesma do Render
4. Copie a **Redis URL**: `redis://default:***@redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345`

### Opção B: Upstash (Alternativa Grátis)

1. Acesse [Upstash](https://upstash.com)
2. Crie database Redis
3. Copie a URL de conexão

### Opção C: Sem Redis (Desenvolvimento)

Se não quiser usar Redis agora, pode desabilitar no código:
- O backend vai funcionar sem cache
- Performance será menor mas funcional

---

## 🖥️ Passo 3: Deploy do Backend

### 3.1. Preparar Repositório

Certifique-se que seu repositório tem:

```
backend/
├── src/
├── prisma/
├── package.json
├── tsconfig.json
└── Dockerfile (opcional)
```

### 3.2. Criar Web Service no Render

1. No Render Dashboard, clique em **"New +"** → **"Web Service"**

2. Conecte seu repositório Git

3. Configure:
   - **Name:** `saborconnect-api`
   - **Region:** Mesma do PostgreSQL
   - **Branch:** `main` (ou sua branch principal)
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm install && npx prisma generate && npx prisma migrate deploy && npm run build
     ```
   - **Start Command:**
     ```bash
     npm start
     ```
   - **Plan:** Free (ou Starter $7/mês)

### 3.3. Configurar Variáveis de Ambiente

Na seção **"Environment Variables"**, adicione:

```bash
# Database
DATABASE_URL=<COLE_AQUI_O_EXTERNAL_DATABASE_URL_DO_PASSO_1>

# JWT
JWT_SECRET=<GERE_UMA_STRING_ALEATORIA_SEGURA>
JWT_REFRESH_SECRET=<GERE_OUTRA_STRING_ALEATORIA_SEGURA>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis (se estiver usando)
REDIS_URL=<COLE_AQUI_A_REDIS_URL_DO_PASSO_2>

# Node
NODE_ENV=production
PORT=4000

# Upload (local storage por enquanto)
UPLOAD_DIR=./uploads

# CORS (adicione o domínio do frontend depois)
CORS_ORIGIN=*
```

**Como gerar secrets seguros:**

```bash
# No terminal local:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.4. Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o build (5-10 minutos na primeira vez)
3. Quando terminar, você verá: **"Your service is live 🎉"**
4. Copie a URL: `https://saborconnect-api.onrender.com`

### 3.5. Testar Backend

```bash
# Health check
curl https://saborconnect-api.onrender.com/health

# Deve retornar:
{"status":"ok","timestamp":"2024-12-01T..."}
```

---

## 🎨 Passo 4: Deploy do Frontend

### Opção A: Vercel (Recomendado)

1. Acesse [Vercel](https://vercel.com)
2. Clique em **"Add New Project"**
3. Importe seu repositório
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **Environment Variables:**
   ```bash
   VITE_API_URL=https://saborconnect-api.onrender.com/api
   ```

6. Deploy!

7. Sua URL será: `https://saborconnect.vercel.app`

### Opção B: Netlify

1. Acesse [Netlify](https://netlify.com)
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Conecte seu repositório
4. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`

5. **Environment Variables:**
   ```bash
   VITE_API_URL=https://saborconnect-api.onrender.com/api
   ```

6. Deploy!

### Opção C: Render (Tudo no mesmo lugar)

1. No Render, clique em **"New +"** → **"Static Site"**
2. Configure:
   - **Name:** `saborconnect-web`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

3. **Environment Variables:**
   ```bash
   VITE_API_URL=https://saborconnect-api.onrender.com/api
   ```

---

## 🔧 Passo 5: Configurar CORS

Agora que o frontend está no ar, atualize o CORS no backend:

1. Vá no Render Dashboard → Backend Service
2. Em **Environment Variables**, edite:
   ```bash
   CORS_ORIGIN=https://saborconnect.vercel.app
   ```
   (ou sua URL do Netlify/Render)

3. Salve e aguarde o redeploy automático

---

## ✅ Passo 6: Testar Aplicação Completa

1. Acesse seu frontend: `https://saborconnect.vercel.app`
2. Teste:
   - ✅ Registro de usuário
   - ✅ Login
   - ✅ Criar receita
   - ✅ Upload de imagem
   - ✅ Listar receitas
   - ✅ Curtir/Favoritar
   - ✅ Comentários

---

## 📊 Monitoramento

### Logs do Backend

No Render Dashboard → Backend Service → **"Logs"**

### Métricas

No Render Dashboard → Backend Service → **"Metrics"**
- CPU Usage
- Memory Usage
- Request Count
- Response Time

---

## 💰 Custos

### Plano Free (Desenvolvimento)

| Serviço    | Custo  | Limitações                          |
| ---------- | ------ | ----------------------------------- |
| PostgreSQL | $0/mês | 1GB storage, 97 horas/mês           |
| Backend    | $0/mês | 750 horas/mês, sleep após inativo   |
| Frontend   | $0/mês | 100GB bandwidth                     |
| Redis      | $0/mês | 30MB (Redis Cloud)                  |
| **TOTAL**  | **$0** | Perfeito para desenvolvimento/testes |

### Plano Pago (Produção)

| Serviço    | Custo   | Benefícios                        |
| ---------- | ------- | --------------------------------- |
| PostgreSQL | $7/mês  | 10GB storage, sempre ativo        |
| Backend    | $7/mês  | Sempre ativo, 0.5GB RAM           |
| Frontend   | $0/mês  | Ilimitado (Vercel/Netlify)        |
| Redis      | $0/mês  | 30MB suficiente                   |
| **TOTAL**  | **$14** | Suporta 1k-5k usuários simultâneos |

---

## 🐛 Troubleshooting

### Backend não inicia

**Erro:** `Error: P1001: Can't reach database server`

**Solução:**
1. Verifique se o `DATABASE_URL` está correto
2. Certifique-se que o PostgreSQL está "Available"
3. Use o **External Database URL**, não o Internal

### Migrations falham

**Erro:** `Migration failed`

**Solução:**
```bash
# No Render Shell (Backend Service → Shell):
npx prisma migrate deploy
npx prisma generate
```

### Frontend não conecta ao Backend

**Erro:** `Network Error` ou `CORS Error`

**Solução:**
1. Verifique se `VITE_API_URL` está correto
2. Verifique se `CORS_ORIGIN` no backend inclui a URL do frontend
3. Teste o backend diretamente: `curl https://saborconnect-api.onrender.com/health`

### Backend "dorme" (Free Plan)

**Comportamento:** Primeira requisição demora 30-60s

**Solução:**
- Normal no plano Free
- Backend "acorda" após primeira requisição
- Para evitar: upgrade para Starter ($7/mês)
- Ou use um serviço de "ping" (ex: UptimeRobot)

---

## 🚀 Próximos Passos

Após deploy bem-sucedido:

1. **Domínio Customizado** (opcional)
   - Render: Settings → Custom Domain
   - Vercel: Settings → Domains

2. **SSL/HTTPS**
   - Automático no Render/Vercel/Netlify ✅

3. **Backup do Banco**
   - Render PostgreSQL tem backup automático
   - Ou configure backup manual

4. **Monitoring**
   - Configure alertas no Render
   - Use Sentry para error tracking (opcional)

5. **CI/CD**
   - Deploy automático já configurado via Git
   - Push para `main` = deploy automático

---

## 📚 Recursos

- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Deploy](https://www.prisma.io/docs/guides/deployment)
- [Redis Cloud](https://redis.com/redis-enterprise-cloud/overview/)

---

**Criado por:** Antonio Claudino S. Neto  
**Data:** 01/12/2024  
**Versão:** 1.0
