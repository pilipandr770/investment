# 📋 ПЕРЕМЕННЫЕ ДЛЯ ОДНОГО СЕРВИСА

## Render.com → Environment Variables (8 переменных)

### 1. NODE_ENV
```
production
```

### 2. PORT
```
5000
```

### 3. DATABASE_URL
```
postgresql://ittoken_db_user:Xm98VVSZv7cMJkopkdWRkgvZzC7Aly42@dpg-d0visga4d50c73ekmu4g-a.frankfurt-postgres.render.com/ittoken_db
```

### 4. DB_SCHEMA
```
investment
```

### 5. JWT_SECRET
Сгенерируйте в PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Вставьте результат ↓
```
ВАШ_СГЕНЕРИРОВАННЫЙ_КЛЮЧ
```

### 6. STRIPE_SECRET_KEY
Из https://dashboard.stripe.com/test/apikeys
```
sk_test_YOUR_STRIPE_SECRET_KEY
```

### 7. STRIPE_PUBLISHABLE_KEY
Из https://dashboard.stripe.com/test/apikeys
```
pk_test_YOUR_STRIPE_PUBLISHABLE_KEY
```

### 8. OPENAI_API_KEY
Из https://platform.openai.com/api-keys
```
sk-YOUR_OPENAI_API_KEY
```

---

## ⚠️ ВАЖНО

**НЕ нужны:**
- ~~FRONTEND_URL~~
- ~~BACKEND_URL~~
- ~~REACT_APP_API_URL~~
- ~~REACT_APP_BACKEND_URL~~

Backend и Frontend на одном домене! 🎉

---

## 📝 Build & Start Commands

**Build Command:**
```
npm run render-build
```

**Start Command:**
```
npm start
```

---

## ✅ Checklist

- [ ] 8 переменных добавлены
- [ ] JWT_SECRET сгенерирован и добавлен
- [ ] STRIPE ключи добавлены
- [ ] OPENAI ключ добавлен
- [ ] Build Command: `npm run render-build`
- [ ] Start Command: `npm start`
- [ ] Root Directory: пусто (корень репозитория)

**Готово! Нажмите Create Web Service** 🚀
