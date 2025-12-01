Write-Host "=== VALIDACAO FINAL DAS CORRECOES ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:4000"
$passed = 0
$failed = 0

# Teste 1: Filtro por dificuldade
Write-Host "1. Testando GET /api/recipes?difficulty=easy..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/recipes?difficulty=easy" -Method GET
    if ($response.success -eq $true) {
        Write-Host "   PASSOU - Status: 200" -ForegroundColor Green
        Write-Host "   Receitas encontradas: $($response.data.Count)" -ForegroundColor Gray
        $passed++
    } else {
        Write-Host "   FALHOU - Resposta invalida" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "   FALHOU - Erro: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Teste 2: Endpoint de stats (publico)
Write-Host ""
Write-Host "2. Testando GET /api/users/:id/stats..." -ForegroundColor Yellow
try {
    # Pegar um ID de usuario qualquer
    $recipesResponse = Invoke-RestMethod -Uri "$baseUrl/api/recipes?limit=1" -Method GET
    $userId = $recipesResponse.data[0].author.id
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/users/$userId/stats" -Method GET
    if ($response.success -eq $true) {
        Write-Host "   PASSOU - Status: 200" -ForegroundColor Green
        Write-Host "   Receitas: $($response.data.recipesCount)" -ForegroundColor Gray
        Write-Host "   Likes: $($response.data.likesReceived)" -ForegroundColor Gray
        Write-Host "   Favoritos: $($response.data.favoritesReceived)" -ForegroundColor Gray
        Write-Host "   Comentarios: $($response.data.commentsReceived)" -ForegroundColor Gray
        $passed++
    } else {
        Write-Host "   FALHOU - Resposta invalida" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "   FALHOU - Erro: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Teste 3: Endpoint de favoritos (requer auth - esperamos 401)
Write-Host ""
Write-Host "3. Testando GET /api/users/favorites (sem auth)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/users/favorites" -Method GET
    Write-Host "   FALHOU - Deveria retornar 401 mas retornou: 200" -ForegroundColor Red
    $failed++
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "   PASSOU - Status: 401 (esperado)" -ForegroundColor Green
        Write-Host "   Endpoint existe e requer autenticacao" -ForegroundColor Gray
        $passed++
    } else {
        Write-Host "   FALHOU - Status inesperado: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "=== RESULTADO FINAL ===" -ForegroundColor Cyan
Write-Host "Testes Passaram: $passed/3" -ForegroundColor Green
Write-Host "Testes Falharam: $failed/3" -ForegroundColor Red
Write-Host ""

if ($passed -eq 3) {
    Write-Host "TODAS AS CORRECOES VALIDADAS COM SUCESSO!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "ALGUMAS CORRECOES FALHARAM" -ForegroundColor Red
    exit 1
}
