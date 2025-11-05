const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');

// Для Stripe webhook потрібен express як залежність
const app = express;

// Налаштування multer для завантаження файлів
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Дозволені лише зображення (jpeg, jpg, png)'));
    }
  }
});

// Отримання налаштувань платежів
router.get('/settings', authMiddleware, (req, res) => {
  try {
    const settings = db.prepare(`
      SELECT * FROM payment_settings WHERE is_active = 1
    `).all();

    // Додаємо повні URL для QR-кодів
    const settingsWithUrls = settings.map(setting => ({
      ...setting,
      qr_code_url: setting.qr_code_path 
        ? `http://localhost:5000/uploads/${path.basename(setting.qr_code_path)}`
        : null
    }));

    res.json(settingsWithUrls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Створення запиту на поповнення (криптовалюта)
router.post('/crypto/request', authMiddleware, upload.single('screenshot'), (req, res) => {
  try {
    const { paymentMethod, amount, transactionHash } = req.body;
    const screenshotPath = req.file ? req.file.filename : null;

    if (!paymentMethod || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Невірні дані' });
    }

    const result = db.prepare(`
      INSERT INTO payment_requests (user_id, payment_method, amount, transaction_hash, screenshot_path, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).run(req.userId, paymentMethod, parseFloat(amount), transactionHash || null, screenshotPath);

    res.status(201).json({
      message: 'Запит на поповнення створено. Очікуйте підтвердження.',
      requestId: result.lastInsertRowid
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Отримання історії платежів користувача
router.get('/history', authMiddleware, (req, res) => {
  try {
    const payments = db.prepare(`
      SELECT 
        pr.*,
        ps.payment_method as method_name
      FROM payment_requests pr
      LEFT JOIN payment_settings ps ON pr.payment_method = ps.payment_method
      WHERE pr.user_id = ?
      ORDER BY pr.created_at DESC
    `).all(req.userId);

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Отримання платежної ссылки Stripe
router.get('/stripe/payment-link', authMiddleware, async (req, res) => {
  try {
    const { amount = 100 } = req.query;

    if (!amount || amount < 10) {
      return res.status(400).json({ error: 'Мінімальна сума: 10 USD' });
    }

    // Отримуємо платежну ссылку з .env
    const paymentLink = process.env.STRIPE_PAYMENT_LINK;
    
    if (!paymentLink) {
      return res.status(400).json({ error: 'Платежна ссылка не налаштована' });
    }

    // Додаємо userId в metadata через URL параметри
    const urlWithParams = `${paymentLink}?client_reference_id=${req.userId}&prefilled_amount=${Math.round(amount * 100)}`;

    res.json({ 
      url: urlWithParams,
      message: 'Перейдіть за посиланням для оплати'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Stripe Webhook для автоматичного підтвердження платежів
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    } else {
      event = req.body;
    }

    // Обробка успішного платежу
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const amount = session.amount_total / 100; // Конвертуємо з центів

      if (userId && amount) {
        // Оновлюємо баланс користувача
        const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId);
        
        if (user) {
          const newBalance = user.balance + amount;
          db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, userId);

          // Створюємо транзакцію
          db.prepare(`
            INSERT INTO transactions (user_id, type, amount, description)
            VALUES (?, 'deposit', ?, ?)
          `).run(userId, amount, `Поповнення через Stripe (Session: ${session.id})`);

          console.log(`✅ Stripe payment confirmed: User ${userId}, Amount ${amount} USD`);
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Помилка обробки webhook' });
  }
});

// Старий endpoint (залишаємо для сумісності)
router.post('/stripe/create-intent', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Невірна сума' });
    }

    res.json({
      message: 'Використовуйте /stripe/payment-link для оплати',
      redirectTo: '/stripe/payment-link'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;
