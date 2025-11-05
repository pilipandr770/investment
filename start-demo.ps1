# 🚀 Быстрый запуск для демонстрации
# Этот скрипт запустит проект локально через Docker

Write-Host "🎯 Запуск Investment Platform для демонстрации..." -ForegroundColor Cyan
Write-Host ""

# Проверка Docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker не установлен!" -ForegroundColor Red
    Write-Host "Установите Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
}

# Проверка .env файла
if (!(Test-Path .env)) {
    Write-Host "⚠️  Файл .env не найден!" -ForegroundColor Yellow
    Write-Host "Создаю из шаблона..."
    Copy-Item .env.docker.example .env
    Write-Host ""
    Write-Host "📝 ВАЖНО: Откройте файл .env и заполните:" -ForegroundColor Yellow
    Write-Host "   - JWT_SECRET (любая строка минимум 32 символа)"
    Write-Host "   - STRIPE_SECRET_KEY (из Stripe Dashboard)"
    Write-Host "   - STRIPE_PUBLISHABLE_KEY (из Stripe Dashboard)"
    Write-Host "   - OPENAI_API_KEY (из OpenAI Platform)"
    Write-Host "   - DB_PASSWORD (любой надежный пароль)"
    Write-Host ""
    Read-Host "Нажмите Enter после заполнения .env файла"
}

Write-Host ""
Write-Host "🐳 Запускаю Docker контейнеры..." -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "⏳ Ожидание запуска сервисов (30 секунд)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "✅ Проверка статуса:" -ForegroundColor Green
docker-compose ps

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "🎉 Готово! Проект запущен!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Откройте в браузере:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   Backend:  http://localhost:5000/api/health"
Write-Host ""
Write-Host "🔐 Тестовый аккаунт:" -ForegroundColor Cyan
Write-Host "   Email:    admin@investment.com"
Write-Host "   Password: admin123"
Write-Host ""
Write-Host "📊 Команды для управления:" -ForegroundColor Cyan
Write-Host "   Логи:      docker-compose logs -f"
Write-Host "   Остановка: docker-compose down"
Write-Host "   Перезапуск: docker-compose restart"
Write-Host ""
Write-Host "📚 Документация:" -ForegroundColor Cyan
Write-Host "   README.md - основная информация"
Write-Host "   READY_FOR_CLIENT.md - инструкция для демо"
Write-Host "   DEPLOYMENT.md - развертывание на Render.com"
Write-Host ""
