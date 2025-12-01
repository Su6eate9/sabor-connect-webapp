# Script de teste completo dos endpoints do SaborConnect

Write-Host "=== TESTANDO ENDPOINTS DO SABORCONNECT ===" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1. Testando Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:4000/health" -Method Get
    Write-Host "✓ Health Check: OK" -ForegroundColor Green
    Write-Host "  Status: $($health.status)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Health Check: FALHOU" -ForegroundColor Red
}
Write-Host ""

# 2. Login
Write-Host "2. Testando Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "test2@example.com"
        password = "password123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    Write-Host "✓ Login: SUCCESS" -ForegroundColor Green
    Write-Host "  User: $($loginResponse.data.user.name)" -ForegroundColor Gray
    Write-Host "  Token obtido: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Login: FALHOU" -ForegroundColor Red
    Write-Host "  Erro: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 3. Get Profile
Write-Host "3. Testando Get Profile (/api/users/me)..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $profile = Invoke-RestMethod -Uri "http://localhost:4000/api/users/me" -Method Get -Headers $headers
    Write-Host "✓ Get Profile: SUCCESS" -ForegroundColor Green
    Write-Host "  Nome: $($profile.data.name)" -ForegroundColor Gray
    Write-Host "  Email: $($profile.data.email)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Get Profile: FALHOU" -ForegroundColor Red
    Write-Host "  Erro: $_" -ForegroundColor Red
}
Write-Host ""

# 4. Get Recipes
Write-Host "4. Testando Get Recipes..." -ForegroundColor Yellow
try {
    $recipes = Invoke-RestMethod -Uri 'http://localhost:4000/api/recipes?page=1&limit=5' -Method Get
    Write-Host "✓ Get Recipes: SUCCESS" -ForegroundColor Green
    Write-Host "  Total: $($recipes.meta.total) receitas" -ForegroundColor Gray
    Write-Host "  Página: $($recipes.meta.page)/$($recipes.meta.totalPages)" -ForegroundColor Gray
    Write-Host "  Primeira receita: $($recipes.data[0].title)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Get Recipes: FALHOU" -ForegroundColor Red
}
Write-Host ""

