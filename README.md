# SaborConnect - Plataforma de Receitas Culinárias Colaborativas

Sobre o Projeto
O SaborConnect é uma plataforma web colaborativa dedicada ao compartilhamento de receitas culinárias. O projeto foi desenvolvido como protótipo navegável utilizando apenas HTML5 e CSS3 puros, sem frameworks ou bibliotecas externas (exceto Font Awesome para ícones).
O sistema simula uma rede social gastronômica onde usuários podem descobrir, compartilhar, curtir, comentar e salvar receitas favoritas, criando uma comunidade engajada de apaixonados por culinária.

Estrutura de Arquivos
saborconnect/
├── landingPage.html # Landing page / Página inicial
├── login.html # Página de login
├── register.html # Página de cadastro de novos usuários
├── dashboard.html # Dashboard do usuário autenticado
├── revenues.html # Listagem completa de receitas com filtros
├── revenuesDetails.html # Página de detalhes de uma receita específica
├── PRD_SaborConnect.md # Documento de Requisitos do Produto
└── README.txt # Este arquivo

Como Executar o Projeto
Opção 1: Abrir Diretamente no Navegador

1. Extraia todos os arquivos em uma pasta no seu computador
2. Localize o arquivo landingPage.html
3. Clique duas vezes no arquivo ou clique com botão direito → "Abrir com" → Escolha seu navegador preferido
4. A landing page será carregada e você poderá navegar entre todas as páginas

Opção 2: Usar um Servidor Local (Recomendado)
Para uma experiência mais próxima de um ambiente de produção:

Usando Python 3:

# Navegue até a pasta do projeto

cd caminho/para/saborconnect

# Inicie um servidor HTTP simples

python -m http.server 8000

# Acesse no navegador

http://localhost:8000

Usando Node.js (http-server):

# Instale o http-server globalmente (se ainda não tiver)

npm install -g http-server

# Navegue até a pasta do projeto

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

# Documentação Adicional

Para informações detalhadas sobre requisitos, personas, casos de uso e modelagem de dados, consulte o arquivo PRD_SaborConnect.md incluído no projeto.
O PRD contém:

- Visão geral e objetivos do produto
- Análise de problema e oportunidade
- Personas detalhadas
- Requisitos funcionais e não-funcionais
- Regras de negócio
- Casos de uso completos
- Modelagem de dados conceitual
- User stories
- Wireframes e fluxos de navegação

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
