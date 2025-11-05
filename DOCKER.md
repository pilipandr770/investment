# 🐳 Docker Deployment Guide

## Быстрый старт

### 1. Подготовка

```bash
# Скопируйте файл с переменными окружения
cp .env.docker.example .env

# Отредактируйте .env и заполните все ключи:
# - DB_PASSWORD (надежный пароль для PostgreSQL)
# - JWT_SECRET (минимум 32 случайных символа)
# - STRIPE_SECRET_KEY и STRIPE_PUBLISHABLE_KEY
# - OPENAI_API_KEY
```

### 2. Запуск приложения

```bash
# Запустить все сервисы (PostgreSQL, Backend, Frontend)
docker-compose up -d

# Посмотреть логи
docker-compose logs -f

# Остановить все сервисы
docker-compose down

# Остановить и удалить все данные (включая базу данных)
docker-compose down -v
```

### 3. Проверка работы

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health
- **PostgreSQL**: localhost:5432

Логин в админку:
- Email: `admin@investment.com`
- Password: `admin123`

## 📦 Что включает Docker Compose

- **PostgreSQL 15** - База данных с автоматическими миграциями
- **Backend (Node.js)** - API сервер на Express
- **Frontend (React + Nginx)** - Оптимизированный production build
- **Volumes** - Persistent storage для базы данных и загруженных файлов

## 🔧 Полезные команды

```bash
# Пересобрать контейнеры после изменений в коде
docker-compose up -d --build

# Посмотреть статус контейнеров
docker-compose ps

# Посмотреть логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Зайти внутрь контейнера
docker-compose exec backend sh
docker-compose exec postgres psql -U investment_user -d investment

# Перезапустить конкретный сервис
docker-compose restart backend

# Посмотреть использование ресурсов
docker stats
```

## 🚀 Production развертывание

### Вариант 1: VPS (DigitalOcean, Linode, Vultr)

1. **Установите Docker и Docker Compose на сервере**:
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo apt install docker-compose-plugin
```

2. **Клонируйте репозиторий**:
```bash
git clone https://github.com/your-repo/investment-platform.git
cd investment-platform
```

3. **Настройте .env файл**:
```bash
cp .env.docker.example .env
nano .env  # Заполните production значения
```

4. **Обновите URL в .env**:
```bash
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

5. **Настройте Nginx reverse proxy (опционально)**:
```nginx
# /etc/nginx/sites-available/investment
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Запустите контейнеры**:
```bash
docker-compose up -d
```

### Вариант 2: Render.com с Docker

1. Создайте `render.yaml`:
```yaml
services:
  - type: web
    name: investment-backend
    env: docker
    dockerfilePath: ./backend/Dockerfile
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: investment-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: OPENAI_API_KEY
        sync: false

  - type: web
    name: investment-frontend
    env: docker
    dockerfilePath: ./frontend/Dockerfile
    buildCommand: docker build --build-arg REACT_APP_API_URL=$REACT_APP_API_URL .
    
databases:
  - name: investment-db
    databaseName: investment
    plan: free
```

## 🔐 Безопасность

1. **Используйте надежные пароли**:
```bash
# Генерация JWT_SECRET
openssl rand -base64 32

# Генерация DB_PASSWORD
openssl rand -base64 24
```

2. **Настройте firewall**:
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

3. **Регулярные бэкапы**:
```bash
# Бэкап PostgreSQL
docker-compose exec postgres pg_dump -U investment_user investment > backup_$(date +%Y%m%d).sql

# Восстановление
docker-compose exec -T postgres psql -U investment_user investment < backup_20240101.sql
```

## 📊 Мониторинг

```bash
# Проверка здоровья контейнеров
docker-compose ps

# Логи в реальном времени
docker-compose logs -f --tail=100

# Использование ресурсов
docker stats

# Очистка неиспользуемых образов/контейнеров
docker system prune -a
```

## 🆘 Troubleshooting

### Backend не может подключиться к PostgreSQL
```bash
# Проверьте что PostgreSQL запущен
docker-compose ps postgres

# Проверьте логи PostgreSQL
docker-compose logs postgres

# Перезапустите PostgreSQL
docker-compose restart postgres
```

### Frontend показывает ошибки API
```bash
# Проверьте переменные окружения
docker-compose exec frontend env | grep REACT_APP

# Пересоберите frontend с правильными переменными
docker-compose up -d --build frontend
```

### База данных потеряна после перезапуска
```bash
# Убедитесь что volume создан
docker volume ls | grep postgres

# Проверьте что используется правильный volume
docker-compose config | grep volumes
```

## 🔄 Обновление приложения

```bash
# 1. Получите последние изменения
git pull origin main

# 2. Пересоберите контейнеры
docker-compose up -d --build

# 3. Примените миграции (выполняется автоматически при старте)
docker-compose logs backend | grep migration
```

## 💾 Backup & Restore

### Автоматический бэкап (cron)
```bash
# Добавьте в crontab
0 2 * * * cd /path/to/investment && docker-compose exec -T postgres pg_dump -U investment_user investment | gzip > /backups/investment_$(date +\%Y\%m\%d).sql.gz
```

### Восстановление из бэкапа
```bash
# Остановите backend
docker-compose stop backend

# Восстановите базу данных
gunzip < backup_20240101.sql.gz | docker-compose exec -T postgres psql -U investment_user investment

# Запустите backend
docker-compose start backend
```

---

**Готово!** 🎉 Ваше приложение работает в Docker контейнерах.
