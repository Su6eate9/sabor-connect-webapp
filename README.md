# 🍳 SaborConnect - Plataforma de Receitas Culinárias Colaborativas

## 📊 Status do Projeto

🚀 **Versão:** 1.0.0  
✅ **Status:** MVP Pronto + Roadmap Completo  
📦 **Banco de Dados:** 500.183 registros  
⚡ **Performance:** 150-230ms latência (target: < 30ms)  
🔒 **Segurança:** JWT + Bcrypt + Helmet + Rate Limiting  
📚 **Documentação:** 6 guias completos (140+ páginas)

### 🎯 Roadmap de Escalabilidade

| Fase                    | Status             | Capacidade    | Latência | Timeline  |
| ----------------------- | ------------------ | ------------- | -------- | --------- |
| **Fase 1: Crítico**     | ✅ **COMPLETO**    | 1k usuários   | 150ms    | 1 dia     |
| **Fase 2: Importante**  | � **EM PROGRESSO** | 10k usuários  | 50ms     | 5 dias    |
| **Fase 3: Recomendado** | 📅 Planejado       | 50k+ usuários | 30ms     | 2 semanas |

#### 📊 Progresso Fase 2:

- ✅ **Dia 1:** Redis Cache - 97% performance boost (221ms → 6ms)
- ✅ **Dias 2-3:** AWS S3 - Código pronto (aguardando configuração AWS)
- ✅ **Dia 4:** CloudFlare CDN - Código pronto (aguardando configuração)
- 📋 **Dia 5:** Load Testing - Próximo

📄 Ver [`RESUMO_EXECUTIVO.md`](./RESUMO_EXECUTIVO.md) para análise completa  
📚 Ver [`INDEX.md`](./INDEX.md) para navegar toda a documentação (10 guias, 150+ páginas)

---

## 🎯 Sobre o Projeto

O SaborConnect é uma **plataforma full-stack moderna** de compartilhamento de receitas culinárias, construída com **TypeScript end-to-end**. Uma rede social gastronômica onde usuários podem descobrir, compartilhar, curtir, comentar e salvar receitas favoritas, criando uma comunidade engajada de apaixonados por culinária.

### 🏗️ Arquitetura

```
Frontend (React + TypeScript + Vite + Tailwind)
                    ↕
Backend (Node.js + Express + TypeScript)
                    ↕
Database (PostgreSQL + Prisma ORM)
                    ↕
Storage (Docker Compose)
```

### ✨ Funcionalidades Principais

#### Core Features:

- ✅ Autenticação JWT com Refresh Tokens
- ✅ CRUD completo de receitas
- ✅ Upload de imagens
- ✅ Sistema de likes e favoritos
- ✅ Comentários em receitas
- ✅ Busca e filtros avançados
- ✅ Paginação server-side
- ✅ Dark mode
- ✅ Responsive design
- ✅ 500k+ registros no banco

#### Produção Ready (Implementado):

- ✅ **Rate Limiting** - Proteção contra DDoS e abuse
- ✅ **Health Checks** - `/health`, `/ready`, `/live`, `/status`
- ✅ **Logs Estruturados** - Winston com JSON format
- ✅ **Error Handling** - Tratamento global de erros
- ✅ **Graceful Shutdown** - Encerramento seguro
- ✅ **Docker Ready** - Container healthchecks

## 📁 Estrutura do Projeto

```
saborconnect/
├── backend/                      # API Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/          # Lógica de negócio
│   │   ├── routes/               # Rotas da API
│   │   ├── middleware/           # Auth, validação, error handling
│   │   ├── validators/           # Schemas Zod
│   │   └── index.ts              # Entry point
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   ├── seed.ts               # Dados de exemplo
│   │   └── seed-large.ts         # População em larga escala (500k+)
│   └── Dockerfile
│
├── frontend/                     # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/                # 10 páginas completas
│   │   ├── components/           # 8+ componentes reutilizáveis
│   │   ├── contexts/             # Auth + Theme contexts
│   │   ├── services/             # API client (Axios)
│   │   └── App.tsx               # Entry point
│   ├── public/
│   └── Dockerfile
│
├── docker-compose.yml            # Orquestração de containers
├── ARCHITECTURE_ANALYSIS.md      # Análise de arquitetura E2E
├── RELATORIO_POPULACAO_E_ESCALABILIDADE.md
├── DASHBOARD_METRICAS.md         # Métricas de performance
├── PLANO_DE_ACAO.md              # Próximos passos
├── performance-test.sh           # Script de testes
└── PRD.md                        # Requisitos do produto
```

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Docker & Docker Compose
- Node.js 18+ (para desenvolvimento local)
- Git

