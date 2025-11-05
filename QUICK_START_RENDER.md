# 🚀 БЫСТРЫЙ СТАРТ НА RENDER.COM

## ✅ ЧТО ИСПРАВЛЕНО
- ❌ **Убрана ошибка:** "Cannot find module 'better-sqlite3'"
- ✅ **Все роуты переведены на PostgreSQL**
- ✅ **Single-service deployment** (backend обслуживает frontend)
- ✅ **Автоматические миграции базы данных**
- ✅ **Коммит:** `5b3b7a6` (или новее)

---

## 📋 ЗА 5 МИНУТ

### 1️⃣ В Render Dashboard создайте Web Service:
```
Repository: pilipandr770/investment
Branch: main
Build Command: npm run render-build
Start Command: npm start
```

### 2️⃣ Добавьте PostgreSQL Database:
- New → PostgreSQL → скопируйте External Database URL

### 3️⃣ Сгенерируйте JWT Secret:
**PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 4️⃣ Добавьте Environment Variables:
```
NODE_ENV=production
DATABASE_URL=postgres://user:pass@host/db
DB_SCHEMA=investment
JWT_SECRET=<ваш_сгенерированный_секрет>
PORT=10000
```

### 5️⃣ Deploy и проверьте логи:
**Должно быть:**
```
✅ Извлечение коммита 5b3b7a6
✅ Успешная 🎉 сборка
✅ 🔧 Running database migrations...
✅ 📦 Creating schema: investment
✅ ✅ Database migrations completed successfully!
✅ 🚀 Server is running on port 10000
```

**НЕ должно быть:**
```
❌ Cannot find module 'better-sqlite3'
```

---

## 🔗 ПОСЛЕ ДЕПЛОЯ

### Проверьте работу:
```bash
# Health check
curl https://your-app.onrender.com/api/health

# Ожидаемый ответ:
{"status":"OK","message":"Server is running"}
```

### Войдите в админку:
- URL: `https://your-app.onrender.com`
- Email: `admin@investment.com`
- Password: `admin123`
- ⚠️ **СМЕНИТЕ ПАРОЛЬ СРАЗУ!**

---

## 🆘 ЕСЛИ ЧТО-ТО НЕ РАБОТАЕТ

### "Cannot find module 'better-sqlite3'"
```
→ Render использует старый коммит
→ Нажмите: Manual Deploy → Deploy latest commit
→ Или: Clear build cache & deploy
```

### "Database connection failed"
```
→ Проверьте DATABASE_URL в Environment
→ Убедитесь что PostgreSQL instance запущен
```

### "JWT_SECRET is not defined"
```
→ Добавьте JWT_SECRET в Environment
→ Минимум 32 символа
→ Перезапустите деплой
```

---

## 📚 ПОЛНАЯ ДОКУМЕНТАЦИЯ

См. файл `RENDER_ENV.txt` для детальных инструкций.

---

## 💡 ВАЖНО

- ✅ Это **single-service** — backend обслуживает React build
- ✅ Frontend доступен на корневом URL
- ✅ API доступно на `/api/*`
- ✅ Миграции выполняются автоматически при старте
- ✅ Схема `investment` создаётся автоматически

---

## 🎉 ГОТОВО!

Если видите в логах все ✅ — приложение работает!
