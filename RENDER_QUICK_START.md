# 🚀 Быстрая инструкция - Render.com

## 📋 Ваша база данных

**PostgreSQL URL:** 
```
postgresql://ittoken_db_user:Xm98VVSZv7cMJkopkdWRkgvZzC7Aly42@dpg-d0visga4d50c73ekmu4g-a.frankfurt-postgres.render.com/ittoken_db
```

✅ База данных уже создана на Render  
✅ Код автоматически создаст схему `investment` при первом запуске  
✅ Все таблицы будут созданы автоматически

---

## 🔧 Шаг 1: Деплой Backend

1. Зайдите на https://dashboard.render.com
2. Нажмите **New +** → **Web Service**
3. Подключите GitHub репозиторий: `pilipandr770/investment`
4. Настройки:
   - **Name:** `investment-backend`
   - **Region:** Frankfurt (у вас БД там)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free

5. **Environment Variables** (нажмите Advanced):

⚠️ **ВАЖНО**: Этот файл описывает деплой 2 сервисов (старый способ)  
**Рекомендуется использовать:** `RENDER_ONE_SERVICE.md` (1 сервис, проще и дешевле)

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://ittoken_db_user:Xm98VVSZv7cMJkopkdWRkgvZzC7Aly42@dpg-d0visga4d50c73ekmu4g-a.frankfurt-postgres.render.com/ittoken_db
DB_SCHEMA=investment
JWT_SECRET=СГЕНЕРИРУЙТЕ_СЛУЧАЙНУЮ_СТРОКУ_32_СИМВОЛА
STRIPE_SECRET_KEY=ВАШ_STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=ВАШ_STRIPE_PUBLISHABLE_KEY
OPENAI_API_KEY=ВАШ_OPENAI_API_KEY
FRONTEND_URL=https://investment-frontend.onrender.com
BACKEND_URL=https://investment-backend.onrender.com
```

6. Нажмите **Create Web Service**
7. Дождитесь деплоя (3-5 минут)
8. **Сохраните URL backend** (например: `https://investment-backend.onrender.com`)

---

## 🎨 Шаг 2: Деплой Frontend

1. На дашборде Render нажмите **New +** → **Static Site**
2. Подключите тот же репозиторий: `pilipandr770/investment`
3. Настройки:
   - **Name:** `investment-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`

4. **Environment Variables**:

```bash
REACT_APP_API_URL=https://investment-backend.onrender.com/api
REACT_APP_BACKEND_URL=https://investment-backend.onrender.com
```

⚠️ **Замените** `investment-backend.onrender.com` на реальный URL из шага 1!

5. Нажмите **Create Static Site**
6. Дождитесь деплоя (2-3 минуты)

---

## ✅ Шаг 3: Обновление URL

После создания обоих сервисов:

1. Перейдите в **Backend** → **Environment** → **Edit**
2. Обновите:
   - `FRONTEND_URL` → реальный URL frontend
   - `BACKEND_URL` → реальный URL backend

---

## 🧪 Шаг 4: Проверка

1. **Backend Health Check:**
   ```
   https://investment-backend.onrender.com/api/health
   ```
   Должен вернуть: `{"status":"OK","message":"Server is running"}`

2. **Frontend:**
   ```
   https://investment-frontend.onrender.com
   ```

3. **Логин в админку:**
   - Email: `admin@investment.com`
   - Password: `admin123`
   
   ⚠️ **СРАЗУ СМЕНИТЕ ПАРОЛЬ!**

---

## 🔑 Генерация JWT_SECRET

**PowerShell:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Bash/Linux:**
```bash
openssl rand -base64 32
```

**Онлайн:**
https://generate-random.org/api-key-generator?count=1&length=32&type=mixed-numbers-symbols

---

## 📊 Что происходит при первом запуске?

1. ✅ Подключение к PostgreSQL базе данных
2. ✅ Создание схемы `investment` (если не существует)
3. ✅ Создание всех таблиц:
   - `users` - пользователи
   - `deposits` - депозиты
   - `products` - продукты
   - `investments` - инвестиции
   - `payment_settings` - настройки платежей
   - `social_links` - социальные сети
   - `withdrawals` - выводы
4. ✅ Создание админ-пользователя (email: admin@investment.com)
5. ✅ Создание 3 тестовых продукта

Все происходит автоматически! 🎉

---

## 🐛 Troubleshooting

### Backend не запускается:
1. Проверьте логи: Dashboard → Backend Service → Logs
2. Проверьте что все Environment Variables установлены
3. Проверьте что DATABASE_URL правильный

### Frontend не подключается к Backend:
1. Проверьте CORS: убедитесь что FRONTEND_URL правильный в backend
2. Проверьте что REACT_APP_API_URL правильный в frontend
3. Откройте DevTools (F12) → Console для ошибок

### База данных ошибки:
1. Проверьте что DATABASE_URL правильный (из Render Dashboard)
2. Убедитесь что DB_SCHEMA=investment установлен
3. Проверьте логи миграций в логах backend

---

## 📞 Полная документация

Детальная инструкция: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Время развертывания:** ~10 минут  
**Готово!** 🎉
