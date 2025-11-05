#!/bin/bash

# 🚀 Быстрый запуск для демонстрации
# Этот скрипт запустит проект локально через Docker

echo "🎯 Запуск Investment Platform для демонстрации..."
echo ""

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен!"
    echo "Установите Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен!"
    exit 1
fi

# Проверка .env файла
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден!"
    echo "Создаю из шаблона..."
    cp .env.docker.example .env
    echo ""
    echo "📝 ВАЖНО: Откройте файл .env и заполните:"
    echo "   - JWT_SECRET (любая строка минимум 32 символа)"
    echo "   - STRIPE_SECRET_KEY (из Stripe Dashboard)"
    echo "   - STRIPE_PUBLISHABLE_KEY (из Stripe Dashboard)"
    echo "   - OPENAI_API_KEY (из OpenAI Platform)"
    echo "   - DB_PASSWORD (любой надежный пароль)"
    echo ""
    read -p "Нажмите Enter после заполнения .env файла..."
fi

echo ""
echo "🐳 Запускаю Docker контейнеры..."
docker-compose up -d

echo ""
echo "⏳ Ожидание запуска сервисов (30 секунд)..."
sleep 30

echo ""
echo "✅ Проверка статуса:"
docker-compose ps

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Готово! Проект запущен!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Откройте в браузере:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000/api/health"
echo ""
echo "🔐 Тестовый аккаунт:"
echo "   Email:    admin@investment.com"
echo "   Password: admin123"
echo ""
echo "📊 Команды для управления:"
echo "   Логи:      docker-compose logs -f"
echo "   Остановка: docker-compose down"
echo "   Перезапуск: docker-compose restart"
echo ""
echo "📚 Документация:"
echo "   README.md - основная информация"
echo "   READY_FOR_CLIENT.md - инструкция для демо"
echo "   DEPLOYMENT.md - развертывание на Render.com"
echo ""