### Opção 1: Docker Compose (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/sabor-connect-webapp.git
cd sabor-connect-webapp

# 2. Configure as variáveis de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Inicie todos os serviços
docker-compose up -d

# 4. Execute as migrations do banco
docker exec saborconnect-backend npx prisma migrate deploy

# 5. (Opcional) Popular com dados de exemplo
docker exec saborconnect-backend npm run prisma:seed

# 6. (Opcional) Popular com 500k+ registros
docker exec saborconnect-backend npm run prisma:seed-large
```

**Serviços disponíveis:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api
- Adminer (DB Admin): http://localhost:8080
- PostgreSQL: localhost:5432

### Opção 2: Desenvolvimento Local

```bash
# Backend
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev  # Roda em http://localhost:4000

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev  # Roda em http://localhost:5173

cd caminho/para/saborconnect

# Inicie o servidor

http-server -p 8000

# Acesse no navegador

http://localhost:8000

Usando Visual Studio Code (Live Server):

1. Instale a extensão "Live Server"
2. Abra a pasta do projeto no VS Code
3. Clique com botão direito em landingPage.html → "Open with Live Server"

Fluxo de Navegação
┌─────────────────┐
│landingPage.html │ ← Landing Page (Página inicial)
│ (Não logado) │
└────────┬────────┘
│
┌────┴────┐
▼ ▼
┌────────┐ ┌──────────┐
│ login │ │ cadastro │
└───┬────┘ └────┬─────┘
│ │
└─────┬─────┘
▼
┌─────────────┐
│ dashboard │ ← Dashboard do usuário
└──────┬──────┘
│
┌──────┼──────┐
▼ ▼ ▼
┌─────┐ ┌───┐ ┌────────┐
│rece-│ │det│ │ perfil │
│itas │ │alh│ │(futuro)│
└─────┘ │es │ └────────┘
└───┘

# Funcionalidades Implementadas

✅ Páginas Completas

1. Landing Page (landingPage.html)

- Hero section com chamada para ação
- Seção "Como Funciona" com 3 cards explicativos
- Grid de receitas em destaque
- Footer com links e redes sociais
- Totalmente responsiva

2. Login (login.html)

- Formulário de autenticação
- Toggle para mostrar/ocultar senha
- Link para recuperação de senha
- Link para cadastro
- Design centralizado e moderno

3. Cadastro (register.html)

- Formulário com validação visual
- Indicador de força de senha
- Toggle para mostrar/ocultar senha
- Checkbox de aceite de termos
- Validação de campos em JavaScript

4. Dashboard (dashboard.html)

- Header fixo com busca e avatar
- Sidebar com menu de navegação
- Cards de estatísticas (receitas, curtidas, favoritos)
- Grid de receitas do usuário
- Feed da comunidade
- Totalmente responsivo

5. Listagem de Receitas (revenues.html)

- Sistema de busca e filtros avançados
- Filtros por categoria, tempo e dificuldade
- Tags de filtros rápidos
- Ordenação (recentes, populares, comentadas)
- Grid responsivo de receitas
- Paginação funcional
- 12 cards de receitas com informações completas

6. Detalhes da Receita (detalhes.html)

- Imagem hero grande
- Informações do autor
- Botões de curtir, salvar e compartilhar (interativos)
- Metadados (tempo, porções, dificuldade, visualizações)
- Lista de ingredientes com checkboxes interativos
- Modo de preparo numerado com design atraente
- Seção de dicas especiais
- Sistema de comentários
- Campo para novo comentário
- 5 comentários de exemplo

✅ Elementos Interativos