# 5. Create Recipe
Write-Host "5. Testando Create Recipe..." -ForegroundColor Yellow
try {
    $recipeBody = @{
        title = "Receita de Teste API - $(Get-Date -Format 'HH:mm:ss')"
        description = "Receita criada via teste automatizado"
        ingredients = @("Ingrediente 1", "Ingrediente 2", "Ingrediente 3")
        instructions = "Passo 1: Preparar ingredientes`nPasso 2: Misturar tudo`nPasso 3: Servir"
        prepTime = 30
        servings = 4
        difficulty = "MEDIUM"
        tags = @("teste", "api")
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $newRecipe = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes" -Method Post -Body $recipeBody -Headers $headers
    $recipeId = $newRecipe.data.id
    Write-Host "✓ Create Recipe: SUCCESS" -ForegroundColor Green
    Write-Host "  ID: $recipeId" -ForegroundColor Gray
    Write-Host "  Título: $($newRecipe.data.title)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Create Recipe: FALHOU" -ForegroundColor Red
    Write-Host "  Erro: $_" -ForegroundColor Red
    $recipeId = $null
}
Write-Host ""

# 6. Get Recipe by ID
if ($recipeId) {
    Write-Host "6. Testando Get Recipe by ID..." -ForegroundColor Yellow
    try {
        $recipe = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes/$recipeId" -Method Get
        Write-Host "✓ Get Recipe by ID: SUCCESS" -ForegroundColor Green
        Write-Host "  Título: $($recipe.data.title)" -ForegroundColor Gray
        Write-Host "  Autor: $($recipe.data.author.name)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Get Recipe by ID: FALHOU" -ForegroundColor Red
    }
    Write-Host ""
}

# 7. Like Recipe
if ($recipeId) {
    Write-Host "7. Testando Like Recipe..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        $like = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes/$recipeId/like" -Method Post -Headers $headers
        Write-Host "✓ Like Recipe: SUCCESS" -ForegroundColor Green
        Write-Host "  Mensagem: $($like.data.message)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Like Recipe: FALHOU" -ForegroundColor Red
        Write-Host "  Erro: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# 8. Comment on Recipe
if ($recipeId) {
    Write-Host "8. Testando Comment on Recipe..." -ForegroundColor Yellow
    try {
        $commentBody = @{
            content = "Comentário de teste via API - $(Get-Date -Format 'HH:mm:ss')"
        } | ConvertTo-Json

        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }

        $comment = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes/$recipeId/comments" -Method Post -Body $commentBody -Headers $headers
        Write-Host "✓ Comment on Recipe: SUCCESS" -ForegroundColor Green
        Write-Host "  Comentário: $($comment.data.content)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Comment on Recipe: FALHOU" -ForegroundColor Red
        Write-Host "  Erro: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# 9. Favorite Recipe
if ($recipeId) {
    Write-Host "9. Testando Favorite Recipe..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        $favorite = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes/$recipeId/favorite" -Method Post -Headers $headers
        Write-Host "✓ Favorite Recipe: SUCCESS" -ForegroundColor Green
        Write-Host "  Mensagem: $($favorite.data.message)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Favorite Recipe: FALHOU" -ForegroundColor Red
        Write-Host "  Erro: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# 10. Get Favorites
Write-Host "10. Testando Get Favorites..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $favorites = Invoke-RestMethod -Uri "http://localhost:4000/api/favorites" -Method Get -Headers $headers
    Write-Host "✓ Get Favorites: SUCCESS" -ForegroundColor Green
    Write-Host "  Total de favoritos: $($favorites.meta.total)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Get Favorites: FALHOU" -ForegroundColor Red
    Write-Host "  Erro: $_" -ForegroundColor Red
}
Write-Host ""

# 11. Search Recipes
Write-Host "11. Testando Search Recipes..." -ForegroundColor Yellow
try {
    $search = Invoke-RestMethod -Uri 'http://localhost:4000/api/recipes?search=bolo&page=1&limit=5' -Method Get
    Write-Host "✓ Search Recipes: SUCCESS" -ForegroundColor Green
    Write-Host "  Resultados para 'bolo': $($search.meta.total)" -ForegroundColor Gray
    if ($search.data.Count -gt 0) {
        Write-Host "  Primeira receita: $($search.data[0].title)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Search Recipes: FALHOU" -ForegroundColor Red
}
Write-Host ""

# 12. Filter by Difficulty
Write-Host "12. Testando Filter by Difficulty..." -ForegroundColor Yellow
try {
    $filtered = Invoke-RestMethod -Uri 'http://localhost:4000/api/recipes?difficulty=EASY&page=1&limit=5' -Method Get
    Write-Host "✓ Filter by Difficulty: SUCCESS" -ForegroundColor Green
    Write-Host "  Receitas EASY: $($filtered.meta.total)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Filter by Difficulty: FALHOU" -ForegroundColor Red
}
Write-Host ""

# 13. Update Recipe
if ($recipeId) {
    Write-Host "13. Testando Update Recipe..." -ForegroundColor Yellow
    try {
        $updateBody = @{
            title = "Receita Atualizada - $(Get-Date -Format 'HH:mm:ss')"
            description = "Descrição atualizada via API"
        } | ConvertTo-Json

        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }

        $updated = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes/$recipeId" -Method Put -Body $updateBody -Headers $headers
        Write-Host "✓ Update Recipe: SUCCESS" -ForegroundColor Green
        Write-Host "  Novo título: $($updated.data.title)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Update Recipe: FALHOU" -ForegroundColor Red
        Write-Host "  Erro: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# 14. Delete Recipe
if ($recipeId) {
    Write-Host "14. Testando Delete Recipe..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        $deleted = Invoke-RestMethod -Uri "http://localhost:4000/api/recipes/$recipeId" -Method Delete -Headers $headers
        Write-Host "✓ Delete Recipe: SUCCESS" -ForegroundColor Green
        Write-Host "  Mensagem: $($deleted.data.message)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Delete Recipe: FALHOU" -ForegroundColor Red
        Write-Host "  Erro: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Resumo Final
Write-Host ""
Write-Host "=== RESUMO DOS TESTES ===" -ForegroundColor Cyan
Write-Host "Todos os endpoints principais foram testados!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximo passo: Testar frontend no navegador" -ForegroundColor Yellow
Write-Host "Execute: cd frontend && npm run dev" -ForegroundColor Gray
Write-Host ""
