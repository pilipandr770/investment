const path = require('path');

let SQLite;
try {
  SQLite = require('better-sqlite3');
} catch (e) {
  SQLite = null;
}

if (SQLite) {
  // Local development using SQLite (original behaviour)
  const db = new SQLite(path.join(__dirname, 'investment.db'));

  // Create tables and seed data (same as before)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      balance REAL DEFAULT 0,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS investment_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      min_investment REAL NOT NULL,
      expected_return REAL NOT NULL,
      duration_months INTEGER NOT NULL,
      risk_level TEXT NOT NULL,
      category TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      end_date DATETIME,
      status TEXT DEFAULT 'active',
      current_value REAL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES investment_products(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Seed products if empty
  const seedProducts = () => {
    const count = db.prepare('SELECT COUNT(*) as count FROM investment_products').get();
    if (count.count === 0) {
      const insert = db.prepare(`
        INSERT INTO investment_products (name, description, min_investment, expected_return, duration_months, risk_level, category)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const products = [
        ['Облігації державні', 'Надійні державні облігації з фіксованим доходом', 1000, 8.5, 12, 'Низький', 'bonds'],
        ['Акції технологічних компаній', 'Інвестиції в топові технологічні компанії', 5000, 15.0, 24, 'Середній', 'stocks'],
        ['Нерухомість комерційна', 'Інвестиції в комерційну нерухомість', 50000, 12.0, 36, 'Середній', 'real_estate'],
        ['Стартапи IT сектор', 'Венчурні інвестиції в перспективні стартапи', 10000, 25.0, 48, 'Високий', 'venture'],
        ['Депозитний сертифікат', 'Банківський депозит з гарантованим доходом', 500, 6.0, 6, 'Мінімальний', 'deposits'],
        ['Золото та дорогоцінні метали', 'Інвестиції в фізичне золото та метали', 2000, 10.0, 12, 'Низький', 'commodities']
      ];

      products.forEach(product => insert.run(...product));
      console.log('✅ Тестові інвестиційні продукти додано');
    }
  };

  seedProducts();

  // Set admin role helper
  const setAdminRole = (email) => {
    try {
      const tableInfo = db.prepare("PRAGMA table_info(users)").all();
      const hasRoleColumn = tableInfo.some(column => column.name === 'role');
      if (hasRoleColumn) {
        const result = db.prepare(`UPDATE users SET role = 'admin' WHERE email = ?`).run(email);
        if (result.changes > 0) console.log(`✅ Користувач ${email} тепер адміністратор`);
      }
    } catch (e) {}
  };

  setTimeout(() => setAdminRole('pilpandr79@icloud.com'), 1000);

  module.exports = db;

} else {
  // Production: PostgreSQL via db-adapter. Provide a small shim that
  // implements the minimal API the rest of the code expects (prepare/get/all/run/exec).
  const { initializeDatabase, dbWrapper, isPostgres } = require('./db-adapter');

  // initializeDatabase will be called elsewhere (migrations.js). Here we just export
  // a minimal object with `prepare(sql)` returning an object with `get`, `all`, `run`.
  const prepare = (sql) => {
    return {
      get: (params = []) => dbWrapper.get(sql, params),
      all: (params = []) => dbWrapper.all(sql, params),
      run: async (params = []) => {
        // dbWrapper.run returns different shapes; normalize
        const res = await dbWrapper.run(sql, params);
        return res;
      }
    };
  };

  const shim = {
    prepare,
    exec: async (sql) => dbWrapper.exec(sql),
    // helper for legacy code expecting .pragma - no-op for Postgres
    pragma: () => {}
  };

  module.exports = shim;
}
