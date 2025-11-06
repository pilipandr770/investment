const { initializeDatabase, dbWrapper, isPostgres } = require('./db-adapter');
const { checkAndFixSchema } = require('./schema-fix');

// Initialize database tables
async function runMigrations() {
  const db = initializeDatabase();
  
  console.log('🔧 Running database migrations...');
  
  if (isPostgres()) {
    // Create schema if specified
    const schemaName = process.env.DB_SCHEMA || 'investment';
    
    console.log(`📦 Creating schema: ${schemaName}`);
    await dbWrapper.exec(`
      CREATE SCHEMA IF NOT EXISTS ${schemaName};
      SET search_path TO ${schemaName}, public;
    `);
    
    console.log(`✅ Using schema: ${schemaName}`);
    
    // Проверяем и исправляем структуру схемы при необходимости
    await checkAndFixSchema();
    
    // PostgreSQL schema
    await dbWrapper.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        role VARCHAR(50) DEFAULT 'user',
        balance DECIMAL(15,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS deposits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        amount DECIMAL(15,2) NOT NULL,
        payment_method VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS investment_products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        min_investment DECIMAL(15,2) NOT NULL,
        expected_return DECIMAL(5,2) NOT NULL,
        duration_months INTEGER NOT NULL,
        risk_level VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_investments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_id INTEGER REFERENCES investment_products(id),
        amount DECIMAL(15,2) NOT NULL,
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        current_value DECIMAL(15,2)
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payment_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        payment_method VARCHAR(50) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        transaction_hash VARCHAR(255),
        screenshot_path VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        processed_at TIMESTAMP,
        processed_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payment_settings (
        id SERIAL PRIMARY KEY,
        method VARCHAR(50) UNIQUE NOT NULL,
        wallet_address VARCHAR(255),
        qr_code_path VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        stripe_account_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS social_links (
        id SERIAL PRIMARY KEY,
        platform VARCHAR(50) UNIQUE NOT NULL,
        url VARCHAR(500) NOT NULL,
        icon VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS withdrawals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        wallet_address VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
      CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
      CREATE INDEX IF NOT EXISTS idx_user_investments_user_id ON user_investments(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_investments_status ON user_investments(status);
      CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
      CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
      CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id ON payment_requests(user_id);
      CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    `);
  } else {
    // SQLite schema (development)
    await dbWrapper.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        balance REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS deposits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        amount REAL NOT NULL,
        payment_method TEXT,
        status TEXT DEFAULT 'pending',
        transaction_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        roi REAL NOT NULL,
        min_investment REAL NOT NULL,
        max_investment REAL,
        duration_days INTEGER NOT NULL,
        risk_level TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS investments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_id INTEGER,
        amount REAL NOT NULL,
        start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_date DATETIME,
        status TEXT DEFAULT 'active',
        profit REAL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      );

      CREATE TABLE IF NOT EXISTS payment_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        method TEXT UNIQUE NOT NULL,
        wallet_address TEXT,
        qr_code_path TEXT,
        is_active INTEGER DEFAULT 1,
        stripe_account_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS social_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform TEXT UNIQUE NOT NULL,
        url TEXT NOT NULL,
        icon TEXT,
        is_active INTEGER DEFAULT 1,
        display_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS withdrawals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        amount REAL NOT NULL,
        payment_method TEXT,
        wallet_address TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
      CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
      CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
      CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
      CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
      CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
    `);
  }
  
  console.log('✅ Database migrations completed successfully!');
  
  // Insert default test data if in development
  if (process.env.NODE_ENV !== 'production') {
    await insertTestData();
  }
}

async function insertTestData() {
  try {
    // Check if admin user exists
    const adminExists = await dbWrapper.get(
      'SELECT id FROM users WHERE email = ?',
      ['admin@investment.com']
    );
    
    if (!adminExists) {
      console.log('📝 Inserting test data...');
      const bcrypt = require('bcryptjs');
      const adminPassword = await bcrypt.hash('admin123', 10);
      
      // Insert admin user
      await dbWrapper.run(
        'INSERT INTO users (email, password, role, balance) VALUES (?, ?, ?, ?)',
        ['admin@investment.com', adminPassword, 'admin', 10000]
      );
      
      // Insert payment methods (crypto only, no Stripe)
      const paymentMethods = [
        ['USDT', '', '', true],
        ['Bitcoin', '', '', true],
        ['Ethereum', '', '', true]
      ];
      
      for (const method of paymentMethods) {
        await dbWrapper.run(
          'INSERT INTO payment_settings (method, wallet_address, qr_code_path, is_active) VALUES (?, ?, ?, ?)',
          method
        );
      }
      
      // Insert test products
      const products = [
        ['Консервативный', 'Низкий риск, стабильный доход', 8, 1000, 50000, 365, 'low', 'active'],
        ['Сбалансированный', 'Средний риск, хорошая доходность', 15, 5000, 100000, 180, 'medium', 'active'],
        ['Агрессивный', 'Высокий риск, максимальная прибыль', 30, 10000, 500000, 90, 'high', 'active']
      ];
      
      for (const product of products) {
        await dbWrapper.run(
          'INSERT INTO products (name, description, roi, min_investment, max_investment, duration_days, risk_level, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          product
        );
      }
      
      console.log('✅ Test data inserted!');
    }
  } catch (error) {
    console.error('Error inserting test data:', error);
  }
}

module.exports = { runMigrations };
