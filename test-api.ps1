Write-Host "=== SaborConnect API Tests ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:4000/health" -Method GET
    Write-Host "OK Health Check: OK" -ForegroundColor Green
    Write-Host "  Response: $($health.Content)" -ForegroundColor Gray
}
catch {
    Write-Host "X Health Check: FAILED" -ForegroundColor Red
}
Write-Host ""

# Test 2: Register
Write-Host "2. Testing User Registration..." -ForegroundColor Yellow
$registerBody = @{
    name = "Test User 2"
    email = "test2@example.com"
    password = "Test123!@#"
} | ConvertTo-Json

try {
    $register = Invoke-WebRequest -Uri "http://localhost:4000/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body $registerBody
    $registerData = $register.Content | ConvertFrom-Json
    Write-Host "OK Registration: SUCCESS" -ForegroundColor Green
    Write-Host "  User ID: $($registerData.data.user.id)" -ForegroundColor Gray
    Write-Host "  Email: $($registerData.data.user.email)" -ForegroundColor Gray
    $accessToken = $registerData.data.accessToken
}
catch {
    Write-Host "X Registration: FAILED (user may already exist)" -ForegroundColor Yellow
    Write-Host "  Trying to login instead..." -ForegroundColor Gray
    
    $loginBody = @{
        email = "test2@example.com"
        password = "Test123!@#"
    } | ConvertTo-Json
    
    try {
        $login = Invoke-WebRequest -Uri "http://localhost:4000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
        $loginData = $login.Content | ConvertFrom-Json
        Write-Host "OK Login: SUCCESS" -ForegroundColor Green
        $accessToken = $loginData.data.accessToken
    }
    catch {
        Write-Host "X Login: FAILED" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Test 3: Get Profile
Write-Host "3. Testing Get Profile..." -ForegroundColor Yellow
try {
    $profile = Invoke-WebRequest -Uri "http://localhost:4000/api/users/me" -Method GET -Headers @{"Authorization"="Bearer $accessToken"}
    $profileData = $profile.Content | ConvertFrom-Json
    Write-Host "OK Get Profile: SUCCESS" -ForegroundColor Green
    Write-Host "  Name: $($profileData.data.name)" -ForegroundColor Gray
    Write-Host "  Email: $($profileData.data.email)" -ForegroundColor Gray
}
catch {
    Write-Host "X Get Profile: FAILED" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get Recipes
Write-Host "4. Testing Get Recipes..." -ForegroundColor Yellow
try {
    $recipes = Invoke-WebRequest -Uri "http://localhost:4000/api/recipes?page=1&limit=5" -Method GET
    $recipesData = $recipes.Content | ConvertFrom-Json
    Write-Host "OK Get Recipes: SUCCESS" -ForegroundColor Green
    Write-Host "  Total: $($recipesData.meta.total)" -ForegroundColor Gray
    Write-Host "  Page: $($recipesData.meta.page)/$($recipesData.meta.totalPages)" -ForegroundColor Gray
}
catch {
    Write-Host "X Get Recipes: FAILED" -ForegroundColor Red
}
Write-Host ""

# Test 5: Redis Status
Write-Host "5. Testing Redis Connection..." -ForegroundColor Yellow
try {
    $status = Invoke-WebRequest -Uri "http://localhost:4000/api/status" -Method GET
    $statusData = $status.Content | ConvertFrom-Json
    Write-Host "OK Redis: $($statusData.data.redis.status)" -ForegroundColor Green
    Write-Host "  Database: $($statusData.data.database.status)" -ForegroundColor Green
}
catch {
    Write-Host "X Status Check: FAILED" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== All Tests Completed ===" -ForegroundColor Cyan
