const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'investment.db'));

console.log('🔄 Створення таблиці для соціальних мереж...');

try {
  // Створюємо таблицю для налаштувань соціальних мереж
  db.exec(`
    CREATE TABLE IF NOT EXISTS social_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT UNIQUE NOT NULL,
      url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ Таблиця social_links створена');

  // Додаємо початкові записи для соціальних мереж
  const platforms = ['facebook', 'instagram', 'twitter', 'telegram'];
  
  platforms.forEach(platform => {
    const existing = db.prepare('SELECT * FROM social_links WHERE platform = ?').get(platform);
    
    if (!existing) {
      db.prepare(`
        INSERT INTO social_links (platform, url, is_active)
        VALUES (?, ?, ?)
      `).run(platform, '', 0);
      
      console.log(`✅ Додано платформу: ${platform}`);
    } else {
      console.log(`ℹ️  Платформа ${platform} вже існує`);
    }
  });

  console.log('✅ Міграція завершена успішно!');
} catch (error) {
  console.error('❌ Помилка міграції:', error);
  process.exit(1);
}

db.close();
