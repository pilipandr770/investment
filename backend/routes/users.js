const express = require('express');
const router = express.Router();
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');

// Отримання профілю
router.get('/profile', authMiddleware, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, email, full_name, phone, balance, role, created_at
      FROM users WHERE id = ?
    `).get(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    // Отримання статистики інвестицій
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_investments,
        COALESCE(SUM(amount), 0) as total_invested,
        COALESCE(SUM(current_value), 0) as current_value
      FROM user_investments
      WHERE user_id = ? AND status = 'active'
    `).get(req.userId);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        balance: user.balance,
        role: user.role || 'user',
        createdAt: user.created_at
      },
      stats: {
        totalInvestments: stats.total_investments,
        totalInvested: stats.total_invested,
        currentValue: stats.current_value || stats.total_invested,
        profit: (stats.current_value || stats.total_invested) - stats.total_invested
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Оновлення профілю
router.put('/profile', authMiddleware, (req, res) => {
  try {
    const { fullName, phone } = req.body;

    db.prepare(`
      UPDATE users
      SET full_name = ?, phone = ?
      WHERE id = ?
    `).run(fullName, phone || null, req.userId);

    res.json({ message: 'Профіль оновлено' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Поповнення балансу (для тесту)
router.post('/balance/add', authMiddleware, (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Невірна сума' });
    }

    db.prepare(`
      UPDATE users
      SET balance = balance + ?
      WHERE id = ?
    `).run(amount, req.userId);

    // Запис транзакції
    db.prepare(`
      INSERT INTO transactions (user_id, type, amount, description)
      VALUES (?, 'deposit', ?, 'Поповнення балансу')
    `).run(req.userId, amount);

    const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.userId);

    res.json({ 
      message: 'Баланс поповнено',
      balance: user.balance 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;
