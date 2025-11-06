# 🔧 ИСПРАВЛЕНИЕ: PostgreSQL Schema Mismatch

## ❌ Проблема:
```
Error: column "full_name" of relation "users" does not exist
```

**Причина:** Схема PostgreSQL в миграциях не соответствовала реальной структуре, которую использует код.

---

## 🔍 Что было не так:

### 1. **Таблица `users` — отсутствовали колонки:**
- ❌ `full_name` VARCHAR(255) NOT NULL
- ❌ `phone` VARCHAR(50)

### 2. **Неправильное название таблиц:**
- ❌ PostgreSQL: `products` → Код использует: `investment_products`
- ❌ PostgreSQL: `investments` → Код использует: `user_investments`

### 3. **Отсутствовали колонки в таблицах:**
- ❌ `investment_products`: `expected_return`, `duration_months`, `category`, `is_active`
- ❌ `user_investments`: `current_value`

### 4. **Отсутствовали таблицы:**
- ❌ `transactions`
- ❌ `payment_requests`

---

## ✅ Что исправлено (коммит `c56e5ef`):

### 📋 Таблица `users`:
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,      -- ✅ ДОБАВЛЕНО
  phone VARCHAR(50),                     -- ✅ ДОБАВЛЕНО
  role VARCHAR(50) DEFAULT 'user',
  balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 📋 Таблица `investment_products`:
```sql
CREATE TABLE IF NOT EXISTS investment_products (  -- ✅ ПЕРЕИМЕНОВАНО
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  min_investment DECIMAL(10,2) NOT NULL,
  expected_return DECIMAL(5,2) NOT NULL,    -- ✅ ДОБАВЛЕНО
  duration_months INTEGER NOT NULL,         -- ✅ ДОБАВЛЕНО
  risk_level VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,            -- ✅ ДОБАВЛЕНО
  is_active BOOLEAN DEFAULT true,           -- ✅ ДОБАВЛЕНО
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 📋 Таблица `user_investments`:
```sql
CREATE TABLE IF NOT EXISTS user_investments (  -- ✅ ПЕРЕИМЕНОВАНО
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  product_id INTEGER REFERENCES investment_products(id),
  amount DECIMAL(10,2) NOT NULL,
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active',
  current_value DECIMAL(10,2)              -- ✅ ДОБАВЛЕНО
);
```

### 📋 Новые таблицы:
```sql
-- ✅ ДОБАВЛЕНО
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ ДОБАВЛЕНО
CREATE TABLE IF NOT EXISTS payment_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  payment_method VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  transaction_hash VARCHAR(255),
  screenshot_path VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  processed_at TIMESTAMP,
  processed_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Деплой на Render:

Render подхватит коммит `c56e5ef` автоматически.

**⚠️ ВАЖНО:** Если база данных уже существует с неправильной схемой, нужно:

### Вариант 1: Пересоздать базу (БЕЗ потери данных - база пустая):
1. В Render Dashboard → PostgreSQL instance
2. Удалить старую базу и создать новую
3. Обновить DATABASE_URL в Environment Variables
4. Redeploy сервиса

### Вариант 2: Обновить схему вручную (если есть данные):
```sql
-- Подключитесь к БД через Render Shell или psql
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN phone VARCHAR(50);

-- И так далее для остальных изменений...
```

---

## ✅ После успешного деплоя:

**Логи должны показать:**
```
✅ 🔧 Выполнение миграции баз данных...
✅ 📦 Создание схемы: investment
✅ ✅ Миграция баз данных успешно завершена!
✅ 🚀 Сервер работает на порту 5000
```

**НЕ должно быть:**
```
❌ column "full_name" of relation "users" does not exist
❌ relation "investment_products" does not exist
```

---

## 🎯 Теперь должно работать:

- ✅ Регистрация пользователей (с full_name)
- ✅ Вход админа/пользователей
- ✅ Создание/редактирование продуктов
- ✅ Создание инвестиций
- ✅ История транзакций
- ✅ Запросы на поповнення

---

## 🎉 Готово!

Схема PostgreSQL теперь полностью соответствует коду!
