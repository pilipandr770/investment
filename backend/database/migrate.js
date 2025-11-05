const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'investment.db'));

console.log('🔄 Запуск міграції бази даних...');

try {
  // Перевірка чи існує колонка role
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasRoleColumn = tableInfo.some(column => column.name === 'role');

  if (!hasRoleColumn) {
    console.log('➕ Додаємо колонку role до таблиці users...');
    db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`);
    console.log('✅ Колонку role додано');
  } else {
    console.log('✓ Колонка role вже існує');
  }

  // Встановлюємо роль адміністратора для вашого email
  const adminEmail = 'pilpandr79@icloud.com';
  const result = db.prepare(`
    UPDATE users SET role = 'admin' WHERE email = ?
  `).run(adminEmail);

  if (result.changes > 0) {
    console.log(`✅ Користувач ${adminEmail} тепер адміністратор`);
  } else {
    console.log(`ℹ️  Користувач ${adminEmail} не знайдений (можливо ще не зареєстрований)`);
  }

  console.log('✅ Міграція завершена успішно!');
} catch (error) {
  console.error('❌ Помилка міграції:', error.message);
  process.exit(1);
}

db.close();
