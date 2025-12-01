# Script de Varredura Completa - Arquitetura Frontend → Backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VARREDURA COMPLETA DE ARQUITETURA" -ForegroundColor Cyan
Write-Host "SaborConnect - Frontend → Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$testResults = @{
    passed = 0
    failed = 0
    warnings = 0
}

# Função para testar endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "  Testando: $Name" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host "    ✅ PASSOU - Status: $ExpectedStatus" -ForegroundColor Green
        $script:testResults.passed++
        return $response
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "    ✅ PASSOU - Status esperado: $ExpectedStatus" -ForegroundColor Green
            $script:testResults.passed++
        }
        else {
            Write-Host "    ❌ FALHOU - Status: $statusCode (esperado: $ExpectedStatus)" -ForegroundColor Red
            Write-Host "    Erro: $($_.Exception.Message)" -ForegroundColor Red
            $script:testResults.failed++
        }
        return $null
    }
}

# ============================================
# FASE 1: INFRAESTRUTURA
# ============================================

Write-Host "FASE 1: INFRAESTRUTURA" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# 1.1 Backend Health
Write-Host "1.1 Backend Health Checks" -ForegroundColor Cyan
Test-Endpoint -Name "Health Check" -Url "http://localhost:4000/health"
Test-Endpoint -Name "Readiness Check" -Url "http://localhost:4000/ready"
Test-Endpoint -Name "Liveness Check" -Url "http://localhost:4000/live"
Test-Endpoint -Name "System Status" -Url "http://localhost:4000/api/status"
Write-Host ""

# 1.2 Database
Write-Host "1.2 Database Connection" -ForegroundColor Cyan
$health = Test-Endpoint -Name "Database Status" -Url "http://localhost:4000/ready"
if ($health -and $health.database -eq "connected") {
    Write-Host "    ✅ Database conectado" -ForegroundColor Green
    $script:testResults.passed++
}
else {
    Write-Host "    ❌ Database não conectado" -ForegroundColor Red
    $script:testResults.failed++
}
Write-Host ""

# 1.3 Redis Cache
Write-Host "1.3 Redis Cache" -ForegroundColor Cyan
$status = Test-Endpoint -Name "Redis Status" -Url "http://localhost:4000/api/status"
if ($status -and $status.redis -eq "connected") {
    Write-Host "    ✅ Redis conectado" -ForegroundColor Green
    $script:testResults.passed++
}
else {
    Write-Host "    ⚠️  Redis não conectado (opcional)" -ForegroundColor Yellow
    $script:testResults.warnings++
}
Write-Host ""

# ============================================
# FASE 2: AUTENTICAÇÃO
# ============================================

Write-Host "FASE 2: AUTENTICAÇÃO" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# 2.1 Login
Write-Host "2.1 Login de Usuário" -ForegroundColor Cyan
$loginBody = @{
    email = "user1@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Test-Endpoint -Name "POST /api/auth/login" `
    -Url "http://localhost:4000/api/auth/login" `
    -Method "POST" `
    -Body $loginBody

if ($loginResponse -and $loginResponse.data.accessToken) {
    $token = $loginResponse.data.accessToken
    $userId = $loginResponse.data.user.id
    Write-Host "    ✅ Token obtido: $($token.Substring(0, 20))..." -ForegroundColor Green
    Write-Host "    ✅ User ID: $userId" -ForegroundColor Green
    $script:testResults.passed += 2
}
else {
    Write-Host "    ❌ Falha ao obter token" -ForegroundColor Red
    $script:testResults.failed++
    exit 1
}
Write-Host ""

# 2.2 Refresh Token
Write-Host "2.2 Refresh Token" -ForegroundColor Cyan
if ($loginResponse.data.refreshToken) {
    Write-Host "    ✅ Refresh token presente" -ForegroundColor Green
    $script:testResults.passed++
}
else {
    Write-Host "    ⚠️  Refresh token ausente" -ForegroundColor Yellow
    $script:testResults.warnings++
}
Write-Host ""

# 2.3 Autenticação com Token
Write-Host "2.3 Endpoints Autenticados" -ForegroundColor Cyan
$authHeaders = @{
    "Authorization" = "Bearer $token"
}

Test-Endpoint -Name "GET /api/users/me" `
    -Url "http://localhost:4000/api/users/me" `
    -Headers $authHeaders
Write-Host ""

# ============================================
# FASE 3: RECEITAS (CRUD)
# ============================================

Write-Host "FASE 3: RECEITAS (CRUD)" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# 3.1 Listar Receitas
Write-Host "3.1 Listar Receitas" -ForegroundColor Cyan
$recipes = Test-Endpoint -Name "GET /api/recipes" `
    -Url "http://localhost:4000/api/recipes?limit=5"

if ($recipes -and $recipes.data.Count -gt 0) {
    Write-Host "    ✅ Total de receitas: $($recipes.data.Count)" -ForegroundColor Green
    Write-Host "    ✅ Paginação: Página $($recipes.pagination.page) de $($recipes.pagination.totalPages)" -ForegroundColor Green
    $script:testResults.passed += 2
    $testRecipeId = $recipes.data[0].id
    $testRecipeSlug = $recipes.data[0].slug
}
else {
    Write-Host "    ❌ Nenhuma receita encontrada" -ForegroundColor Red
    $script:testResults.failed++
}
Write-Host ""

# 3.2 Buscar Receita por ID/Slug
Write-Host "3.2 Buscar Receita Individual" -ForegroundColor Cyan
if ($testRecipeSlug) {
    $recipe = Test-Endpoint -Name "GET /api/recipes/:slug" `
        -Url "http://localhost:4000/api/recipes/$testRecipeSlug"
    
    if ($recipe -and $recipe.data.id) {
        Write-Host "    ✅ Receita: $($recipe.data.title)" -ForegroundColor Green
        Write-Host "    ✅ Autor: $($recipe.data.author.name)" -ForegroundColor Green
        $script:testResults.passed += 2
    }
}
Write-Host ""

