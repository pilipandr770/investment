const express = require('express');
const router = express.Router();
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/adminAuth');

// Застосовуємо обидва middleware до всіх маршрутів адміна
router.use(authMiddleware);
router.use(adminAuthMiddleware);

// Отримання всіх користувачів
router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, email, full_name, phone, balance, role, created_at
      FROM users
      ORDER BY created_at DESC
    `).all();

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Отримання статистики платформи
router.get('/stats', (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const totalInvestments = db.prepare('SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM user_investments').get();
    const activeInvestments = db.prepare('SELECT COUNT(*) as count FROM user_investments WHERE status = ? OR status = ?').get('active', 'pending');
    const products = db.prepare('SELECT COUNT(*) as count FROM investment_products').get();
    
    res.json({
      totalUsers: totalUsers.count,
      totalInvestments: totalInvestments.count,
      totalInvestedAmount: totalInvestments.total,
      activeInvestments: activeInvestments.count,
      totalProducts: products.count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Створення нового інвестиційного продукту
router.post('/products', (req, res) => {
  try {
    console.log('=== CREATE PRODUCT ===');
    console.log('Request body:', req.body);

    const { 
      name, 
      description, 
      min_investment, 
      expected_return, 
      duration_months, 
      risk_level, 
      category,
      is_active
    } = req.body;

    if (!name || !min_investment || !expected_return || !duration_months || !risk_level || !category) {
      console.error('Validation error: missing required fields');
      return res.status(400).json({ error: 'Заповніть всі обов\'язкові поля' });
    }

    const activeStatus = is_active !== false ? 1 : 0;
    console.log('Creating product with active status:', activeStatus);

    const result = db.prepare(`
      INSERT INTO investment_products (name, description, min_investment, expected_return, duration_months, risk_level, category, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name, 
      description || '', 
      min_investment, 
      expected_return, 
      duration_months, 
      risk_level, 
      category,
      activeStatus
    );

    console.log('✅ Product created:', result.lastInsertRowid);

    res.status(201).json({
      message: 'Продукт створено',
      productId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('❌ Create error:', error);
    res.status(500).json({ error: 'Помилка сервера: ' + error.message });
  }
});

// Оновлення інвестиційного продукту
router.put('/products/:id', (req, res) => {
  try {
    console.log('=== UPDATE PRODUCT ===');
    console.log('Product ID:', req.params.id);
    console.log('Request body:', req.body);

    const { 
      name, 
      description, 
      min_investment, 
      expected_return, 
      duration_months, 
      risk_level, 
      category, 
      isActive,
      is_active
    } = req.body;

    // Валідація обов'язкових полів
    if (!name || !min_investment || !expected_return || !duration_months || !risk_level || !category) {
      console.error('Validation error: missing required fields');
      return res.status(400).json({ error: 'Заповніть всі обов\'язкові поля' });
    }

    // Підтримуємо обидва варіанти: isActive та is_active
    const activeStatus = (isActive !== undefined ? isActive : is_active) ? 1 : 0;

    console.log('Active status:', activeStatus);
    console.log('Updating product with:', {
      name, 
      description, 
      min_investment, 
      expected_return, 
      duration_months, 
      risk_level, 
      category, 
      activeStatus
    });

    const result = db.prepare(`
      UPDATE investment_products
      SET name = ?, description = ?, min_investment = ?, expected_return = ?, 
          duration_months = ?, risk_level = ?, category = ?, is_active = ?
      WHERE id = ?
    `).run(
      name, 
      description || '', 
      min_investment, 
      expected_return, 
      duration_months, 
      risk_level, 
      category, 
      activeStatus, 
      req.params.id
    );

    console.log('Update result:', result);

    if (result.changes === 0) {
      console.error('No rows updated - product not found?');
      return res.status(404).json({ error: 'Продукт не знайдено' });
    }

    console.log('✅ Product updated successfully');
    res.json({ 
      message: 'Продукт оновлено',
      changes: result.changes 
    });
  } catch (error) {
    console.error('❌ Update error:', error);
    res.status(500).json({ error: 'Помилка сервера: ' + error.message });
  }
});

