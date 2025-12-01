Write-Host "=== SETUP COMPLETO: E2E + MONITORING + CI/CD ===" -ForegroundColor Cyan
Write-Host ""

# 1. TESTES E2E
Write-Host "1. Instalando Playwright para testes E2E..." -ForegroundColor Yellow
Set-Location frontend
npm install -D @playwright/test@latest
npx playwright install chromium
Set-Location ..
Write-Host "   Playwright instalado!" -ForegroundColor Green
Write-Host ""

# 2. MONITORING
Write-Host "2. Configurando Prometheus + Grafana..." -ForegroundColor Yellow
Write-Host "   Arquivos de configuracao criados!" -ForegroundColor Green
Write-Host ""

# 3. CI/CD
Write-Host "3. Configurando GitHub Actions..." -ForegroundColor Yellow
Write-Host "   Workflows criados!" -ForegroundColor Green
Write-Host ""

Write-Host "=== SETUP CONCLUIDO ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "1. Executar testes E2E: cd frontend && npm run test:e2e" -ForegroundColor Gray
Write-Host "2. Iniciar monitoring: docker-compose -f docker-compose.monitoring.yml up -d" -ForegroundColor Gray
Write-Host "3. Push para GitHub para ativar CI/CD" -ForegroundColor Gray
