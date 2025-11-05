const express = require('express');
const router = express.Router();
const { dbWrapper } = require('../database/db-adapter');
const authMiddleware = require('../middleware/auth');

// Отримання всіх інвестиційних продуктів
router.get('/', async (req, res) => {
  try {
    const products = await dbWrapper.all(`SELECT * FROM investment_products WHERE is_active = 1 ORDER BY expected_return DESC`);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Отримання конкретного продукту
router.get('/:id', async (req, res) => {
  try {
    const product = await dbWrapper.get('SELECT * FROM investment_products WHERE id = ?', [req.params.id]);

    if (!product) {
      return res.status(404).json({ error: 'Продукт не знайдено' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Створення інвестиції
router.post('/invest', authMiddleware, async (req, res) => {
  try {
    const { productId, amount } = req.body;

    // Валідація
    if (!productId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Невірні дані' });
    }

    // Перевірка продукту
    const product = await dbWrapper.get('SELECT * FROM investment_products WHERE id = ? AND is_active = 1', [productId]);

    if (!product) {
      return res.status(404).json({ error: 'Продукт не знайдено' });
    }

    if (amount < product.min_investment) {
      return res.status(400).json({ 
        error: `Мінімальна сума інвестиції: ${product.min_investment} грн` 
      });
    }

    // Перевірка балансу
  const user = await dbWrapper.get('SELECT balance FROM users WHERE id = ?', [req.userId]);
    
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Недостатньо коштів на балансі' });
    }

    // Розрахунок дати закінчення
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + product.duration_months);

    // Створення інвестиції
    const insertRes = await dbWrapper.run(
      'INSERT INTO user_investments (user_id, product_id, amount, end_date, current_value) VALUES (?, ?, ?, ?, ?)',
      [req.userId, productId, amount, endDate.toISOString(), amount]
    );

    // Зменшення балансу
    await dbWrapper.run('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, req.userId]);

    // Запис транзакції
    await dbWrapper.run('INSERT INTO transactions (user_id, type, amount, description) VALUES (?, ?, ?, ?)', [req.userId, 'investment', amount, `Інвестиція в ${product.name}`]);

    const investmentId = insertRes.lastInsertRowid || insertRes.lastID || insertRes.insertId || (insertRes.rows && insertRes.rows[0] && insertRes.rows[0].id);

    res.status(201).json({ message: 'Інвестицію створено', investmentId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Отримання інвестицій користувача
router.get('/my/all', authMiddleware, async (req, res) => {
  try {
    const investments = await dbWrapper.all(
      `SELECT ui.*, ip.name as product_name, ip.expected_return, ip.risk_level, ip.category FROM user_investments ui JOIN investment_products ip ON ui.product_id = ip.id WHERE ui.user_id = ? ORDER BY ui.start_date DESC`,
      [req.userId]
    );

    res.json(investments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;