- Checkboxes de ingredientes: Clique para marcar como "já adicionado"
- Botão de curtir: Toggle entre curtido/não curtido com contador
- Botão de salvar: Toggle entre salvo/não salvo
- Toggle de senha: Mostra/oculta senha nos formulários
- Indicador de força de senha: Muda conforme a senha é digitada
- Hover effects: Todos os botões e cards respondem ao passar o mouse
- Navegação completa: Todos os links funcionam entre páginas

# 🎨 Design e Paleta de Cores

1. Paleta Principal
   - Laranja Principal: #ff6b35 - Cor de destaque
   - Laranja Secundário: #f7931e - Gradientes e variações
   - Branco: #ffffff - Fundos e textos em botões
   - Cinza Claro: #f5f5f5 - Background das páginas
   - Cinza Médio: #666666 - Textos secundários
   - Cinza Escuro: #333333 - Textos principais

2. Tipografia

- Fonte Principal: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- Tamanhos:
  - Títulos grandes: 2.5rem - 3.5rem
  - Subtítulos: 1.5rem - 2rem
  - Texto normal: 1rem
  - Texto pequeno: 0.85rem - 0.9rem

3. Ícones

- Biblioteca: Font Awesome 6.4.0
- CDN: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css

# Responsividade

O protótipo foi desenvolvido com design responsivo completo, adaptando-se a:

- Desktop: > 1024px (layout completo)
- Tablet: 768px - 1024px (layout adaptado)
- Mobile: < 768px (layout mobile-first)

Breakpoints Principais
@media (max-width: 1024px) { /_ Tablet _/ }
@media (max-width: 768px) { /_ Mobile _/ }

# Recursos de Acessibilidade

- Uso de tags semânticas HTML5 (<header>, <nav>, <main>, <section>, <article>, <footer>)
- Atributos alt em todas as imagens (quando aplicável)
- Labels associados a todos os campos de formulário
- Contraste adequado entre texto e fundo (WCAG AA)
- Áreas de toque mínimas de 44x44px em mobile
- Foco visível em elementos interativos

# Tecnologias Utilizadas

- HTML5: Estrutura semântica e moderna
- CSS3: Estilização com flexbox, grid e animações
- JavaScript Vanilla: Interatividade básica (validações, toggles)
- Font Awesome 6.4.0: Ícones vetoriais

# Estatísticas do Projeto

- Total de Páginas: 6
- Linhas de Código CSS: ~2.500+
- Linhas de Código HTML: ~1.800+
- Componentes Únicos: 15+ (cards, botões, formulários, etc.)
- Ícones Utilizados: 40+
- Tempo Estimado de Desenvolvimento: 12-16 horas

# Funcionalidades Demonstradas

Implementadas no Protótipo
✅ Sistema de navegação entre páginas
✅ Layout responsivo completo
✅ Formulários com validação visual
✅ Interatividade com JavaScript
✅ Animações e transições CSS
✅ Grid de receitas dinâmico
✅ Sistema de filtros (visual)
✅ Comentários e interações sociais (visual)
✅ Indicadores de estado (curtido, salvo)
✅ Design moderno e atrativo

Planejadas para Versão Final (Backend)
⏳ Autenticação real de usuários
⏳ Banco de dados com receitas
⏳ Upload real de imagens
⏳ Sistema de busca funcional
⏳ Filtros dinâmicos
⏳ Comentários persistentes
⏳ Sistema de notificações
⏳ API RESTful

# Compatibilidade de Navegadores

Testado e compatível com:
✅ Google Chrome (versão 90+)
✅ Mozilla Firefox (versão 88+)
✅ Microsoft Edge (versão 90+)
✅ Safari (versão 14+)
✅ Opera (versão 76+)

# 📚 Documentação Adicional

## Guias de Implementação

### 🚀 Roadmap de Escalabilidade

Documentação completa para escalar de 1k para 50k+ usuários:

#### ✅ **Fase 1: Crítico (COMPLETO)**
- 📄 [`GUIA_FASE_1_COMPLETO.md`](./GUIA_FASE_1_COMPLETO.md) - **Guia completo da Fase 1** 🆕
- 📄 [`IMPLEMENTACAO_CRITICAS.md`](./IMPLEMENTACAO_CRITICAS.md) - Documentação técnica
  - Rate Limiting (4 tipos de limitadores)
  - Health Checks (4 endpoints)
  - Structured Logging (Winston)
  - Error Handling Global
  - Graceful Shutdown
  - **Status:** ✅ Implementado e testado

