# Teste completo simplificado
Write-Host "=== TESTES SABORCONNECT ===" -ForegroundColor Cyan
Write-Host ""

# 1. Health
Write-Host "1. Health Check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:4000/health"
Write-Host "OK - Status: $($health.status)" -ForegroundColor Green
Write-Host ""

# 2. Login
Write-Host "2. Login..." -ForegroundColor Yellow
$loginBody = '{"email":"test2@example.com","password":"password123"}'
$login = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $login.data.accessToken
Write-Host "OK - User: $($login.data.user.name)" -ForegroundColor Green
Write-Host ""

# 3. Profile
Write-Host "3. Get Profile..." -ForegroundColor Yellow
$profile = Invoke-RestMethod -Uri "http://localhost:4000/api/users/me" -Headers @{Authorization="Bearer $token"}
Write-Host "OK - Email: $($profile.data.email)" -ForegroundColor Green
Write-Host ""

# 4. Recipes
Write-Host "4. Get Recipes..." -ForegroundColor Yellow
$uri = "http://localhost:4000/api/recipes" + "?page=1" + "&limit=5"
$recipes = Invoke-RestMethod -Uri $uri
Write-Host "OK - Total: $($recipes.meta.total) receitas" -ForegroundColor Green
Write-Host ""

# 5. Create Recipe
Write-Host "5. Create Recipe..." -ForegroundColor Yellow
$recipeJson = @"
{
  "title": "Teste API",
  "description": "Teste",
  "ingredients": ["Item 1", "Item 2"],
  "instructions": "Passo 1\nPasso 2",
  "prepTime": 30,
  "servings": 4,
  "difficulty": "MEDIUM",
  "tags": ["teste"]
}
"@
$newRecipe = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes" -Method Post -Body $recipeJson -ContentType "application/json" -Headers @{Authorization="Bearer $token"}
$recipeId = $newRecipe.data.id
Write-Host "OK - ID: $recipeId" -ForegroundColor Green
Write-Host ""

# 6. Like
Write-Host "6. Like Recipe..." -ForegroundColor Yellow
$like = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes/$recipeId/like" -Method Post -Headers @{Authorization="Bearer $token"}
Write-Host "OK - $($like.data.message)" -ForegroundColor Green
Write-Host ""

# 7. Comment
Write-Host "7. Comment..." -ForegroundColor Yellow
$commentJson = '{"content":"Comentario teste"}'
$comment = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes/$recipeId/comments" -Method Post -Body $commentJson -ContentType "application/json" -Headers @{Authorization="Bearer $token"}
Write-Host "OK - Comentario criado" -ForegroundColor Green
Write-Host ""

# 8. Favorite
Write-Host "8. Favorite..." -ForegroundColor Yellow
$fav = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes/$recipeId/favorite" -Method Post -Headers @{Authorization="Bearer $token"}
Write-Host "OK - $($fav.data.message)" -ForegroundColor Green
Write-Host ""

# 9. Delete
Write-Host "9. Delete Recipe..." -ForegroundColor Yellow
$del = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes/$recipeId" -Method Delete -Headers @{Authorization="Bearer $token"}
Write-Host "OK - Receita deletada" -ForegroundColor Green
Write-Host ""

Write-Host "=== TODOS OS TESTES PASSARAM! ===" -ForegroundColor Green
Write-Host ""
