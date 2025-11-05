# Развертывание на Render.com

## 📋 Предварительные требования

1. Аккаунт на [Render.com](https://render.com)
2. Git репозиторий (GitHub, GitLab или Bitbucket)
3. Stripe аккаунт (для платежей)
4. OpenAI API ключ (для AI ассистента)

## 🚀 Шаги развертывания

### 1. Подготовка репозитория

```bash
# Инициализация git (если еще не сделано)
git init
git add .
git commit -m "Initial commit - investment platform"

# Создание репозитория на GitHub и пуш
git remote add origin https://github.com/your-username/investment-platform.git
git branch -M main
git push -u origin main
```

### 2. Создание PostgreSQL базы данных на Render

1. Войдите на [Render.com](https://dashboard.render.com)
2. Нажмите **"New +"** → **"PostgreSQL"**
3. Заполните:
   - **Name**: `investment-db` (или свое название)
   - **Database**: `investment`
   - **User**: (будет создан автоматически)
   - **Region**: Выберите ближайший регион
   - **Plan**: Free (или Starter для production)
4. Нажмите **"Create Database"**
5. **Важно**: Сохраните **Internal Database URL** - он понадобится для backend

### 3. Развертывание Backend

1. На дашборде Render нажмите **"New +"** → **"Web Service"**
2. Подключите ваш Git репозиторий
3. Настройки:
   - **Name**: `investment-backend`
   - **Region**: Тот же, что и база данных
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free (или Starter)

4. **Environment Variables** (нажмите "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=[Вставьте Internal Database URL из шага 2]
   JWT_SECRET=[Сгенерируйте случайную строку, например: openssl rand -base64 32]
   
   STRIPE_SECRET_KEY=[Ваш Stripe Secret Key]
   STRIPE_PUBLISHABLE_KEY=[Ваш Stripe Publishable Key]
   
   OPENAI_API_KEY=[Ваш OpenAI API ключ]
   
   FRONTEND_URL=https://investment-frontend.onrender.com
   BACKEND_URL=https://investment-backend.onrender.com
   ```

5. Нажмите **"Create Web Service"**
6. Дождитесь завершения деплоя (3-5 минут)
7. **Сохраните URL backend** (например: `https://investment-backend.onrender.com`)

### 4. Развертывание Frontend

1. На дашборде Render нажмите **"New +"** → **"Static Site"**
2. Подключите тот же Git репозиторий
3. Настройки:
   - **Name**: `investment-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://investment-backend.onrender.com/api
   REACT_APP_BACKEND_URL=https://investment-backend.onrender.com
   ```

5. Нажмите **"Create Static Site"**
6. Дождитесь завершения деплоя

### 5. Настройка CORS на Backend

Обновите в backend настройки CORS, чтобы разрешить запросы от frontend:

```javascript
// В server.js уже настроено через переменную FRONTEND_URL
```

## 🔄 Автоматическое обновление

Render автоматически пересобирает приложение при каждом пуше в репозиторий:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

## 📊 Проверка развертывания

1. **Backend Health Check**: Откройте `https://your-backend.onrender.com/api/health`
2. **Frontend**: Откройте `https://your-frontend.onrender.com`
3. **Вход в админку**:
   - Email: `admin@investment.com`
   - Password: `admin123`

## ⚠️ Важные замечания

### Free Tier ограничения:
- Backend спит после 15 минут неактивности (первый запрос будет долгим ~30 сек)
- База данных имеет лимит на хранение (90 дней для Free tier)
- Для production рекомендуется платный план

### Безопасность:
- **Обязательно смените пароль админа** после первого входа
- Используйте сильный `JWT_SECRET`
- Храните все ключи в Environment Variables, не в коде

### База данных:
- Render автоматически делает бэкапы PostgreSQL
- Для восстановления используйте Render Dashboard → Database → Backups

## 🔧 Локальная разработка

```bash
# Backend
cd backend
cp .env.example .env
# Заполните .env файл
npm install
npm run dev

# Frontend
cd frontend
cp .env.example .env
# Заполните .env файл
npm install
npm start
```

## 📱 Мониторинг

- **Логи**: Render Dashboard → Your Service → Logs
- **Метрики**: Render Dashboard → Your Service → Metrics
- **База данных**: Render Dashboard → Database → Metrics

## 🆘 Troubleshooting

### Backend не стартует:
1. Проверьте логи в Render Dashboard
2. Убедитесь что DATABASE_URL правильный
3. Проверьте что все Environment Variables установлены

### Frontend не может подключиться к Backend:
1. Проверьте CORS настройки в backend
2. Убедитесь что REACT_APP_API_URL правильный
3. Проверьте что backend запущен и отвечает

### База данных ошибки:
1. Проверьте что DATABASE_URL правильный (используйте Internal URL)
2. Убедитесь что база данных создана и запущена
3. Проверьте логи миграций

## 📧 Поддержка

При проблемах:
1. Проверьте логи в Render Dashboard
2. Проверьте что все переменные окружения установлены
3. Обратитесь в поддержку Render: https://render.com/docs/support

---

**Готово!** 🎉 Ваш проект теперь доступен онлайн.
