/**
 * Скрипт для автоматического исправления схемы PostgreSQL
 * Запускается перед основными миграциями
 * Удаляет старые таблицы в схеме investment и пересоздает их с правильной структурой
 */

const { dbWrapper, isPostgres } = require('./db-adapter');

async function checkAndFixSchema() {
  if (!isPostgres()) {
    console.log('✅ SQLite detected, no schema fix needed');
    return false;
  }

  const schemaName = process.env.DB_SCHEMA || 'investment';
  
  console.log(`🔍 Checking schema structure: ${schemaName}`);
  
  try {
    // Проверяем, существует ли таблица users с колонкой full_name
    const result = await dbWrapper.get(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = $1 
        AND table_name = 'users' 
        AND column_name = 'full_name';
    `, [schemaName]);
    
    if (!result) {
      // Таблица users существует, но без full_name - нужно пересоздать
      console.log('⚠️ Detected old schema structure (missing full_name column)');
      console.log('🔄 Recreating tables with correct structure...');
      
      await dropAllTablesInSchema(schemaName);
      
      console.log('✅ Old tables dropped, migrations will create new ones');
      return true;
    }
    
    // Проверяем название таблицы products vs investment_products
    const productsTable = await dbWrapper.get(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = $1 
        AND table_name = 'products';
    `, [schemaName]);
    
    if (productsTable) {
      // Старое название таблицы - нужно пересоздать
      console.log('⚠️ Detected old table name: products (should be investment_products)');
      console.log('🔄 Recreating tables with correct names...');
      
      await dropAllTablesInSchema(schemaName);
      
      console.log('✅ Old tables dropped, migrations will create new ones');
      return true;
    }
    
    console.log('✅ Schema structure is correct');
    return false;
    
  } catch (error) {
    // Таблица не существует вообще - это нормально
    console.log('✅ No existing tables found, will create fresh schema');
    return false;
  }
}

async function dropAllTablesInSchema(schemaName) {
  console.log(`🗑️  Dropping all tables in schema: ${schemaName}`);
  console.log('⚠️ This will NOT affect other schemas in your database!');
  
  await dbWrapper.exec(`
    SET search_path TO ${schemaName}, public;
    
    -- Удаляем таблицы в правильном порядке (сначала зависимые, потом основные)
    DROP TABLE IF EXISTS withdrawals CASCADE;
    DROP TABLE IF EXISTS social_links CASCADE;
    DROP TABLE IF EXISTS payment_settings CASCADE;
    DROP TABLE IF EXISTS deposits CASCADE;
    DROP TABLE IF EXISTS payment_requests CASCADE;
    DROP TABLE IF EXISTS transactions CASCADE;
    DROP TABLE IF EXISTS user_investments CASCADE;
    DROP TABLE IF EXISTS investment_products CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS investments CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);
  
  console.log(`✅ All tables dropped from schema: ${schemaName}`);
  console.log('💾 Other schemas in your database are NOT affected');
}

module.exports = { checkAndFixSchema };
