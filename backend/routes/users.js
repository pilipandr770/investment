const express = require('express');
const router = express.Router();
const { dbWrapper } = require('../database/db-adapter');
const authMiddleware = require('../middleware/auth');

// Отримання профілю
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await dbWrapper.get(
      `SELECT id, email, full_name, phone, balance, role, created_at FROM users WHERE id = ?`,
      [req.userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    // Отримання статистики інвестицій
    const stats = await dbWrapper.get(
      `SELECT COUNT(*) as total_investments, COALESCE(SUM(amount), 0) as total_invested, COALESCE(SUM(current_value), 0) as current_value FROM user_investments WHERE user_id = ? AND status = 'active'`,
      [req.userId]
    );

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
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, phone } = req.body;

    await dbWrapper.run(
      `UPDATE users SET full_name = ?, phone = ? WHERE id = ?`,
      [fullName, phone || null, req.userId]
    );

    res.json({ message: 'Профіль оновлено' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Поповнення балансу (для тесту)
router.post('/balance/add', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Невірна сума' });
    }

    await dbWrapper.run(`UPDATE users SET balance = balance + ? WHERE id = ?`, [amount, req.userId]);

    // Запис транзакції
    await dbWrapper.run(`INSERT INTO transactions (user_id, type, amount, description) VALUES (?, 'deposit', ?, 'Поповнення балансу')`, [req.userId, amount]);

    const user = await dbWrapper.get('SELECT balance FROM users WHERE id = ?', [req.userId]);

    res.json({ message: 'Баланс поповнено', balance: user.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;
