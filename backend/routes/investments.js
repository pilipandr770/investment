const express = require('express');
const router = express.Router();
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');

// Отримання всіх інвестиційних продуктів
router.get('/', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT * FROM investment_products
      WHERE is_active = 1
      ORDER BY expected_return DESC
    `).all();

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Отримання конкретного продукту
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare(`
      SELECT * FROM investment_products WHERE id = ?
    `).get(req.params.id);

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
router.post('/invest', authMiddleware, (req, res) => {
  try {
    const { productId, amount } = req.body;

    // Валідація
    if (!productId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Невірні дані' });
    }

    // Перевірка продукту
    const product = db.prepare(`
      SELECT * FROM investment_products WHERE id = ? AND is_active = 1
    `).get(productId);

    if (!product) {
      return res.status(404).json({ error: 'Продукт не знайдено' });
    }

    if (amount < product.min_investment) {
      return res.status(400).json({ 
        error: `Мінімальна сума інвестиції: ${product.min_investment} грн` 
      });
    }

    // Перевірка балансу
    const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.userId);
    
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Недостатньо коштів на балансі' });
    }

    // Розрахунок дати закінчення
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + product.duration_months);

    // Створення інвестиції
    const result = db.prepare(`
      INSERT INTO user_investments (user_id, product_id, amount, end_date, current_value)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.userId, productId, amount, endDate.toISOString(), amount);

    // Зменшення балансу
    db.prepare(`
      UPDATE users SET balance = balance - ? WHERE id = ?
    `).run(amount, req.userId);

    // Запис транзакції
    db.prepare(`
      INSERT INTO transactions (user_id, type, amount, description)
      VALUES (?, 'investment', ?, ?)
    `).run(req.userId, amount, `Інвестиція в ${product.name}`);

    res.status(201).json({
      message: 'Інвестицію створено',
      investmentId: result.lastInsertRowid
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Отримання інвестицій користувача
router.get('/my/all', authMiddleware, (req, res) => {
  try {
    const investments = db.prepare(`
      SELECT 
        ui.*,
        ip.name as product_name,
        ip.expected_return,
        ip.risk_level,
        ip.category
      FROM user_investments ui
      JOIN investment_products ip ON ui.product_id = ip.id
      WHERE ui.user_id = ?
      ORDER BY ui.start_date DESC
    `).all(req.userId);

    res.json(investments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;
