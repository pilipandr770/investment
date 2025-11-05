# 📋 ПЕРЕМЕННЫЕ ДЛЯ RENDER.COM - СКОПИРУЙТЕ И ВСТАВЬТЕ

## 🔧 BACKEND Environment Variables

Зайдите: Dashboard → Backend Service → Environment → Add Environment Variable

### Скопируйте по одной и вставьте:

```
NODE_ENV
```
**Value:**
```
production
```

---

```
PORT
```
**Value:**
```
5000
```

---

```
DATABASE_URL
```
**Value:**
```
postgresql://ittoken_db_user:Xm98VVSZv7cMJkopkdWRkgvZzC7Aly42@dpg-d0visga4d50c73ekmu4g-a.frankfurt-postgres.render.com/ittoken_db
```

---

```
DB_SCHEMA
```
**Value:**
```
investment
```

---

```
JWT_SECRET
```
**Value:** (сгенерируйте случайную строку 32+ символов)
```
ЗАМЕНИТЕ_СГЕНЕРИРУЙТЕ_В_POWERSHELL_КОМАНДА_НИЖЕ
```

**Команда для генерации в PowerShell:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

```
STRIPE_SECRET_KEY
```
**Value:** (из https://dashboard.stripe.com/test/apikeys)
```
sk_test_YOUR_STRIPE_SECRET_KEY_HERE
```

---

```
STRIPE_PUBLISHABLE_KEY
```
**Value:** (из https://dashboard.stripe.com/test/apikeys)
```
pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE
```

---

```
OPENAI_API_KEY
```
**Value:** (из https://platform.openai.com/api-keys)
```
sk-YOUR_OPENAI_API_KEY_HERE
```

---

```
FRONTEND_URL
```
**Value:** (замените после создания frontend)
```
https://investment-frontend.onrender.com
```

---

```
BACKEND_URL
```
**Value:** (замените на реальный URL вашего backend после деплоя)
```
https://investment-backend.onrender.com
```

---

## 🎨 FRONTEND Environment Variables

Зайдите: Dashboard → Frontend Static Site → Environment → Add Environment Variable

### Скопируйте:

```
REACT_APP_API_URL
```
**Value:** (замените на реальный URL вашего backend)
```
https://investment-backend.onrender.com/api
```

---

```
REACT_APP_BACKEND_URL
```
**Value:** (замените на реальный URL вашего backend)
```
https://investment-backend.onrender.com
```

---

## ✅ Checklist

- [ ] Backend создан на Render
- [ ] Все 10 переменных добавлены в Backend
- [ ] JWT_SECRET сгенерирован
- [ ] STRIPE ключи добавлены
- [ ] OPENAI ключ добавлен
- [ ] Backend успешно задеплоен
- [ ] Frontend создан на Render
- [ ] 2 переменные добавлены в Frontend с реальным URL backend
- [ ] Frontend успешно задеплоен
- [ ] Обновлены FRONTEND_URL и BACKEND_URL в backend на реальные
- [ ] Проверен health check: /api/health
- [ ] Проверен логин admin@investment.com / admin123
- [ ] Пароль админа изменен

---

## 🎯 Порядок действий:

1. **Создайте Backend Web Service** на Render
2. **Добавьте все 10 переменных** (см. выше)
3. **Дождитесь деплоя** backend (~3-5 мин)
4. **Скопируйте URL backend** (например: https://investment-backend-abc123.onrender.com)
5. **Создайте Frontend Static Site** на Render
6. **Добавьте 2 переменные** с реальным URL backend
7. **Дождитесь деплоя** frontend (~2-3 мин)
8. **Скопируйте URL frontend** (например: https://investment-frontend-xyz789.onrender.com)
9. **Вернитесь в Backend** → Environment → Edit
10. **Обновите FRONTEND_URL и BACKEND_URL** на реальные

---

## 🧪 Проверка работы:

**Backend:**
```
https://ваш-backend.onrender.com/api/health
```
Должен вернуть: `{"status":"OK","message":"Server is running"}`

**Frontend:**
```
https://ваш-frontend.onrender.com
```
Должен открыться лендинг

**Логин:**
- Email: `admin@investment.com`
- Password: `admin123`

---

**Готово!** 🎉
