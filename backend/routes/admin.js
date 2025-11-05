const express = require('express');
const router = express.Router();
const { dbWrapper } = require('../database/db-adapter');
const authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/adminAuth');

// Застосовуємо обидва middleware до всіх маршрутів адміна
router.use(authMiddleware);
router.use(adminAuthMiddleware);

// Отримання всіх користувачів
router.get('/users', async (req, res) => {
  try {
    const users = await dbWrapper.all(`SELECT id, email, full_name, phone, balance, role, created_at FROM users ORDER BY created_at DESC`);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Отримання статистики платформи
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await dbWrapper.get('SELECT COUNT(*) as count FROM users');
    const totalInvestments = await dbWrapper.get('SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM user_investments');
    const activeInvestments = await dbWrapper.get('SELECT COUNT(*) as count FROM user_investments WHERE status = ? OR status = ?', ['active', 'pending']);
    const products = await dbWrapper.get('SELECT COUNT(*) as count FROM investment_products');

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
router.post('/products', async (req, res) => {
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

    const result = await dbWrapper.run(
      `INSERT INTO investment_products (name, description, min_investment, expected_return, duration_months, risk_level, category, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)` ,
      [name, description || '', min_investment, expected_return, duration_months, risk_level, category, activeStatus]
    );

    const productId = result.lastInsertRowid || result.lastID || result.insertId || (result.rows && result.rows[0] && result.rows[0].id);
    console.log('✅ Product created:', productId);

    res.status(201).json({ message: 'Продукт створено', productId });
  } catch (error) {
    console.error('❌ Create error:', error);
    res.status(500).json({ error: 'Помилка сервера: ' + error.message });
  }
});

// Оновлення інвестиційного продукту
router.put('/products/:id', async (req, res) => {
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

    const result = await dbWrapper.run(
      `UPDATE investment_products SET name = ?, description = ?, min_investment = ?, expected_return = ?, duration_months = ?, risk_level = ?, category = ?, is_active = ? WHERE id = ?`,
      [name, description || '', min_investment, expected_return, duration_months, risk_level, category, activeStatus, req.params.id]
    );

    const changes = result.changes || result.rowCount || 0;
    if (changes === 0) return res.status(404).json({ error: 'Продукт не знайдено' });

    console.log('✅ Product updated successfully');
    res.json({ message: 'Продукт оновлено', changes });
  } catch (error) {
    console.error('❌ Update error:', error);
    res.status(500).json({ error: 'Помилка сервера: ' + error.message });
  }
});

// Видалення (деактивація) інвестиційного продукту
router.delete('/products/:id', async (req, res) => {
  try {
    await dbWrapper.run('UPDATE investment_products SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Продукт деактивовано' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Отримання всіх інвестицій з інформацією про користувачів
router.get('/investments', async (req, res) => {
  try {
    const investments = await dbWrapper.all(`SELECT ui.*, u.email as user_email, u.full_name as user_name, ip.name as product_name FROM user_investments ui JOIN users u ON ui.user_id = u.id JOIN investment_products ip ON ui.product_id = ip.id ORDER BY ui.start_date DESC`);
    res.json(investments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Зміна ролі користувача
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Невірна роль' });
    }

    await dbWrapper.run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: 'Роль користувача оновлено' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// === ПЛАТІЖНІ НАЛАШТУВАННЯ ===

// Отримання платіжних налаштувань
router.get('/payment-settings', async (req, res) => {
  try {
    const settings = await dbWrapper.all('SELECT * FROM payment_settings');
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Оновлення платіжних налаштувань
router.put('/payment-settings/:method', async (req, res) => {
  try {
    const { address, isActive } = req.body;
    const { method } = req.params;

    await dbWrapper.run('UPDATE payment_settings SET address = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE payment_method = ?', [address, isActive ? 1 : 0, method]);

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

router.post('/payment-settings/:method/qr', upload.single('qrCode'), async (req, res) => {
  try {
    const { method } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не завантажено' });
    }

    // Видалення старого QR-коду
  const oldSetting = await dbWrapper.get('SELECT qr_code_path FROM payment_settings WHERE payment_method = ?', [method]);
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
    await dbWrapper.run('UPDATE payment_settings SET qr_code_path = ?, updated_at = CURRENT_TIMESTAMP WHERE payment_method = ?', [req.file.filename, method]);

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
router.get('/payment-requests', async (req, res) => {
  try {
    const requests = await dbWrapper.all(`SELECT pr.*, u.email as user_email, u.full_name as user_name FROM payment_requests pr JOIN users u ON pr.user_id = u.id ORDER BY CASE pr.status WHEN 'pending' THEN 1 WHEN 'approved' THEN 2 WHEN 'rejected' THEN 3 END, pr.created_at DESC`);
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Обробка запиту на поповнення
router.put('/payment-requests/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const requestId = req.params.id;

    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Невірний статус' });

    // Отримання інформації про запит
    const request = await dbWrapper.get('SELECT * FROM payment_requests WHERE id = ?', [requestId]);
    if (!request) return res.status(404).json({ error: 'Запит не знайдено' });

    // Оновлення статусу запиту
    await dbWrapper.run('UPDATE payment_requests SET status = ?, notes = ?, processed_at = CURRENT_TIMESTAMP, processed_by = ? WHERE id = ?', [status, notes || null, req.userId, requestId]);

    // Якщо схвалено - поповнюємо баланс
    if (status === 'approved') {
      await dbWrapper.run('UPDATE users SET balance = balance + ? WHERE id = ?', [request.amount, request.user_id]);

      // Запис транзакції
      await dbWrapper.run('INSERT INTO transactions (user_id, type, amount, description) VALUES (?, ?, ?, ?)', [request.user_id, 'deposit', request.amount, `Поповнення через ${request.payment_method}`]);
    }

    res.json({ message: 'Запит оброблено' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// ===== УПРАВЛІННЯ СОЦІАЛЬНИМИ МЕРЕЖАМИ =====

// Отримання налаштувань соціальних мереж
router.get('/social-links', async (req, res) => {
  try {
    console.log('=== GET SOCIAL LINKS ===');
    const links = await dbWrapper.all('SELECT * FROM social_links ORDER BY platform');
    console.log('✅ Social links:', links);
    res.json(links);
  } catch (error) {
    console.error('❌ Get social links error:', error);
    res.status(500).json({ error: 'Помилка сервера: ' + error.message });
  }
});

// Оновлення налаштувань соціальних мереж
router.put('/social-links', async (req, res) => {
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

    for (const [platform, data] of Object.entries(platforms)) {
      const activeStatus = data.is_active ? 1 : 0;
      await dbWrapper.run('UPDATE social_links SET url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE platform = ?', [data.url || '', activeStatus, platform]);
      console.log(`✅ Updated ${platform}:`, data.url, 'Active:', activeStatus);
    }

    res.json({ message: 'Налаштування соціальних мереж оновлено' });
  } catch (error) {
    console.error('❌ Update social links error:', error);
    res.status(500).json({ error: 'Помилка сервера: ' + error.message });
  }
});

module.exports = router;