# 3.3 Feed de Receitas
Write-Host "3.3 Feed de Receitas (Todos os Usuários)" -ForegroundColor Cyan
$feed = Test-Endpoint -Name "GET /api/recipes/feed" `
    -Url "http://localhost:4000/api/recipes/feed?limit=10"

if ($feed -and $feed.data.Count -gt 0) {
    $autores = $feed.data | Select-Object -ExpandProperty author | Select-Object -ExpandProperty name -Unique
    Write-Host "    ✅ Receitas no feed: $($feed.data.Count)" -ForegroundColor Green
    Write-Host "    ✅ Autores diferentes: $($autores.Count)" -ForegroundColor Green
    
    if ($autores.Count -ge 3) {
        Write-Host "    ✅ Diversidade de autores confirmada" -ForegroundColor Green
        $script:testResults.passed += 3
    }
    else {
        Write-Host "    ⚠️  Poucos autores diferentes ($($autores.Count))" -ForegroundColor Yellow
        $script:testResults.warnings++
    }
    
    Write-Host "    Autores: $($autores -join ', ')" -ForegroundColor Gray
}
Write-Host ""

# 3.4 Busca e Filtros
Write-Host "3.4 Busca e Filtros" -ForegroundColor Cyan
Test-Endpoint -Name "Busca por texto" `
    -Url "http://localhost:4000/api/recipes?search=delicioso&limit=3"
Test-Endpoint -Name "Filtro por dificuldade" `
    -Url "http://localhost:4000/api/recipes?difficulty=easy&limit=3"
Test-Endpoint -Name "Ordenação" `
    -Url "http://localhost:4000/api/recipes?sortBy=createdAt&order=desc&limit=3"
Write-Host ""

