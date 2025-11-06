const { Pool } = require('pg');
const path = require('path');

let Database;
try {
  Database = require('better-sqlite3');
} catch (e) {
  // better-sqlite3 не установлен (production с PostgreSQL)
  Database = null;
}

let db;
let isPostgres = false;

// Initialize database based on environment
function initializeDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  const schemaName = process.env.DB_SCHEMA || 'investment';
  
  if (databaseUrl && databaseUrl.startsWith('postgres')) {
    // PostgreSQL for production (Render.com)
    console.log('📊 Connecting to PostgreSQL database...');
    console.log(`📦 Using schema: ${schemaName}`);
    isPostgres = true;
    
    db = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false,
      // Set schema in connection
      options: `-c search_path=${schemaName},public`
    });
    
    return db;
  } else {
    // SQLite for local development
    if (!Database) {
      throw new Error('SQLite (better-sqlite3) not available. Set DATABASE_URL for PostgreSQL or install better-sqlite3 for development.');
    }
    
    console.log('📊 Using SQLite database (development mode)');
    isPostgres = false;
    
    const dbPath = path.join(__dirname, 'investment.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    
    return db;
  }
}

// Convert SQLite ? placeholders to PostgreSQL $1, $2, $3 format
function convertPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

// Wrapper functions to handle both SQLite and PostgreSQL
const dbWrapper = {
  // Execute a query (no return value)
  async run(sql, params = []) {
    if (isPostgres) {
      let pgSql = convertPlaceholders(sql);
      
      // Add RETURNING id for INSERT statements to get the inserted ID
      if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
        pgSql += ' RETURNING id';
      }
      
      const result = await db.query(pgSql, params);
      return { 
        changes: result.rowCount, 
        lastID: result.rows[0]?.id,
        lastInsertRowid: result.rows[0]?.id,
        rows: result.rows
      };
    } else {
      const stmt = db.prepare(sql);
      return stmt.run(params);
    }
  },
  
  // Get a single row
  async get(sql, params = []) {
    if (isPostgres) {
      const pgSql = convertPlaceholders(sql);
      const result = await db.query(pgSql, params);
      return result.rows[0];
    } else {
      const stmt = db.prepare(sql);
      return stmt.get(params);
    }
  },
  
  // Get multiple rows
  async all(sql, params = []) {
    if (isPostgres) {
      const pgSql = convertPlaceholders(sql);
      const result = await db.query(pgSql, params);
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