#### 📋 **Fase 2: Importante (80% COMPLETO)**
- 📄 [`GUIA_FASE_2_IMPORTANTES.md`](./GUIA_FASE_2_IMPORTANTES.md)
  - ✅ Redis para Cache Distribuído (97% mais rápido)
  - ✅ Código S3/CDN pronto (aguardando configuração)
  - 📋 Load Testing pendente
  - **Impacto:** 10k usuários simultâneos, latência < 50ms

**🚀 Configure agora:**
- 📘 [`COMECE_AQUI.md`](./COMECE_AQUI.md) - Status atual e próximos passos
- 📗 [`SETUP_CLOUDFLARE_R2.md`](./SETUP_CLOUDFLARE_R2.md) - Setup R2 em 15 min (recomendado)
- 📙 [`SETUP_AWS_S3.md`](./SETUP_AWS_S3.md) - Setup S3 em 20 min
- 📊 [`ESCOLHA_STORAGE.md`](./ESCOLHA_STORAGE.md) - Comparação e decisão rápida

#### 📅 **Fase 3: Recomendado (2 semanas)**
- 📄 [`GUIA_FASE_3_RECOMENDADA.md`](./GUIA_FASE_3_RECOMENDADA.md)
  - PostgreSQL Read Replicas
  - CI/CD Automatizado (GitHub Actions)
  - Monitoring (Prometheus + Grafana)
  - **Impacto:** 50k+ usuários, latência < 30ms, uptime 99.95%

#### 🎯 **Guia de Início Rápido**
- 📄 [`GUIA_INICIO_RAPIDO.md`](./GUIA_INICIO_RAPIDO.md)
  - Visão geral de todas as fases
  - Roadmap visual
  - Checklist de implementação
  - Evolução de capacidade

### 📊 Documentação Técnica

- 📄 [`PRD.md`](./PRD.md) - Product Requirements Document
  - Visão geral e objetivos do produto
  - Análise de problema e oportunidade
  - Personas detalhadas
  - Requisitos funcionais e não-funcionais
  - Regras de negócio
  - Casos de uso completos
  - Modelagem de dados conceitual
  - User stories
  - Wireframes e fluxos de navegação

- 📄 [`PLANO_DE_ACAO.md`](./PLANO_DE_ACAO.md) - Plano Estratégico
  - Análise de arquitetura atual
  - Identificação de gargalos
  - Roadmap de melhorias
  - Estimativas de custo

- 📄 [`ARCHITECTURE_ANALYSIS.md`](./ARCHITECTURE_ANALYSIS.md)
  - Análise detalhada da arquitetura
  - Pontos de melhoria
  - Recomendações técnicas

# Autor

Antonio Claudino S. Neto
Matrícula: 2019004509
Projeto: SaborConnect - Plataforma de Receitas Colaborativas
Data: Outubro 2025

# Notas de Desenvolvimento

1. Decisões de Design

- Gradiente Laranja: Escolhido por remeter a calor, comida e acolhimento
- Cards Elevados: Shadow e hover effects para sensação de profundidade
- Espaçamento Generoso: Facilita leitura e navegação
- Ícones Grandes: Comunicação visual clara e atrativa
- Tipografia Limpa: Prioriza legibilidade em todos os dispositivos

2. Desafios Superados

- Criação de layout complexo sem frameworks
- Responsividade total apenas com CSS puro
- Simulação de interatividade sem backend
- Organização de código sem pré-processadores
- Performance com animações CSS

3. Melhorias Futuras

- Implementação de backend com Node.js/Express
- Banco de dados MongoDB ou PostgreSQL
- Sistema de autenticação JWT
- Upload e processamento de imagens
- PWA (Progressive Web App)
- Testes automatizados
- CI/CD pipeline

# Suporte

Para dúvidas ou sugestões sobre o projeto, consulte a documentação completa no PRD ou entre em contato através do repositório do projeto.

© 2025 SaborConnect. Todos os direitos reservados.
Projeto desenvolvido para fins educacionais.
```
