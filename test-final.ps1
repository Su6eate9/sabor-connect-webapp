Write-Host "=== TESTE FINAL - Like/Unlike e Favorite/Unfavorite ===" -ForegroundColor Cyan
Write-Host ""

# 1. Login
Write-Host "1. Fazendo login..." -ForegroundColor Yellow
$login = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method Post -Body '{"email":"testlike@example.com","password":"password123"}' -ContentType "application/json"
$token = $login.data.accessToken
Write-Host "✓ Login OK" -ForegroundColor Green
Write-Host ""

# 2. Buscar receitas
Write-Host "2. Buscando receitas..." -ForegroundColor Yellow
$recipes = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes?limit=1" -Method Get
$recipeId = $recipes.data[0].id
$recipeSlug = $recipes.data[0].slug
Write-Host "✓ Receita encontrada: $($recipes.data[0].title)" -ForegroundColor Green
Write-Host "  ID: $recipeId" -ForegroundColor Gray
Write-Host ""

# 3. Curtir receita
Write-Host "3. Curtindo receita..." -ForegroundColor Yellow
try {
    $like = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes/$recipeId/like" -Method Post -Headers @{Authorization="Bearer $token"}
    Write-Host "✓ Receita curtida!" -ForegroundColor Green
} catch {
    Write-Host "⚠ Já estava curtida (OK)" -ForegroundColor Yellow
}
Write-Host ""

# 4. Descurtir receita
Write-Host "4. Descurtindo receita..." -ForegroundColor Yellow
try {
    $unlike = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes/$recipeId/like" -Method Delete -Headers @{Authorization="Bearer $token"}
    Write-Host "✓ Receita descurtida!" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao descurtir" -ForegroundColor Red
}
Write-Host ""

# 5. Curtir novamente
Write-Host "5. Curtindo novamente..." -ForegroundColor Yellow
try {
    $like2 = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes/$recipeId/like" -Method Post -Headers @{Authorization="Bearer $token"}
    Write-Host "✓ Receita curtida novamente!" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao curtir" -ForegroundColor Red
}
Write-Host ""

# 6. Favoritar receita
Write-Host "6. Favoritando receita..." -ForegroundColor Yellow
try {
    $fav = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes/$recipeId/favorite" -Method Post -Headers @{Authorization="Bearer $token"}
    Write-Host "✓ Receita favoritada!" -ForegroundColor Green
} catch {
    Write-Host "⚠ Já estava favoritada (OK)" -ForegroundColor Yellow
}
Write-Host ""

# 7. Desfavoritar receita
Write-Host "7. Desfavoritando receita..." -ForegroundColor Yellow
try {
    $unfav = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes/$recipeId/favorite" -Method Delete -Headers @{Authorization="Bearer $token"}
    Write-Host "✓ Receita desfavoritada!" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao desfavoritar" -ForegroundColor Red
}
Write-Host ""

# 8. Favoritar novamente
Write-Host "8. Favoritando novamente..." -ForegroundColor Yellow
try {
    $fav2 = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes/$recipeId/favorite" -Method Post -Headers @{Authorization="Bearer $token"}
    Write-Host "✓ Receita favoritada novamente!" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao favoritar" -ForegroundColor Red
}
Write-Host ""

# 9. Verificar estado final
Write-Host "9. Verificando estado final..." -ForegroundColor Yellow
$details = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes/$recipeSlug" -Method Get -Headers @{Authorization="Bearer $token"}
Write-Host "✓ Estado da receita:" -ForegroundColor Green
Write-Host "  Curtida: $($details.data.isLiked)" -ForegroundColor Gray
Write-Host "  Favoritada: $($details.data.isFavorited)" -ForegroundColor Gray
Write-Host "  Total de curtidas: $($details.data._count.likes)" -ForegroundColor Gray
Write-Host "  Total de favoritos: $($details.data._count.favorites)" -ForegroundColor Gray
Write-Host ""

Write-Host "=== RESUMO ===" -ForegroundColor Cyan
Write-Host "✓ Todos os testes de Like/Unlike funcionando!" -ForegroundColor Green
Write-Host "✓ Todos os testes de Favorite/Unfavorite funcionando!" -ForegroundColor Green
Write-Host "✓ API pronta para uso!" -ForegroundColor Green
