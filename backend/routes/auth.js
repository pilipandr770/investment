const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbWrapper } = require('../database/db-adapter');

// Реєстрація
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    // Валідація
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Заповніть всі обов\'язкові поля' });
    }

    // Перевірка існування користувача
    const existingUser = await dbWrapper.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Користувач з таким email вже існує' });
    }

    // Хешування паролю
    const hashedPassword = await bcrypt.hash(password, 10);

    // Створення користувача
    const insertRes = await dbWrapper.run(
      `INSERT INTO users (email, password, full_name, phone) VALUES (?, ?, ?, ?)`,
      [email, hashedPassword, fullName, phone || null]
    );

    // Normalize inserted id across SQLite/Postgres wrappers
    const userId = insertRes.lastInsertRowid || insertRes.lastID || insertRes.insertId || (insertRes.rows && insertRes.rows[0] && insertRes.rows[0].id);

    // Генерація токена
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ message: 'Користувача успішно створено', token, userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Вхід
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Валідація
    if (!email || !password) {
      return res.status(400).json({ error: 'Введіть email та пароль' });
    }

    // Пошук користувача
    const user = await dbWrapper.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Невірний email або пароль' });
    }

    // Перевірка паролю
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Невірний email або пароль' });
    }

    // Генерація токена
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Успішний вхід',
      token,
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        balance: user.balance,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;
