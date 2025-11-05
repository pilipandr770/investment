const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'investment.db'));

console.log('🔄 Додавання тестових платіжних даних...');

try {
  // Тестові адреси для криптовалют
  const testAddresses = {
    bitcoin: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    usdt_trc20: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
    usdt_erc20: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  };

  // Оновлення адрес
  Object.entries(testAddresses).forEach(([method, address]) => {
    const result = db.prepare(`
      UPDATE payment_settings
      SET address = ?
      WHERE payment_method = ?
    `).run(address, method);
    
    if (result.changes > 0) {
      console.log(`✅ Додано адресу для ${method}: ${address}`);
    }
  });

  console.log('✅ Тестові платіжні дані додано!');
  console.log('\nℹ️ Ви можете редагувати ці адреси в адмін-панелі');
  console.log('ℹ️ QR-коди можна завантажити через форму в адмін-панелі');
} catch (error) {
  console.error('❌ Помилка:', error.message);
  process.exit(1);
}

db.close();