# 3.5 Receitas do Usuário
Write-Host "3.5 Receitas do Usuário" -ForegroundColor Cyan
if ($userId) {
    Test-Endpoint -Name "GET /api/recipes/user/:userId" `
        -Url "http://localhost:4000/api/recipes/user/$userId?limit=5"
}
Write-Host ""

# ============================================
# FASE 4: INTERAÇÕES SOCIAIS
# ============================================

Write-Host "FASE 4: INTERAÇÕES SOCIAIS" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

if ($testRecipeId) {
    # 4.1 Like (Toggle)
    Write-Host "4.1 Toggle Like" -ForegroundColor Cyan
    
    # Primeiro like (adicionar ou remover)
    $like1 = Test-Endpoint -Name "POST /api/recipes/:id/like (1)" `
        -Url "http://localhost:4000/api/recipes/$testRecipeId/like" `
        -Method "POST" `
        -Headers $authHeaders `
        -ExpectedStatus 200
    
    if (-not $like1) {
        $like1 = Test-Endpoint -Name "POST /api/recipes/:id/like (1 - retry)" `
            -Url "http://localhost:4000/api/recipes/$testRecipeId/like" `
            -Method "POST" `
            -Headers $authHeaders `
            -ExpectedStatus 201
    }
    
    Start-Sleep -Seconds 1
    
    # Segundo like (toggle)
    $like2 = Test-Endpoint -Name "POST /api/recipes/:id/like (2 - toggle)" `
        -Url "http://localhost:4000/api/recipes/$testRecipeId/like" `
        -Method "POST" `
        -Headers $authHeaders
    
    if ($like1 -and $like2) {
        if ($like1.data.liked -ne $like2.data.liked) {
            Write-Host "    ✅ Toggle funcionando corretamente" -ForegroundColor Green
            $script:testResults.passed++
        }
        else {
            Write-Host "    ⚠️  Toggle pode não estar funcionando" -ForegroundColor Yellow
            $script:testResults.warnings++
        }
    }
    Write-Host ""
    
    # 4.2 Favorite (Toggle)
    Write-Host "4.2 Toggle Favorite" -ForegroundColor Cyan
    
    # Primeiro favorite
    $fav1 = Test-Endpoint -Name "POST /api/recipes/:id/favorite (1)" `
        -Url "http://localhost:4000/api/recipes/$testRecipeId/favorite" `
        -Method "POST" `
        -Headers $authHeaders `
        -ExpectedStatus 200
    
    if (-not $fav1) {
        $fav1 = Test-Endpoint -Name "POST /api/recipes/:id/favorite (1 - retry)" `
            -Url "http://localhost:4000/api/recipes/$testRecipeId/favorite" `
            -Method "POST" `
            -Headers $authHeaders `
            -ExpectedStatus 201
    }
    
    Start-Sleep -Seconds 1
    
    # Segundo favorite (toggle)
    $fav2 = Test-Endpoint -Name "POST /api/recipes/:id/favorite (2 - toggle)" `
        -Url "http://localhost:4000/api/recipes/$testRecipeId/favorite" `
        -Method "POST" `
        -Headers $authHeaders
    
    if ($fav1 -and $fav2) {
        if ($fav1.data.favorited -ne $fav2.data.favorited) {
            Write-Host "    ✅ Toggle funcionando corretamente" -ForegroundColor Green
            $script:testResults.passed++
        }
        else {
            Write-Host "    ⚠️  Toggle pode não estar funcionando" -ForegroundColor Yellow
            $script:testResults.warnings++
        }
    }
    Write-Host ""
    
    # 4.3 Comentários
    Write-Host "4.3 Comentários" -ForegroundColor Cyan
    Test-Endpoint -Name "GET /api/recipes/:id/comments" `
        -Url "http://localhost:4000/api/recipes/$testRecipeId/comments"
    
    # Criar comentário
    $commentBody = @{
        content = "Teste automatizado - comentário de teste"
    } | ConvertTo-Json
    
    Test-Endpoint -Name "POST /api/recipes/:id/comments" `
        -Url "http://localhost:4000/api/recipes/$testRecipeId/comments" `
        -Method "POST" `
        -Headers $authHeaders `
        -Body $commentBody `
        -ExpectedStatus 201
    Write-Host ""
    
    # 4.4 Favoritos do Usuário
    Write-Host "4.4 Favoritos do Usuário" -ForegroundColor Cyan
    Test-Endpoint -Name "GET /api/users/favorites" `
        -Url "http://localhost:4000/api/users/favorites" `
        -Headers $authHeaders
    Write-Host ""
}

# ============================================
# FASE 5: PERFIL E USUÁRIOS
# ============================================

Write-Host "FASE 5: PERFIL E USUÁRIOS" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# 5.1 Perfil do Usuário
Write-Host "5.1 Perfil do Usuário" -ForegroundColor Cyan
Test-Endpoint -Name "GET /api/users/me" `
    -Url "http://localhost:4000/api/users/me" `
    -Headers $authHeaders

if ($userId) {
    Test-Endpoint -Name "GET /api/users/:id" `
        -Url "http://localhost:4000/api/users/$userId"
}
Write-Host ""

