# 🍳 SaborConnect - Full Stack Implementation

## 📋 Sobre o Projeto

SaborConnect é uma plataforma colaborativa de receitas culinárias construída com tecnologias modernas. Este é o **projeto completo full-stack** com frontend React e backend Node.js.

### 🎯 Stack Tecnológica

**Frontend:**
- ⚛️ React 18 + TypeScript
- ⚡ Vite
- 🎨 Tailwind CSS
- 🔄 React Query (TanStack Query)
- 🛣️ React Router v6
- 📝 React Hook Form + Zod
- 🔐 JWT Authentication

**Backend:**
- 🟢 Node.js + TypeScript
- 🚂 Express.js
- 🗄️ PostgreSQL
- 🔺 Prisma ORM
- 🔒 JWT + Refresh Tokens
- 🖼️ Multer (upload de imagens)
- ✅ Zod (validação)

**DevOps:**
- 🐳 Docker + Docker Compose
- 📦 Monorepo com npm workspaces

---

## 🚀 Setup Rápido (com Docker)

### Pré-requisitos
- Docker & Docker Compose instalados
- Node.js 18+ (para desenvolvimento local sem Docker)

### 1. Clone e Configure

```bash
cd sabor-connect-webapp

# Crie os arquivos .env
cp .env.example .env
cp backend/.env.example backend/.env  
cp frontend/.env.example frontend/.env
```

### 2. Inicie os Containers

```bash
# Build e start de todos os serviços
docker-compose up -d

# Aguarde os containers iniciarem (~30s)
```

### 3. Execute as Migrations e Seed

```bash
# Execute as migrations do Prisma
docker-compose exec backend npx prisma migrate dev

# Popule o banco com dados de exemplo
docker-compose exec backend npx prisma db seed
```

### 4. Acesse a Aplicação

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000/api
- **Adminer (DB GUI):** http://localhost:8080

**Credenciais de teste:**
- Email: `maria@example.com` / Senha: `password123`
- Email: `joao@example.com` / Senha: `password123`

---

## 💻 Setup Local (sem Docker)

### Backend

```bash
cd backend

# Instale as dependências
npm install

# Configure o .env
cp .env.example .env
# Edite DATABASE_URL para seu PostgreSQL local

# Gere o Prisma Client
npx prisma generate

# Execute as migrations
npx prisma migrate dev

# Popule o banco
npm run prisma:seed

# Inicie o servidor de desenvolvimento
npm run dev
```

O backend estará rodando em `http://localhost:4000`

### Frontend

```bash
cd frontend

# Instale as dependências
npm install

# Configure o .env
cp .env.example .env

# Inicie o dev server
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

---

## 📁 Estrutura do Projeto

```
sabor-connect-webapp/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Schema do banco de dados
│   │   └── seed.ts                # Script de seed com dados exemplo
│   ├── src/
│   │   ├── config/                # Configurações (DB, env)
│   │   ├── controllers/           # Controllers (auth, recipe, etc)
│   │   ├── middleware/            # Middlewares (auth, upload, errors)
│   │   ├── routes/                # Definição de rotas
│   │   ├── utils/                 # Utilitários (auth, errors, response)
│   │   ├── validators/            # Schemas de validação Zod
│   │   └── index.ts               # Entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Componentes reutilizáveis
│   │   ├── contexts/              # Context API (Auth)
│   │   ├── lib/                   # Utilitários (api, constants)
│   │   ├── pages/                 # Páginas/Rotas
│   │   ├── types/                 # TypeScript types
│   │   ├── App.tsx                # App principal com rotas
│   │   ├── main.tsx               # Entry point
│   │   └── index.css              # Estilos globais + Tailwind
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── docker-compose.yml             # Orquestração dos serviços
├── package.json                   # Root package (workspaces)
└── README.md                      # Este arquivo
```

---

## 🔑 API Endpoints

### Autenticação (`/api/auth`)
- `POST /register` - Criar conta
- `POST /login` - Login
- `POST /refresh` - Renovar token
- `POST /logout` - Logout
- `GET /me` - Dados do usuário autenticado

### Receitas (`/api/recipes`)
- `GET /` - Listar receitas (com filtros)
- `GET /:slug` - Detalhes de uma receita
- `POST /` - Criar receita (auth)
- `PATCH /:id` - Editar receita (auth, autor)
- `DELETE /:id` - Deletar receita (auth, autor)
- `GET /user/:userId` - Receitas de um usuário

### Interações
- `POST /api/recipes/:id/like` - Curtir receita
- `DELETE /api/recipes/:id/like` - Remover curtida
- `POST /api/recipes/:id/favorite` - Favoritar
- `DELETE /api/recipes/:id/favorite` - Desfavoritar
- `GET /api/favorites` - Listar favoritos (auth)
- `POST /api/recipes/:id/comments` - Comentar
- `GET /api/recipes/:id/comments` - Listar comentários
- `DELETE /api/comments/:id` - Deletar comentário

### Usuários (`/api/users`)
- `GET /:id` - Perfil público
- `PATCH /:id` - Atualizar perfil (auth)

---

## 🗄️ Schema do Banco (Prisma)

**Models principais:**
- `User` - Usuários
- `Recipe` - Receitas
- `Ingredient` - Ingredientes
- `Tag` - Tags/categorias
- `Comment` - Comentários
- `Like` - Curtidas
- `Favorite` - Favoritos
- `RefreshToken` - Tokens de refresh

Ver detalhes em: `backend/prisma/schema.prisma`

---

## 🎨 Design System (Tailwind)

**Paleta de cores:**
```css
primary: #ff6b35    /* Laranja vibrante */
secondary: #f7931e  /* Laranja claro */
accent: #004e89     /* Azul escuro */
```

**Componentes utilitários:**
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`
- `.input`
- `.card`
- `.container-custom`

