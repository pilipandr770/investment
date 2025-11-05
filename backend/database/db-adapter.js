const { Pool } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');

let db;
let isPostgres = false;

// Initialize database based on environment
function initializeDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl && databaseUrl.startsWith('postgres')) {
    // PostgreSQL for production (Render.com)
    console.log('📊 Connecting to PostgreSQL database...');
    isPostgres = true;
    
    db = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
    });
    
    return db;
  } else {
    // SQLite for local development
    console.log('📊 Using SQLite database (development mode)');
    isPostgres = false;
    
    const dbPath = path.join(__dirname, 'investment.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    
    return db;
  }
}

// Wrapper functions to handle both SQLite and PostgreSQL
const dbWrapper = {
  // Execute a query (no return value)
  async run(sql, params = []) {
    if (isPostgres) {
      const result = await db.query(sql, params);
      return { changes: result.rowCount, lastID: result.rows[0]?.id };
    } else {
      const stmt = db.prepare(sql);
      return stmt.run(params);
    }
  },
  
  // Get a single row
  async get(sql, params = []) {
    if (isPostgres) {
      const result = await db.query(sql, params);
      return result.rows[0];
    } else {
      const stmt = db.prepare(sql);
      return stmt.get(params);
    }
  },
  
  // Get multiple rows
  async all(sql, params = []) {
    if (isPostgres) {
      const result = await db.query(sql, params);
      return result.rows;
    } else {
      const stmt = db.prepare(sql);
      return stmt.all(params);
    }
  },
  
  // Execute raw SQL (for migrations)
  async exec(sql) {
    if (isPostgres) {
      await db.query(sql);
    } else {
      db.exec(sql);
    }
  },
  
  // Close connection
  async close() {
    if (isPostgres) {
      await db.end();
    } else {
      db.close();
    }
  }
};

module.exports = {
  initializeDatabase,
  dbWrapper,
  isPostgres: () => isPostgres
};