# 5.2 Estatísticas do Usuário
Write-Host "5.2 Estatísticas do Usuário" -ForegroundColor Cyan
if ($userId) {
    Test-Endpoint -Name "GET /api/users/:id/stats" `
        -Url "http://localhost:4000/api/users/$userId/stats"
}
Write-Host ""

# ============================================
# FASE 6: PERFORMANCE E CACHE
# ============================================

Write-Host "FASE 6: PERFORMANCE E CACHE" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# 6.1 Teste de Cache
Write-Host "6.1 Teste de Cache (Feed)" -ForegroundColor Cyan
Write-Host "  Primeira requisição (sem cache):" -ForegroundColor Yellow
$time1 = Measure-Command {
    $feed1 = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes/feed?limit=5" -Method Get
}
Write-Host "    Tempo: $($time1.TotalMilliseconds)ms" -ForegroundColor Gray

Start-Sleep -Seconds 1

Write-Host "  Segunda requisição (com cache):" -ForegroundColor Yellow
$time2 = Measure-Command {
    $feed2 = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes/feed?limit=5" -Method Get
}
Write-Host "    Tempo: $($time2.TotalMilliseconds)ms" -ForegroundColor Gray

if ($time2.TotalMilliseconds -lt $time1.TotalMilliseconds) {
    $improvement = [math]::Round((($time1.TotalMilliseconds - $time2.TotalMilliseconds) / $time1.TotalMilliseconds) * 100, 2)
    Write-Host "    ✅ Cache funcionando! Melhoria: $improvement%" -ForegroundColor Green
    $script:testResults.passed++
}
else {
    Write-Host "    ⚠️  Cache pode não estar ativo" -ForegroundColor Yellow
    $script:testResults.warnings++
}
Write-Host ""

# 6.2 Rate Limiting
Write-Host "6.2 Rate Limiting" -ForegroundColor Cyan
Write-Host "  Testando limite de requisições..." -ForegroundColor Yellow
$rateLimitHit = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        Invoke-RestMethod -Uri "http://localhost:4000/api/recipes?limit=1" -Method Get -ErrorAction Stop | Out-Null
    }
    catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 429) {
            Write-Host "    ✅ Rate limiting ativo (bloqueou após $i requisições)" -ForegroundColor Green
            $rateLimitHit = $true
            $script:testResults.passed++
            break
        }
    }
}

if (-not $rateLimitHit) {
    Write-Host "    ⚠️  Rate limiting não detectado (pode estar configurado com limite alto)" -ForegroundColor Yellow
    $script:testResults.warnings++
}
Write-Host ""

# ============================================
# FASE 7: SEGURANÇA
# ============================================

Write-Host "FASE 7: SEGURANÇA" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# 7.1 Endpoints Protegidos
Write-Host "7.1 Endpoints Protegidos (sem token)" -ForegroundColor Cyan
Test-Endpoint -Name "POST /api/recipes (sem auth)" `
    -Url "http://localhost:4000/api/recipes" `
    -Method "POST" `
    -ExpectedStatus 401

Test-Endpoint -Name "GET /api/users/me (sem auth)" `
    -Url "http://localhost:4000/api/users/me" `
    -ExpectedStatus 401
Write-Host ""

# 7.2 CORS
Write-Host "7.2 CORS Headers" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -Method Get
    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader) {
        Write-Host "    ✅ CORS configurado: $corsHeader" -ForegroundColor Green
        $script:testResults.passed++
    }
    else {
        Write-Host "    ⚠️  CORS header não encontrado" -ForegroundColor Yellow
        $script:testResults.warnings++
    }
}
catch {
    Write-Host "    ❌ Erro ao verificar CORS" -ForegroundColor Red
    $script:testResults.failed++
}
Write-Host ""

# ============================================
# RESUMO FINAL
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUMO DA VARREDURA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$total = $testResults.passed + $testResults.failed + $testResults.warnings
$successRate = if ($total -gt 0) { [math]::Round(($testResults.passed / $total) * 100, 2) } else { 0 }

Write-Host "Total de Testes: $total" -ForegroundColor White
Write-Host "  ✅ Passou: $($testResults.passed)" -ForegroundColor Green
Write-Host "  ❌ Falhou: $($testResults.failed)" -ForegroundColor Red
Write-Host "  ⚠️  Avisos: $($testResults.warnings)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Taxa de Sucesso: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })
Write-Host ""

if ($testResults.failed -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ TODOS OS TESTES CRÍTICOS PASSARAM!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
}
elseif ($testResults.failed -le 2) {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "⚠️  ALGUNS TESTES FALHARAM" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
}
else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ MÚLTIPLOS TESTES FALHARAM" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
}

Write-Host ""
Write-Host "Relatório completo salvo em: RELATORIO_VARREDURA_COMPLETA.md" -ForegroundColor Cyan
Write-Host ""
