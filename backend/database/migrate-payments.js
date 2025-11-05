const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'investment.db'));

console.log('🔄 Запуск міграції для платіжних налаштувань...');

try {
  // Створення таблиці для платіжних налаштувань
  db.exec(`
    CREATE TABLE IF NOT EXISTS payment_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_method TEXT NOT NULL,
      address TEXT,
      qr_code_path TEXT,
      is_active INTEGER DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payment_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      transaction_hash TEXT,
      screenshot_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed_at DATETIME,
      processed_by INTEGER,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (processed_by) REFERENCES users(id)
    );
  `);

  console.log('✅ Таблиці для платежів створено');

  // Додаємо початкові налаштування для криптовалют
  const existingSettings = db.prepare('SELECT COUNT(*) as count FROM payment_settings').get();
  
  if (existingSettings.count === 0) {
    db.prepare(`
      INSERT INTO payment_settings (payment_method, address, is_active)
      VALUES 
        ('bitcoin', '', 1),
        ('usdt_trc20', '', 1),
        ('usdt_erc20', '', 1),
        ('stripe', '', 1)
    `).run();
    
    console.log('✅ Початкові платіжні налаштування додано');
  }

  console.log('✅ Міграція платіжних налаштувань завершена!');
} catch (error) {
  console.error('❌ Помилка міграції:', error.message);
  process.exit(1);
}

db.close();