// Видалення (деактивація) інвестиційного продукту
router.delete('/products/:id', (req, res) => {
  try {
    db.prepare(`
      UPDATE investment_products SET is_active = 0 WHERE id = ?
    `).run(req.params.id);

    res.json({ message: 'Продукт деактивовано' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Отримання всіх інвестицій з інформацією про користувачів
router.get('/investments', (req, res) => {
  try {
    const investments = db.prepare(`
      SELECT 
        ui.*,
        u.email as user_email,
        u.full_name as user_name,
        ip.name as product_name
      FROM user_investments ui
      JOIN users u ON ui.user_id = u.id
      JOIN investment_products ip ON ui.product_id = ip.id
      ORDER BY ui.start_date DESC
    `).all();

    res.json(investments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Зміна ролі користувача
router.put('/users/:id/role', (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Невірна роль' });
    }

    db.prepare(`
      UPDATE users SET role = ? WHERE id = ?
    `).run(role, req.params.id);

    res.json({ message: 'Роль користувача оновлено' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// === ПЛАТІЖНІ НАЛАШТУВАННЯ ===

// Отримання платіжних налаштувань
router.get('/payment-settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM payment_settings').all();
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Оновлення платіжних налаштувань
router.put('/payment-settings/:method', (req, res) => {
  try {
    const { address, isActive } = req.body;
    const { method } = req.params;

    db.prepare(`
      UPDATE payment_settings
      SET address = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE payment_method = ?
    `).run(address, isActive ? 1 : 0, method);

    res.json({ message: 'Налаштування оновлено' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Завантаження QR-коду
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const method = req.params.method;
    cb(null, `qr-${method}-${Date.now()}${path.extname(file.originalname)}`);
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
      cb(new Error('Дозволені лише зображення'));
    }
  }
});

router.post('/payment-settings/:method/qr', upload.single('qrCode'), (req, res) => {
  try {
    const { method } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не завантажено' });
    }

    // Видалення старого QR-коду
    const oldSetting = db.prepare('SELECT qr_code_path FROM payment_settings WHERE payment_method = ?').get(method);
    if (oldSetting && oldSetting.qr_code_path) {
      const oldPath = path.join(__dirname, '../uploads', oldSetting.qr_code_path);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
          console.log('Старий QR-код видалено:', oldPath);
        } catch (err) {
          console.error('Помилка видалення старого QR:', err);
        }
      }
    }

    // Збереження тільки імені файлу
    db.prepare(`
      UPDATE payment_settings
      SET qr_code_path = ?, updated_at = CURRENT_TIMESTAMP
      WHERE payment_method = ?
    `).run(req.file.filename, method);

    console.log('QR-код збережено:', req.file.filename);

    res.json({ 
      message: 'QR-код завантажено успішно',
      filename: req.file.filename,
      url: `http://localhost:5000/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Помилка завантаження QR:', error);
    res.status(500).json({ error: 'Помилка сервера: ' + error.message });
  }
});

// Отримання запитів на поповнення
router.get('/payment-requests', (req, res) => {
  try {
    const requests = db.prepare(`
      SELECT 
        pr.*,
        u.email as user_email,
        u.full_name as user_name
      FROM payment_requests pr
      JOIN users u ON pr.user_id = u.id
      ORDER BY 
        CASE pr.status 
          WHEN 'pending' THEN 1 
          WHEN 'approved' THEN 2 
          WHEN 'rejected' THEN 3 
        END,
        pr.created_at DESC
    `).all();

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Обробка запиту на поповнення
router.put('/payment-requests/:id', (req, res) => {
  try {
    const { status, notes } = req.body;
    const requestId = req.params.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Невірний статус' });
    }

    // Отримання інформації про запит
    const request = db.prepare('SELECT * FROM payment_requests WHERE id = ?').get(requestId);
    
    if (!request) {
      return res.status(404).json({ error: 'Запит не знайдено' });
    }

    // Оновлення статусу запиту
    db.prepare(`
      UPDATE payment_requests
      SET status = ?, notes = ?, processed_at = CURRENT_TIMESTAMP, processed_by = ?
      WHERE id = ?
    `).run(status, notes || null, req.userId, requestId);

    // Якщо схвалено - поповнюємо баланс
    if (status === 'approved') {
      db.prepare(`
        UPDATE users SET balance = balance + ? WHERE id = ?
      `).run(request.amount, request.user_id);

      // Запис транзакції
      db.prepare(`
        INSERT INTO transactions (user_id, type, amount, description)
        VALUES (?, 'deposit', ?, ?)
      `).run(request.user_id, request.amount, `Поповнення через ${request.payment_method}`);
    }

    res.json({ message: 'Запит оброблено' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// ===== УПРАВЛІННЯ СОЦІАЛЬНИМИ МЕРЕЖАМИ =====

// Отримання налаштувань соціальних мереж
router.get('/social-links', (req, res) => {
  try {
    console.log('=== GET SOCIAL LINKS ===');
    
    const links = db.prepare(`
      SELECT * FROM social_links ORDER BY platform
    `).all();

    console.log('✅ Social links:', links);
    res.json(links);
  } catch (error) {
    console.error('❌ Get social links error:', error);
    res.status(500).json({ error: 'Помилка сервера: ' + error.message });
  }
});

// Оновлення налаштувань соціальних мереж
router.put('/social-links', (req, res) => {
  try {
    console.log('=== UPDATE SOCIAL LINKS ===');
    console.log('Request body:', req.body);

    const { facebook, instagram, twitter, telegram } = req.body;

    // Оновлюємо кожну платформу
    const platforms = {
      facebook: facebook || { url: '', is_active: false },
      instagram: instagram || { url: '', is_active: false },
      twitter: twitter || { url: '', is_active: false },
      telegram: telegram || { url: '', is_active: false }
    };

    Object.entries(platforms).forEach(([platform, data]) => {
      const activeStatus = data.is_active ? 1 : 0;
      
      db.prepare(`
        UPDATE social_links
        SET url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE platform = ?
      `).run(data.url || '', activeStatus, platform);

      console.log(`✅ Updated ${platform}:`, data.url, 'Active:', activeStatus);
    });

    res.json({ message: 'Налаштування соціальних мереж оновлено' });
  } catch (error) {
    console.error('❌ Update social links error:', error);
    res.status(500).json({ error: 'Помилка сервера: ' + error.message });
  }
});

module.exports = router;