---

## 🧪 Scripts Úteis

### Backend
```bash
npm run dev              # Dev server com hot reload
npm run build            # Build para produção
npm run start            # Start produção
npm run lint             # Lint com ESLint
npm run prisma:migrate   # Executar migrations
npm run prisma:seed      # Popular banco com dados
npm run prisma:studio    # Interface visual do Prisma
```

### Frontend
```bash
npm run dev              # Dev server (Vite)
npm run build            # Build para produção
npm run preview          # Preview do build
npm run lint             # Lint com ESLint
```

### Root
```bash
npm run dev              # Inicia backend + frontend simultaneamente
npm run build            # Build completo (backend + frontend)
npm run docker:up        # Inicia containers Docker
npm run docker:down      # Para containers
```

---

## 🐳 Docker Commands

```bash
# Build e start
docker-compose up -d

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Parar containers
docker-compose down

# Rebuild após mudanças
docker-compose up -d --build

# Executar comandos no container
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed
```

---

## 📝 Variáveis de Ambiente

### Backend (`.env`)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/saborconnect
JWT_SECRET=seu-secret-super-seguro
JWT_REFRESH_SECRET=seu-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
PORT=4000
UPLOAD_DIR=./uploads
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:4000/api
```

---

## 🔒 Segurança

- ✅ Senhas hashadas com bcrypt
- ✅ JWT com refresh tokens
- ✅ Validação de inputs com Zod
- ✅ Proteção CORS
- ✅ Helmet.js (security headers)
- ✅ Upload de arquivos seguro (Multer)
- ✅ SQL Injection protected (Prisma)

---

## 📦 Funcionalidades Implementadas

### ✅ Autenticação
- [x] Registro de usuário
- [x] Login com JWT
- [x] Refresh token automático
- [x] Logout
- [x] Proteção de rotas

### ✅ Receitas
- [x] Criar receita com upload de imagem
- [x] Listar receitas com paginação
- [x] Busca por título/ingredientes
- [x] Filtro por dificuldade
- [x] Visualizar detalhes
- [x] Editar/deletar (autor)
- [x] Contador de visualizações

### ✅ Interações
- [x] Curtir/descurtir receitas
- [x] Favoritar receitas
- [x] Comentar em receitas
- [x] Listar favoritos do usuário

### ✅ Usuários
- [x] Perfil público
- [x] Editar perfil
- [x] Upload de avatar
- [x] Listar receitas do usuário

---

## 🚀 Deploy (Produção)

### Opção 1: Docker Compose (Simples)
```bash
# No servidor
git clone <repo>
cd sabor-connect-webapp
cp .env.example .env
# Configure .env com valores de produção

docker-compose -f docker-compose.yml up -d
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run prisma:seed
```

### Opção 2: Serviços Separados
- **Frontend:** Vercel, Netlify ou AWS S3 + CloudFront
- **Backend:** Heroku, DigitalOcean, AWS EC2, ou Railway
- **Database:** AWS RDS, DigitalOcean Managed PostgreSQL

---

## 🧩 Próximos Passos / Melhorias

### Features adicionais sugeridas:
- [ ] Confirmação de email
- [ ] Reset de senha
- [ ] Avaliação com estrelas (rating)
- [ ] Feed personalizado
- [ ] Notificações
- [ ] Modo escuro
- [ ] PWA (Progressive Web App)
- [ ] Compartilhamento social
- [ ] Exportar receita para PDF
- [ ] Planejador de refeições
- [ ] Lista de compras

### Melhorias técnicas:
- [ ] Testes unitários (Jest)
- [ ] Testes de integração (Supertest)
- [ ] Testes E2E (Playwright)
- [ ] CI/CD (GitHub Actions)
- [ ] Monitoring (Sentry)
- [ ] Analytics
- [ ] Cache (Redis)
- [ ] CDN para imagens
- [ ] Full-text search (Elasticsearch)

---

## 📄 Licença

Este projeto é open-source e está disponível sob a [MIT License](LICENSE).

---

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. Verifique a documentação acima
2. Confira as [Issues](../../issues) existentes
3. Abra uma nova Issue se necessário

---

## 🎉 Agradecimentos

Desenvolvido com ❤️ usando as melhores práticas e tecnologias modernas.

**Happy Coding! 🚀**
