# 🚀 Render.com - ОДИН СЕРВИС (Backend + Frontend)

## ✅ Преимущества одного сервиса:
- 💰 Дешевле (1 сервис вместо 2)
- 🚀 Быстрее настроить
- 🔗 Нет проблем с CORS
- 📦 Backend раздает статические файлы React

---

## 📋 Ваша база данных

**PostgreSQL URL:**
```
postgresql://ittoken_db_user:Xm98VVSZv7cMJkopkdWRkgvZzC7Aly42@dpg-d0visga4d50c73ekmu4g-a.frankfurt-postgres.render.com/ittoken_db
```

---

## 🔧 Шаг 1: Создание Web Service

1. Зайдите на https://dashboard.render.com
2. Нажмите **New +** → **Web Service**
3. Подключите GitHub: `pilipandr770/investment`
4. Настройки:
   - **Name:** `investment-platform`
   - **Region:** Frankfurt (у вас БД там)
   - **Branch:** `main`
   - **Root Directory:** оставьте пустым
   - **Runtime:** Node
   - **Build Command:** 
     ```
     npm run render-build
     ```
   - **Start Command:** 
     ```
     npm start
     ```
   - **Instance Type:** Free

---

## 🔑 Шаг 2: Environment Variables

Нажмите **Advanced** → **Add Environment Variable**

### Скопируйте и вставьте (10 переменных):

```
NODE_ENV=production
```

```
PORT=5000
```

```
DATABASE_URL=postgresql://ittoken_db_user:Xm98VVSZv7cMJkopkdWRkgvZzC7Aly42@dpg-d0visga4d50c73ekmu4g-a.frankfurt-postgres.render.com/ittoken_db
```

```
DB_SCHEMA=investment
```

```
JWT_SECRET=СГЕНЕРИРУЙТЕ_СЛУЧАЙНУЮ_СТРОКУ_32_СИМВОЛА
```

**Генерация JWT_SECRET (PowerShell):**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

```
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
```

```
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
```

```
OPENAI_API_KEY=sk-YOUR_KEY
```

Эти две переменные НЕ нужны (backend и frontend на одном домене):
~~FRONTEND_URL~~
~~BACKEND_URL~~

---

## 🎯 Шаг 3: Деплой

1. Нажмите **Create Web Service**
2. Дождитесь деплоя (~5-7 минут)
   - Сначала соберется React (npm run build)
   - Потом запустится backend с API и статикой
3. Получите URL: `https://investment-platform.onrender.com`

---

## ✅ Шаг 4: Проверка

### Backend API:
```
https://investment-platform.onrender.com/api/health
```
Ответ: `{"status":"OK","message":"Server is running"}`

### Frontend:
```
https://investment-platform.onrender.com
```
Откроется лендинг

### Логин:
- Email: `admin@investment.com`
- Password: `admin123`

⚠️ **СРАЗУ СМЕНИТЕ ПАРОЛЬ!**

---

## 📊 Что происходит при деплое?

1. ✅ **Build:** `npm run render-build`
   - Устанавливаются зависимости frontend
   - Собирается React → `frontend/build/`
   - Устанавливаются production зависимости backend

2. ✅ **Start:** `npm start`
   - Запускается `backend/server.js`
   - Создается схема `investment` в PostgreSQL
   - Создаются все таблицы
   - Создается admin пользователь
   - Backend слушает на порту 5000
   - `/api/*` → API endpoints
   - `/*` → React приложение (статика из `frontend/build/`)

---

## 🔄 Автоматический деплой

При каждом `git push` в main:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render автоматически:
1. Соберет React
2. Перезапустит backend
3. Обновит приложение (~5 минут)

---

## 💰 Стоимость

### Free Tier:
- ✅ Бесплатно
- ⚠️ Засыпает после 15 минут неактивности
- ⚠️ Первый запрос после сна ~30 секунд

### Starter Plan ($7/месяц):
- ✅ Не засыпает
- ✅ Быстрая работа 24/7
- ✅ Больше ресурсов

---

## 🐛 Troubleshooting

### Build fails:
```
Логи → Build Logs
```
Проверьте что все зависимости установлены

### API не работает:
```
Логи → Deploy Logs
```
Проверьте что DATABASE_URL правильный

### Frontend показывает ошибки:
1. Откройте DevTools (F12) → Console
2. Проверьте что `/api/health` работает
3. Проверьте что все environment variables установлены

### База данных ошибки:
- Проверьте DATABASE_URL
- Проверьте DB_SCHEMA=investment
- Проверьте логи миграций в Deploy Logs

---

## 📁 Структура после деплоя:

```
/
├── api/
│   ├── auth/          → Регистрация/логин
│   ├── users/         → Пользователи
│   ├── investments/   → Инвестиции
│   ├── admin/         → Админка
│   ├── payments/      → Платежи
│   ├── social-links/  → Соцсети
│   └── assistant/     → AI чат
├── uploads/           → QR-коды и изображения
└── *                  → React приложение
```

---

## ✅ Checklist

- [ ] Web Service создан на Render
- [ ] 8 переменных добавлены (NODE_ENV, PORT, DATABASE_URL, DB_SCHEMA, JWT_SECRET, STRIPE keys, OPENAI_API_KEY)
- [ ] JWT_SECRET сгенерирован
- [ ] Деплой успешно завершен (~5-7 минут)
- [ ] Проверен /api/health
- [ ] Проверен логин admin@investment.com
- [ ] Пароль админа изменен

---

## 🎉 Готово!

**Один сервис = Меньше настроек = Проще и дешевле!**

URL: `https://investment-platform.onrender.com`

---

## 📚 Дополнительно

Полная документация: [DEPLOYMENT.md](./DEPLOYMENT.md)
