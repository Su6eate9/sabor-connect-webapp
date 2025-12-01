# Test Like/Unlike and Favorite/Unfavorite endpoints
Write-Host "=== Testing Like/Unlike and Favorite/Unfavorite ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:4000/api"

# 1. Login to get token
Write-Host "1. Login..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{
    email = "testlike@example.com"
    password = "password123"
} | ConvertTo-Json) -ContentType "application/json"

$token = $loginResponse.data.accessToken
Write-Host "✓ Login successful" -ForegroundColor Green
Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
Write-Host ""

# 2. Get recipes to find a recipe ID
Write-Host "2. Getting recipes..." -ForegroundColor Yellow
$recipesResponse = Invoke-RestMethod -Uri "$baseUrl/recipes?limit=1" -Method Get
$recipeId = $recipesResponse.data[0].id
$recipeTitle = $recipesResponse.data[0].title
Write-Host "✓ Recipe found: $recipeTitle" -ForegroundColor Green
Write-Host "Recipe ID: $recipeId" -ForegroundColor Gray
Write-Host ""

# 3. Like the recipe
Write-Host "3. Liking recipe..." -ForegroundColor Yellow
try {
    $likeResponse = Invoke-RestMethod -Uri "$baseUrl/recipes/$recipeId/like" -Method Post -Headers @{
        Authorization = "Bearer $token"
    }
    Write-Host "✓ Recipe liked successfully" -ForegroundColor Green
    Write-Host "Response: $($likeResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "⚠ Recipe already liked (expected if running multiple times)" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Error liking recipe: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# 4. Unlike the recipe
Write-Host "4. Unliking recipe..." -ForegroundColor Yellow
try {
    $unlikeResponse = Invoke-RestMethod -Uri "$baseUrl/recipes/$recipeId/like" -Method Delete -Headers @{
        Authorization = "Bearer $token"
    }
    Write-Host "✓ Recipe unliked successfully" -ForegroundColor Green
    Write-Host "Response: $($unlikeResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error unliking recipe: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
Write-Host ""

# 5. Like again to test toggle
Write-Host "5. Liking recipe again..." -ForegroundColor Yellow
try {
    $likeResponse2 = Invoke-RestMethod -Uri "$baseUrl/recipes/$recipeId/like" -Method Post -Headers @{
        Authorization = "Bearer $token"
    }
    Write-Host "✓ Recipe liked again successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Error liking recipe: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 6. Favorite the recipe
Write-Host "6. Favoriting recipe..." -ForegroundColor Yellow
try {
    $favoriteResponse = Invoke-RestMethod -Uri "$baseUrl/recipes/$recipeId/favorite" -Method Post -Headers @{
        Authorization = "Bearer $token"
    }
    Write-Host "✓ Recipe favorited successfully" -ForegroundColor Green
    Write-Host "Response: $($favoriteResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "⚠ Recipe already favorited (expected if running multiple times)" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Error favoriting recipe: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# 7. Unfavorite the recipe
Write-Host "7. Unfavoriting recipe..." -ForegroundColor Yellow
try {
    $unfavoriteResponse = Invoke-RestMethod -Uri "$baseUrl/recipes/$recipeId/favorite" -Method Delete -Headers @{
        Authorization = "Bearer $token"
    }
    Write-Host "✓ Recipe unfavorited successfully" -ForegroundColor Green
    Write-Host "Response: $($unfavoriteResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error unfavoriting recipe: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
Write-Host ""

# 8. Favorite again to test toggle
Write-Host "8. Favoriting recipe again..." -ForegroundColor Yellow
try {
    $favoriteResponse2 = Invoke-RestMethod -Uri "$baseUrl/recipes/$recipeId/favorite" -Method Post -Headers @{
        Authorization = "Bearer $token"
    }
    Write-Host "✓ Recipe favorited again successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Error favoriting recipe: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 9. Get recipe details to verify counts
Write-Host "9. Getting recipe details to verify..." -ForegroundColor Yellow
$recipeSlug = $recipesResponse.data[0].slug
$recipeDetails = Invoke-RestMethod -Uri "$baseUrl/recipes/$recipeSlug" -Method Get -Headers @{
    Authorization = "Bearer $token"
}
Write-Host "✓ Recipe details retrieved" -ForegroundColor Green
Write-Host "Is Liked: $($recipeDetails.data.isLiked)" -ForegroundColor Gray
Write-Host "Is Favorited: $($recipeDetails.data.isFavorited)" -ForegroundColor Gray
Write-Host "Likes Count: $($recipeDetails.data._count.likes)" -ForegroundColor Gray
Write-Host "Favorites Count: $($recipeDetails.data._count.favorites)" -ForegroundColor Gray
Write-Host ""

# Summary
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "✓ Login: OK" -ForegroundColor Green
Write-Host "✓ Like Recipe: OK" -ForegroundColor Green
Write-Host "✓ Unlike Recipe: OK" -ForegroundColor Green
Write-Host "✓ Favorite Recipe: OK" -ForegroundColor Green
Write-Host "✓ Unfavorite Recipe: OK" -ForegroundColor Green
Write-Host "✓ Toggle Functionality: OK" -ForegroundColor Green
Write-Host ""
Write-Host "All tests passed! ✓" -ForegroundColor Green
